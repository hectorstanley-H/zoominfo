// Tester H GitHub Action orchestrator.
//
// Shells out to the tester-h CLI to do the actual work:
//   1. `tester-h replay-all --json [--no-strict]` — replays every recorded
//      journey in `.tester-h/trajectories/`. The CLI's hybrid mode auto-writes
//      device-specific variant files when semantic fallback recovers a step;
//      we just notice them via a before/after snapshot of the directory.
//   2. `tester-h audit <app_url> --json` (optional) — deterministic SEO,
//      accessibility, links and html-hygiene checks on the running app.
//   3. Diff-aware suggestion pass (optional, PR-only): for each new journey,
//      `tester-h --local --record <name> "<diff-aware task>"`.
//
// After every phase we diff the trajectories directory; any new files (auto-
// corrected variants OR freshly recorded suggestions) get rolled into a single
// PR comment that proposes the commit.
import { spawn } from 'node:child_process';
import { appendFileSync, existsSync, mkdirSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { loadConfig } from './config.js';
import { fetchPrInfo, postPrComment } from './github.js';
import { buildComment } from './comment.js';
import { runPlanner } from './planner.js';
const repoRoot = process.env.GITHUB_WORKSPACE || process.cwd();
function log(msg) {
    process.stdout.write(`[Tester H] ${msg}\n`);
}
function setOutput(name, value) {
    const out = process.env.GITHUB_OUTPUT;
    if (!out)
        return;
    // GitHub multiline-output syntax (works for any value, including newlines).
    const delim = `EOF_${Math.random().toString(36).slice(2)}`;
    appendFileSync(out, `${name}<<${delim}\n${value}\n${delim}\n`);
}
function writeStepSummary(md) {
    const f = process.env.GITHUB_STEP_SUMMARY;
    if (f)
        appendFileSync(f, md + '\n');
}
// ── Trajectory dir snapshot ──
//
// We want to know which files the CLI produced during this run, regardless of
// whether they're brand-new base trajectories (suggestion pass) or device
// variants (replay-all recovery). A simple before/after pathname snapshot is
// enough — the CLI never overwrites the base file.
function snapshotDir(dir) {
    if (!existsSync(dir))
        return new Set();
    const out = new Set();
    const walk = (d) => {
        for (const entry of readdirSync(d)) {
            const p = join(d, entry);
            const st = statSync(p);
            if (st.isDirectory())
                walk(p);
            else
                out.add(p);
        }
    };
    walk(dir);
    return out;
}
function diffSnapshots(before, after) {
    const added = [];
    for (const p of after)
        if (!before.has(p))
            added.push(p);
    added.sort();
    return added;
}
function runTesterH(args, opts) {
    return new Promise((resolve) => {
        const child = spawn('tester-h', args, {
            cwd: repoRoot,
            env: { ...process.env, ...(opts.env || {}) },
            stdio: ['ignore', 'pipe', 'pipe'],
        });
        const stdoutLines = [];
        let stdoutBuf = '';
        let stderrBuf = '';
        const flushStdout = () => {
            const parts = stdoutBuf.split('\n');
            stdoutBuf = parts.pop() ?? '';
            for (const line of parts) {
                stdoutLines.push(line);
                if (opts.echo)
                    process.stdout.write(line + '\n');
            }
        };
        child.stdout?.on('data', (b) => {
            stdoutBuf += b.toString('utf8');
            flushStdout();
        });
        child.stderr?.on('data', (b) => {
            const s = b.toString('utf8');
            stderrBuf += s;
            if (opts.echo)
                process.stderr.write(s);
        });
        let timedOut = false;
        const t = setTimeout(() => {
            timedOut = true;
            child.kill('SIGTERM');
            setTimeout(() => child.kill('SIGKILL'), 5000).unref();
        }, opts.timeoutMs);
        child.on('close', (code) => {
            clearTimeout(t);
            if (stdoutBuf) {
                stdoutLines.push(stdoutBuf);
                if (opts.echo)
                    process.stdout.write(stdoutBuf + '\n');
            }
            resolve({
                exitCode: code ?? 1,
                stdoutLines,
                stderr: stderrBuf,
                timedOut,
            });
        });
    });
}
function parseNdjsonOfType(lines, type) {
    for (let i = lines.length - 1; i >= 0; i--) {
        const line = lines[i].trim();
        if (!line.startsWith('{'))
            continue;
        try {
            const obj = JSON.parse(line);
            if (obj.type === type)
                return obj;
        }
        catch { /* not JSON */ }
    }
    return null;
}
// ── Phase 1: replay-all ──
async function runReplayAll(cfg) {
    const absTrajDir = join(repoRoot, cfg.trajectoriesDir);
    if (!existsSync(absTrajDir) || readdirSync(absTrajDir).filter(f => f.endsWith('.json')).length === 0) {
        const msg = `No trajectories found in \`${cfg.trajectoriesDir}\`. Record one locally with \`tester-h record <name>\` and commit it under that path.`;
        log(msg);
        return { replay: null, skipped: msg };
    }
    const args = ['replay-all', '--json', '--dir', cfg.trajectoriesDir, '--url', cfg.appUrl];
    if (!cfg.replayStrict)
        args.push('--no-strict');
    if (cfg.baseUrl)
        args.push('--base-url', cfg.baseUrl);
    if (cfg.model)
        args.push('--model', cfg.model);
    log(`replay-all (${cfg.replayStrict ? 'strict' : 'hybrid'}) → ${cfg.trajectoriesDir}`);
    const res = await runTesterH(args, { timeoutMs: cfg.replayTimeoutMs, echo: true });
    if (res.timedOut)
        log(`replay-all timed out after ${cfg.replayTimeoutMs / 1000}s`);
    const replay = parseNdjsonOfType(res.stdoutLines, 'replay_all_end');
    return { replay, skipped: null };
}
// ── Phase Xray (optional, opt-in via `xray_plan` input) ──
//
// This phase fires BEFORE replay-all so a failed Xray test doesn't get masked
// by a downstream failure. It calls the tester-h CLI once:
//
//   tester-h xray run-plan <PLAN> --url <app_url> --refresh --json [opts]
//
// The CLI handles: pulling tests via GraphQL, running each via Holo3, pushing
// a Test Execution, and auto-filing Jira bugs for FAILs. We only need to
// (1) parse its JSON summary, (2) surface the link in the PR comment, and
// (3) fold the verdict into the overall pass/fail decision.
//
// Skipping behaviour:
//   - `xray_plan` empty            → phase skipped entirely (default)
//   - Xray-side network error      → phase reports an error; replay-all still runs
//   - One or more tests FAILED     → overall verdict FAIL (replay still runs)
//
// Auth: the CLI reads creds from env vars (JIRA_*, XRAY_*). entrypoint.sh
// exports them from INPUT_* before invoking the orchestrator.
async function runXrayPhase(cfg) {
    if (!cfg.xrayPlan) {
        return { result: null, exitCode: 0, timedOut: false, error: null };
    }
    log(`xray phase: plan=${cfg.xrayPlan} (--refresh + run-plan)`);
    const args = [
        'xray', 'run-plan', cfg.xrayPlan,
        '--url', cfg.appUrl,
        '--refresh',
        '--issue-type', cfg.xrayIssueType,
        '--json',
    ];
    if (cfg.xrayNoBugs)
        args.push('--no-bugs');
    if (cfg.xrayProjectKey)
        args.push('--project-key', cfg.xrayProjectKey);
    const res = await runTesterH(args, { timeoutMs: cfg.xrayTimeoutMs, echo: true });
    if (res.timedOut) {
        log(`xray phase timed out after ${cfg.xrayTimeoutMs / 1000}s`);
        return { result: null, exitCode: res.exitCode, timedOut: true, error: 'timed out' };
    }
    const summary = parseNdjsonOfType(res.stdoutLines, 'xray_run_plan_end');
    if (!summary) {
        return {
            result: null,
            exitCode: res.exitCode,
            timedOut: false,
            error: `no xray_run_plan_end emitted (exit ${res.exitCode}). stderr: ${res.stderr.slice(0, 400)}`,
        };
    }
    return { result: summary, exitCode: res.exitCode, timedOut: false, error: null };
}
// ── Phase 2: audit ──
async function runAudit(cfg) {
    log(`audit ${cfg.appUrl}`);
    const res = await runTesterH(['audit', cfg.appUrl, '--json'], { timeoutMs: 5 * 60_000, echo: true });
    if (res.timedOut)
        log('audit timed out');
    const audit = parseNdjsonOfType(res.stdoutLines, 'audit');
    return audit;
}
// ── Phase 3: diff-aware suggestion recordings ──
//
// Two stages: (1) ask Claude whether the diff opens a coverage gap that
// warrants new journeys, with the existing trajectories as context. (2) For
// each approved journey, hand the task description to Holo3 via
// `tester-h --local --record`. The first stage uses the planner because
// Holo3 reads pixels, not diffs — without the planner we'd record a
// near-duplicate of an existing journey on every push.
function buildRecordingPrompt(journey, prTitle) {
    return [
        `You are extending an automated end-to-end test suite for the web application running at the start URL.`,
        ``,
        `A pull request titled "${prTitle}" has been opened, and a planner step has identified a coverage gap:`,
        ``,
        `**Why this matters:** ${journey.why}`,
        ``,
        `## Your task`,
        journey.task,
        ``,
        `## Rules`,
        `- Click, type, and navigate exactly as a real user would. Do not just observe.`,
        `- Stay focused — one coherent scenario, no exploring side paths.`,
        `- Stop as soon as the scenario is validated.`,
        ``,
        `When done, end with this JSON block:`,
        '```json',
        `{"verdict":"pass|fail","summary":"...","details":"..."}`,
        '```',
    ].join('\n');
}
async function runSuggestionPass(cfg, pr, plan) {
    if (!plan.needed || plan.journeys.length === 0)
        return [];
    // Make sure the destination directory exists (CLI creates `.tester-h/` but
    // not arbitrary subpaths the user might have set).
    const absTrajDir = join(repoRoot, cfg.trajectoriesDir);
    if (!existsSync(absTrajDir))
        mkdirSync(absTrajDir, { recursive: true });
    const recorded = [];
    for (let i = 0; i < plan.journeys.length; i++) {
        const journey = plan.journeys[i];
        // Namespace the file by PR number so concurrent PRs don't collide on the
        // same slug, and prefix with `pr-` so it's obvious in `git status`.
        const name = `pr-${pr.prNumber}-${journey.name}`;
        const recordPath = join(cfg.trajectoriesDir, `${name}.json`);
        log(`suggestion ${i + 1}/${plan.journeys.length} → ${recordPath}`);
        log(`  task: ${journey.task}`);
        const args = [
            '--local', // recording requires the local Holo3 loop
            '--url', cfg.appUrl,
            '--record', recordPath,
            '--timeout', String(cfg.suggestionTimeoutS),
            '--viewport', `${cfg.viewportWidth}x${cfg.viewportHeight}`,
            '--json',
        ];
        if (cfg.baseUrl)
            args.push('--base-url', cfg.baseUrl);
        if (cfg.model)
            args.push('--model', cfg.model);
        args.push(buildRecordingPrompt(journey, pr.title));
        const res = await runTesterH(args, {
            timeoutMs: (cfg.suggestionTimeoutS + 60) * 1000,
            echo: true,
        });
        // Even when the agent's verdict is `fail` we keep the trajectory — a
        // failed recording still serves as a regression guard once the bug is
        // fixed, and the reviewer can decide whether to commit it.
        if (existsSync(join(repoRoot, recordPath))) {
            const end = parseNdjsonOfType(res.stdoutLines, 'end');
            recorded.push({
                name,
                path: recordPath,
                verdict: end?.verdict ?? 'unknown',
                summary: end?.summary,
                why: journey.why,
                task: journey.task,
            });
        }
        else {
            log(`suggestion ${i + 1} produced no trajectory file (exit ${res.exitCode}${res.timedOut ? ', timed out' : ''})`);
        }
    }
    return recorded;
}
// ── Entry point ──
async function main() {
    let cfg;
    try {
        cfg = loadConfig();
    }
    catch (e) {
        process.stderr.write(`::error::${e.message}\n`);
        return 1;
    }
    log(`workspace: ${repoRoot}`);
    log(`app:       ${cfg.appUrl}`);
    log(`trajdir:   ${cfg.trajectoriesDir}`);
    let pr = null;
    try {
        pr = await fetchPrInfo();
    }
    catch (e) {
        log(`could not fetch PR info: ${e.message}`);
    }
    if (pr)
        log(`PR #${pr.prNumber}: ${pr.title} (${pr.changedFiles.length} changed files)`);
    const absTrajDir = join(repoRoot, cfg.trajectoriesDir);
    const before = snapshotDir(absTrajDir);
    // ── Xray phase (opt-in, fires before replay so its result is visible
    //    even if replay later fails) ──
    const xrayRun = await runXrayPhase(cfg);
    if (cfg.xrayPlan) {
        if (xrayRun.error)
            log(`xray phase reported an error: ${xrayRun.error}`);
        else if (xrayRun.result) {
            log(`xray phase: ${xrayRun.result.execution.key}  ` +
                `${xrayRun.result.runs.length} runs, ${xrayRun.result.bugs.length} bug(s) filed`);
        }
    }
    // ── Replay ──
    const { replay, skipped } = await runReplayAll(cfg);
    const afterReplay = snapshotDir(absTrajDir);
    const replayNewFiles = diffSnapshots(before, afterReplay);
    // ── Audit ──
    let audit = null;
    if (cfg.runAudit) {
        try {
            audit = await runAudit(cfg);
        }
        catch (e) {
            log(`audit failed: ${e.message}`);
        }
    }
    // ── Planner + suggestion pass ──
    let plan = null;
    let recorded = [];
    if (cfg.suggestJourneys && pr && cfg.maxNewJourneys > 0) {
        if (cfg.agentMode === 'cloud') {
            log('agent_mode=cloud cannot record trajectories; forcing local for suggestion pass');
        }
        log(`planner: asking ${cfg.plannerModel} whether the diff opens a coverage gap`);
        try {
            plan = await runPlanner(cfg, pr, absTrajDir);
        }
        catch (e) {
            log(`planner threw: ${e.message}`);
        }
        if (plan) {
            log(`planner verdict: ${plan.needed ? 'gap found' : 'no gap'} (${plan.journeys.length} journeys)`);
            log(`  reasoning: ${plan.reasoning.slice(0, 200)}`);
            if (plan.usage) {
                log(`  tokens: ${plan.usage.input_tokens} in / ${plan.usage.output_tokens} out`);
            }
        }
        if (plan && plan.needed && plan.journeys.length > 0) {
            try {
                recorded = await runSuggestionPass(cfg, pr, plan);
            }
            catch (e) {
                log(`suggestion pass failed: ${e.message}`);
            }
        }
    }
    const afterAll = snapshotDir(absTrajDir);
    const allNewFiles = diffSnapshots(before, afterAll).map(p => relative(repoRoot, p));
    // ── Verdict ──
    // Replay failures fail the action. Audit failures fail the action. Xray-phase
    // FAILs also fail the action (the QA team's tests are running for a reason).
    // Auto-corrected variants and freshly recorded suggestions DON'T fail —
    // they're informational.
    const replayPassed = !!replay && replay.failed === 0 && skipped === null;
    const auditPassed = !audit || audit.verdict === 'pass';
    const xrayPassed = !cfg.xrayPlan
        || (xrayRun.result !== null && xrayRun.result.ok && !xrayRun.error && !xrayRun.timedOut);
    const passOverall = replayPassed && auditPassed && xrayPassed;
    // ── Comment / step summary ──
    const md = buildComment({
        replay,
        replaySkippedReason: skipped,
        audit,
        newFiles: allNewFiles,
        recordedSuggestions: recorded,
        plan,
        trajectoriesDir: cfg.trajectoriesDir,
        passOverall,
        suggestJourneys: cfg.suggestJourneys,
        isPullRequest: pr !== null,
        xray: cfg.xrayPlan
            ? { plan: cfg.xrayPlan, result: xrayRun.result, error: xrayRun.error, timedOut: xrayRun.timedOut }
            : null,
    });
    writeStepSummary(md);
    let commentUrl = '';
    if (pr && cfg.githubToken) {
        try {
            const posted = await postPrComment(pr.owner, pr.repo, pr.prNumber, md);
            if (posted)
                commentUrl = posted;
        }
        catch (e) {
            log(`failed to post PR comment: ${e.message}`);
        }
    }
    // ── Outputs ──
    setOutput('result', passOverall ? 'pass' : 'fail');
    setOutput('replay_summary', replay ? JSON.stringify(replay) : '');
    setOutput('audit_summary', audit ? JSON.stringify(audit) : '');
    setOutput('xray_summary', xrayRun.result ? JSON.stringify(xrayRun.result) : '');
    setOutput('new_files', allNewFiles.join('\n'));
    setOutput('comment_url', commentUrl);
    // Log a one-liner so it's easy to spot the verdict in the action log tail.
    const xrayTag = cfg.xrayPlan
        ? (xrayRun.result ? (xrayRun.result.ok ? 'pass' : 'fail') : (xrayRun.error ? 'error' : 'skipped'))
        : 'skipped';
    log(`done — ${passOverall ? 'PASS' : 'FAIL'} · xray=${xrayTag} · replay=${replay?.failed === 0 ? 'pass' : (skipped ? 'skipped' : 'fail')} · audit=${audit ? audit.verdict : 'skipped'} · new_files=${allNewFiles.length}`);
    if (allNewFiles.length > 0) {
        log('new files (suggest committing):');
        for (const f of allNewFiles)
            log(`  · ${f}`);
    }
    // Replay-only logic for exit code:
    //   - replay genuinely failed → 1
    //   - audit failed (critical/high) → 1
    //   - replay skipped (no trajectories) is NOT a hard fail on the first run;
    //     instead we exit 0 so the action is friendly to repos that are just
    //     onboarding. Set `replay_strict=true` to fail-fast on empty dirs.
    if (replay && replay.failed > 0)
        return 1;
    if (audit && audit.verdict !== 'pass')
        return 1;
    if (cfg.xrayPlan && !xrayPassed)
        return 1;
    return 0;
}
main()
    .then(code => process.exit(code))
    .catch(e => {
    process.stderr.write(`::error::Fatal: ${e.message}\n`);
    process.exit(1);
});
//# sourceMappingURL=orchestrator.js.map
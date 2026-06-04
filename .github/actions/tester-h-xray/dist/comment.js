// Build the PR comment markdown from the orchestrator's results.
export function buildComment(input) {
    const lines = [];
    lines.push('<!-- h-action-report -->');
    lines.push(`## ${input.passOverall ? '✅' : '❌'} Tester H`);
    lines.push('');
    // The Xray section goes first when present: it's the headline of the PR
    // comment for teams that have Xray wired up — replay/audit results matter,
    // but the live test plan execution is what QA leadership is watching.
    if (input.xray) {
        lines.push(renderXraySection(input.xray));
        lines.push('');
    }
    lines.push(renderReplaySection(input.replay, input.replaySkippedReason));
    if (input.audit) {
        lines.push('');
        lines.push(renderAuditSection(input.audit));
    }
    if (input.suggestJourneys && input.isPullRequest) {
        lines.push('');
        lines.push(renderPlannerSection(input.plan, input.recordedSuggestions.length));
    }
    if (input.recordedSuggestions.length > 0) {
        lines.push('');
        lines.push(renderSuggestionsSection(input.recordedSuggestions));
    }
    if (input.newFiles.length > 0) {
        lines.push('');
        lines.push(renderCommitHint(input.newFiles, input.trajectoriesDir));
    }
    lines.push('');
    lines.push('---');
    lines.push('<sub>🤖 Powered by <a href="https://www.npmjs.com/package/tester-h"><b>tester-h</b></a></sub>');
    return lines.join('\n');
}
function renderXraySection(x) {
    const out = [];
    if (x.timedOut) {
        out.push(`### Xray plan ${x.plan} — ⏱ timed out`);
        out.push('');
        out.push(`The Xray phase did not complete in the configured window. ` +
            `Increase \`xray_timeout\` if your plan has many tests.`);
        return out.join('\n');
    }
    if (x.error || !x.result) {
        out.push(`### Xray plan ${x.plan} — ⚠️ phase errored`);
        out.push('');
        out.push('```');
        out.push((x.error ?? 'no summary emitted').slice(0, 600));
        out.push('```');
        return out.join('\n');
    }
    const r = x.result;
    const passed = r.runs.filter(t => t.status === 'PASSED').length;
    const failed = r.runs.filter(t => t.status === 'FAILED').length;
    const other = r.runs.length - passed - failed;
    const heading = r.ok
        ? `### Xray plan ${r.plan} — ✅ ${passed}/${r.runs.length} tests passed`
        : `### Xray plan ${r.plan} — ❌ ${failed}/${r.runs.length} tests failed`;
    out.push(heading);
    out.push('');
    out.push(`Test Execution: [\`${r.execution.key}\`](${r.execution.url})`);
    if (other > 0) {
        out.push('');
        out.push(`> ${other} test${other === 1 ? '' : 's'} skipped or in unexpected state.`);
    }
    if (r.runs.length > 0) {
        out.push('');
        out.push('| Test | Status |');
        out.push('|---|---|');
        for (const t of r.runs) {
            const icon = t.status === 'PASSED' ? '✅' : t.status === 'FAILED' ? '❌' : '⚪';
            out.push(`| \`${t.testKey}\` | ${icon} ${t.status} |`);
        }
    }
    if (r.bugs.length > 0) {
        out.push('');
        out.push(`#### 🐞 ${r.bugs.length} bug${r.bugs.length === 1 ? '' : 's'} auto-filed`);
        out.push('');
        out.push('| Bug | Tests |');
        out.push('|---|---|');
        for (const b of r.bugs) {
            out.push(`| [\`${b.key}\`](${b.url}) | \`${b.testKey}\` |`);
        }
    }
    return out.join('\n');
}
function renderReplaySection(replay, skipped) {
    if (!replay) {
        if (skipped)
            return `### Replay — skipped\n${skipped}`;
        return '### Replay — no result';
    }
    const { total, passed, failed, results } = replay;
    const heading = failed === 0
        ? `### Replay — ✅ ${passed}/${total} trajectories passed`
        : `### Replay — ❌ ${failed}/${total} trajectories failed`;
    const out = [heading];
    if (results.length === 0) {
        out.push('');
        out.push('_No trajectories found._');
        return out.join('\n');
    }
    out.push('');
    out.push('| Trajectory | Status | Steps | Recovered | Failed | Duration |');
    out.push('|---|---|---|---|---|---|');
    for (const r of results) {
        const icon = r.status === 'pass' ? '✅' : '❌';
        const name = r.device ? `${r.name} _${r.device}_` : r.name;
        out.push(`| \`${name}\` | ${icon} ${r.status} | ${r.steps_ok} | ${r.steps_recovered} | ${r.steps_failed} | ${formatDuration(r.duration_ms)} |`);
    }
    const fails = results.filter(r => r.status === 'fail');
    if (fails.length > 0) {
        out.push('');
        out.push('<details><summary>Failure details</summary>');
        out.push('');
        for (const f of fails) {
            out.push(`- **${f.name}** — step ${f.first_failure_step ?? '?'}: ${f.first_failure_reason || 'no reason captured'}`);
        }
        out.push('');
        out.push('</details>');
    }
    const totalRecovered = results.reduce((s, r) => s + r.steps_recovered, 0);
    if (totalRecovered > 0) {
        out.push('');
        out.push(`> ℹ️ **${totalRecovered} step${totalRecovered === 1 ? '' : 's'} auto-recovered** via semantic fallback. The recovered primitives have been written to a device-specific variant file — see the commit hint below.`);
    }
    return out.join('\n');
}
function renderAuditSection(audit) {
    if (audit.error) {
        return `### Audit — ❌ failed to run\n\n\`${audit.error}\``;
    }
    const summary = audit.summary ?? { pass: 0, warn: 0, fail: 0 };
    const heading = audit.verdict === 'pass'
        ? `### Audit — ✅ ${summary.pass} pass · ${summary.warn} warn · ${summary.fail} fail`
        : `### Audit — ❌ ${summary.pass} pass · ${summary.warn} warn · ${summary.fail} fail`;
    const out = [heading];
    out.push(`_${audit.url}_`);
    const findings = (audit.findings ?? []).filter(f => f.status !== 'pass');
    if (findings.length === 0) {
        out.push('');
        out.push('No actionable findings.');
        return out.join('\n');
    }
    // Sort by severity
    const order = { critical: 0, high: 1, medium: 2, low: 3, info: 4 };
    findings.sort((a, b) => order[a.severity] - order[b.severity]);
    // Cap rendered findings; full list goes in details
    const TOP = 10;
    out.push('');
    out.push('| Severity | Category | Issue |');
    out.push('|---|---|---|');
    for (const f of findings.slice(0, TOP)) {
        out.push(`| ${severityBadge(f.severity)} | \`${f.category}\` | ${escapeCell(f.message)} |`);
    }
    if (findings.length > TOP) {
        out.push('');
        out.push(`_…and ${findings.length - TOP} more findings._`);
    }
    return out.join('\n');
}
function renderPlannerSection(plan, recordedCount) {
    const out = ['### Planner'];
    out.push('');
    if (!plan) {
        out.push('_Planner did not run on this PR._');
        return out.join('\n');
    }
    if (plan.error) {
        out.push(`⚠️ Planner errored (\`${plan.error}\`) — skipped suggestion recording.`);
        out.push('');
        out.push(`> ${escapeCell(plan.reasoning)}`);
        return out.join('\n');
    }
    if (!plan.needed) {
        out.push(`✅ **No new journey needed** — the existing trajectories already cover the diff (or the diff has no user-visible impact).`);
    }
    else {
        out.push(`📝 **Gap found** — planner proposed ${plan.journeys.length} new journey${plan.journeys.length === 1 ? '' : 's'}; recorded ${recordedCount}.`);
    }
    out.push('');
    out.push(`> ${escapeCell(plan.reasoning)}`);
    return out.join('\n');
}
function renderSuggestionsSection(items) {
    const out = ['### Recorded journeys'];
    out.push('');
    out.push(`The planner approved **${items.length}** new journey${items.length === 1 ? '' : 's'}. Each one is a real recorded trajectory you can replay locally before committing:`);
    out.push('');
    for (const it of items) {
        out.push(`#### \`${it.path}\``);
        out.push(`- **Why:** ${escapeCell(it.why)}`);
        out.push(`- **Task:** ${escapeCell(it.task)}`);
        out.push(`- **Replay verdict:** ${verdictBadge(it.verdict)}${it.summary ? ` — ${escapeCell(it.summary)}` : ''}`);
        out.push('');
    }
    return out.join('\n');
}
function verdictBadge(v) {
    if (v === 'pass')
        return '✅ pass';
    if (v === 'fail')
        return '❌ fail';
    return `⚪ ${v}`;
}
function renderCommitHint(newFiles, trajectoriesDir) {
    const out = ['### 📥 New files to commit'];
    out.push('');
    out.push(`This run produced **${newFiles.length}** new trajectory file${newFiles.length === 1 ? '' : 's'} you probably want to commit:`);
    out.push('');
    for (const f of newFiles)
        out.push(`- \`${f}\``);
    out.push('');
    out.push('Pick them up locally:');
    out.push('```bash');
    out.push(`git pull`);
    out.push(`git add ${trajectoriesDir}`);
    out.push(`git commit -m "tester-h: update trajectories"`);
    out.push('```');
    out.push('');
    out.push('_Replay them locally first to spot-check:_ `tester-h replay-all`');
    return out.join('\n');
}
function severityBadge(sev) {
    switch (sev) {
        case 'critical': return '🔴 critical';
        case 'high': return '🟠 high';
        case 'medium': return '🟡 medium';
        case 'low': return '⚪ low';
        case 'info': return '🔵 info';
    }
}
function escapeCell(s) {
    return s
        .replace(/\\/g, '\\\\')
        .replace(/\|/g, '\\|')
        .replace(/\r?\n/g, ' ')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .slice(0, 240);
}
function formatDuration(ms) {
    if (ms < 1000)
        return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
}
//# sourceMappingURL=comment.js.map
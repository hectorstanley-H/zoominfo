// Diff-aware journey planner.
//
// Holo3 drives the browser well but doesn't read code. Putting it in front of
// every PR results in a near-duplicate recording of an existing journey on
// every push. The planner sits between the diff and Holo3 and answers a much
// narrower question: "given this diff and these existing journeys, is there a
// coverage gap worth recording?" The answer is conservative by default —
// refactors, dep bumps, docs, and test-only PRs return `needed: false`.
//
// Output is structured via a forced tool call (`propose_journeys`) so we get a
// typed object back rather than free-form text we'd have to parse.
import Anthropic from '@anthropic-ai/sdk';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { basename, join } from 'node:path';
const STEP_PREVIEW_LIMIT = 20;
function summarizeTrajectory(path) {
    try {
        const obj = JSON.parse(readFileSync(path, 'utf-8'));
        if (!obj || !Array.isArray(obj.steps))
            return null;
        const lines = obj.steps.slice(0, STEP_PREVIEW_LIMIT).map(summarizeStep);
        return {
            name: basename(path, '.json'),
            task: (obj.task || '(no task recorded)').slice(0, 200),
            stepCount: obj.steps.length,
            stepLines: lines,
        };
    }
    catch {
        return null;
    }
}
function summarizeStep(step) {
    const p = step.primitive;
    if (!p)
        return step.semantic?.thought?.slice(0, 80) || '(unknown)';
    const kind = p.kind;
    switch (kind) {
        case 'goto':
            return `navigate ${p.url}`;
        case 'click': {
            const hint = p.element_hint ||
                p.name ||
                p.selector;
            return `click ${hint || `(${p.x},${p.y})`}`.slice(0, 80);
        }
        case 'type':
            return `type "${String(p.text ?? '').slice(0, 40)}"`;
        case 'press':
            return `press ${p.key}`;
        case 'hotkey':
            return `hotkey ${(p.keys || []).join('+')}`;
        case 'scroll':
            return `scroll ${p.direction}`;
        case 'wait':
            return `wait ${p.seconds}s`;
        case 'back':
        case 'forward':
        case 'reload':
            return kind;
        default:
            return kind || '(step)';
    }
}
export function loadExistingTrajectories(trajDir) {
    if (!existsSync(trajDir))
        return [];
    const summaries = [];
    for (const entry of readdirSync(trajDir)) {
        if (!entry.endsWith('.json'))
            continue;
        const s = summarizeTrajectory(join(trajDir, entry));
        if (s)
            summaries.push(s);
    }
    // Sort base files first, then variants — easier to read in the prompt.
    summaries.sort((a, b) => a.name.localeCompare(b.name));
    return summaries;
}
// ── Tool definition (forced structured output) ─────────────────────────────
const PROPOSE_JOURNEYS_TOOL = {
    name: 'propose_journeys',
    description: 'Emit the planner verdict. Always call this tool exactly once — it is the only way to return your decision.',
    input_schema: {
        type: 'object',
        properties: {
            reasoning: {
                type: 'string',
                description: 'One short paragraph: what the diff does, whether the existing journeys already exercise the affected code paths, and how you arrived at the verdict.',
            },
            needed: {
                type: 'boolean',
                description: 'True only when the diff opens a clear user-visible coverage gap that no existing journey hits. Default to false for refactors, dep bumps, docs, test-only changes, internal tooling, and any change you can\'t confidently tie to a user-facing flow.',
            },
            journeys: {
                type: 'array',
                description: 'Empty when `needed` is false. Otherwise one entry per gap. Never more than the cap given in the user prompt.',
                items: {
                    type: 'object',
                    properties: {
                        name: {
                            type: 'string',
                            description: 'Short kebab-case slug describing the journey (3-6 words, e.g. "checkout-with-promo-code"). Used as the trajectory filename.',
                            pattern: '^[a-z0-9][a-z0-9-]*$',
                            maxLength: 48,
                        },
                        task: {
                            type: 'string',
                            description: 'Natural-language instruction for a vision-language browser agent. Must: (1) name a specific URL or page area; (2) describe a complete realistic user scenario in 1-2 sentences; (3) include a concrete assertion the agent can verify visually. Example: "On /pricing, click the Enterprise tier button, fill the contact form with realistic data, submit it, and verify the success message appears."',
                            maxLength: 600,
                        },
                        why: {
                            type: 'string',
                            description: 'One sentence on why this journey is needed and what specific code change motivates it. Surfaced in the PR comment for human review.',
                            maxLength: 240,
                        },
                    },
                    required: ['name', 'task', 'why'],
                },
            },
        },
        required: ['reasoning', 'needed', 'journeys'],
    },
};
// ── Prompt construction ────────────────────────────────────────────────────
const SYSTEM_PROMPT = `You are a senior QA engineer reviewing a pull request. Your job is to decide whether the existing automated end-to-end test suite has a coverage gap that justifies recording one or more new browser journeys.

A downstream CI step will hand each proposed journey verbatim to a vision-language browser agent (Holo3) that drives the running app in --record mode and saves the resulting trajectory as a JSON file. Your task descriptions are therefore the agent's complete instructions — they must be self-contained, specific, and visually verifiable.

# Bias

Default to "no new journey needed". A noisy planner is worse than a silent one: every recording costs the user a manual review, a commit, and ongoing maintenance. Only propose a journey when the diff clearly opens a gap that no existing journey hits.

Skip these PR categories entirely (always \`needed: false\`):
- Pure refactors with no user-visible change
- Dependency or version bumps
- Documentation, README, comment changes
- Test-only changes (no production code)
- Internal API endpoints not reachable from the UI
- Build, lint, CI, or developer tooling
- Type-only changes, dead-code removal
- Changes you cannot confidently tie to a user-facing flow

Only propose a new journey when the diff introduces:
- A new page, route, or visible component
- A new user-facing interaction (button, form, modal, flow step)
- A meaningful change to an existing user-visible behavior NOT already exercised by an existing journey

# How to write the \`task\` field

Each task is fed directly to a browser agent. It must be precise enough that a person who can't see the codebase could execute it. Include:
- A specific URL or page area to navigate to.
- A realistic user scenario in one or two sentences (click X, fill Y, submit, verify Z).
- One concrete visual assertion (a success message, a new element, a state change).

Bad: "Test the new feature."
Good: "On /settings/billing, click 'Add payment method', fill the form with a test card (4242 4242 4242 4242, any future date, any CVC), submit, and verify the new card appears in the saved methods list."

# Naming

\`name\` is the trajectory filename stem. Use kebab-case, 3-6 words, describing the scenario (not the PR). Examples: \`checkout-with-promo\`, \`signup-google-oauth\`, \`dashboard-empty-state\`.`;
function renderExisting(summaries) {
    if (summaries.length === 0) {
        return '_(no existing trajectories — this is the first journey for this repo)_';
    }
    const out = [];
    for (const s of summaries) {
        out.push(`### ${s.name}`);
        out.push(`**task:** ${s.task}`);
        out.push(`**steps (${s.stepCount}):**`);
        for (const line of s.stepLines)
            out.push(`- ${line}`);
        if (s.stepCount > s.stepLines.length) {
            out.push(`- _(+${s.stepCount - s.stepLines.length} more steps)_`);
        }
        out.push('');
    }
    return out.join('\n');
}
function buildUserPrompt(pr, existing, maxJourneys) {
    return [
        `# Pull Request`,
        `**Title:** ${pr.title}`,
        pr.body ? `\n**Body:**\n${pr.body.slice(0, 1500)}` : '',
        ``,
        `**Changed files (${pr.changedFiles.length}):**`,
        pr.changedFiles.slice(0, 50).map((f) => `- ${f}`).join('\n'),
        pr.changedFiles.length > 50 ? `_(+${pr.changedFiles.length - 50} more)_` : '',
        ``,
        `# Existing journeys (${existing.length})`,
        ``,
        renderExisting(existing),
        ``,
        `# Diff`,
        '```diff',
        pr.diff,
        '```',
        ``,
        `# Your decision`,
        ``,
        `Cap proposed journeys at **${maxJourneys}**. Less is more. If the diff is plausibly covered by an existing journey, set \`needed: false\` and explain in \`reasoning\` which journey covers it.`,
        ``,
        `Call \`propose_journeys\` exactly once.`,
    ].join('\n');
}
export async function runPlanner(cfg, pr, trajectoriesDirAbs) {
    if (!cfg.anthropicApiKey) {
        return {
            needed: false,
            reasoning: 'planner disabled: no anthropic_api_key provided',
            journeys: [],
            error: 'missing_anthropic_api_key',
        };
    }
    const existing = loadExistingTrajectories(trajectoriesDirAbs);
    const client = new Anthropic({ apiKey: cfg.anthropicApiKey });
    try {
        const response = await client.messages.create({
            model: cfg.plannerModel,
            max_tokens: 16000,
            output_config: { effort: 'high' },
            system: SYSTEM_PROMPT,
            tools: [PROPOSE_JOURNEYS_TOOL],
            tool_choice: { type: 'tool', name: 'propose_journeys' },
            messages: [
                {
                    role: 'user',
                    content: buildUserPrompt(pr, existing, cfg.maxNewJourneys),
                },
            ],
        });
        for (const block of response.content) {
            if (block.type === 'tool_use' && block.name === 'propose_journeys') {
                const out = block.input;
                const clamped = clampJourneys(out, cfg.maxNewJourneys);
                return {
                    needed: clamped.needed,
                    reasoning: clamped.reasoning,
                    journeys: clamped.journeys,
                    usage: {
                        input_tokens: response.usage.input_tokens,
                        output_tokens: response.usage.output_tokens,
                    },
                };
            }
        }
        return {
            needed: false,
            reasoning: 'planner returned no tool call — treating as "no gap"',
            journeys: [],
            error: 'no_tool_call',
        };
    }
    catch (e) {
        if (e instanceof Anthropic.APIError) {
            return {
                needed: false,
                reasoning: `planner API error: ${e.status} ${e.message}`,
                journeys: [],
                error: `api_error_${e.status}`,
            };
        }
        return {
            needed: false,
            reasoning: `planner failed: ${e.message}`,
            journeys: [],
            error: 'unknown',
        };
    }
}
function clampJourneys(out, cap) {
    // Defensive: model is told to honor the cap, but enforce it anyway. Also
    // collapse the inconsistent state where `needed=true` but `journeys` is
    // empty (or vice versa) into the conservative read.
    const journeys = (out.journeys || []).slice(0, cap);
    const needed = Boolean(out.needed) && journeys.length > 0;
    return {
        reasoning: out.reasoning || '(no reasoning provided)',
        needed,
        journeys: needed ? journeys : [],
    };
}
//# sourceMappingURL=planner.js.map
// Read INPUT_* env vars produced by GitHub Actions into a typed config.
function input(name, fallback = '') {
    return process.env[`INPUT_${name.toUpperCase()}`] || fallback;
}
function boolInput(name, fallback) {
    const raw = input(name).trim().toLowerCase();
    if (raw === '')
        return fallback;
    return raw === 'true' || raw === '1' || raw === 'yes';
}
function intInput(name, fallback) {
    const raw = input(name).trim();
    if (!raw)
        return fallback;
    const n = parseInt(raw, 10);
    return Number.isFinite(n) ? n : fallback;
}
export function loadConfig() {
    const apiKey = input('API_KEY') || process.env.HAI_API_KEY || '';
    if (!apiKey) {
        throw new Error('Missing required input: api_key. Pass HAI_API_KEY via the `api_key` input.');
    }
    const rawMode = input('AGENT_MODE', 'local').trim().toLowerCase();
    const agentMode = rawMode === 'cloud' ? 'cloud' : 'local';
    const suggestJourneys = boolInput('SUGGEST_JOURNEYS', true);
    const anthropicApiKey = input('ANTHROPIC_API_KEY') || process.env.ANTHROPIC_API_KEY || undefined;
    // Hard-fail early: the planner is the gate keeping new journeys focused.
    // Falling back to "record every PR" without the planner would replicate the
    // duplicate-suggestion problem this feature exists to avoid.
    if (suggestJourneys && !anthropicApiKey) {
        throw new Error('suggest_journeys=true but no anthropic_api_key was provided. ' +
            'Set the `anthropic_api_key` input (or ANTHROPIC_API_KEY env), ' +
            'or pass `suggest_journeys: false` to disable diff-aware suggestions.');
    }
    // ── Xray phase config (only validated when xray_plan is non-empty) ──
    const xrayPlan = input('XRAY_PLAN').trim();
    if (xrayPlan) {
        // Surface a clear, actionable error early. The CLI's own resolveXrayCreds
        // throws too, but doing it here means we don't waste a build+health-check
        // before discovering a missing token.
        const missing = [];
        if (!input('JIRA_BASE_URL') && !process.env.JIRA_BASE_URL)
            missing.push('jira_base_url');
        if (!input('JIRA_USER') && !process.env.JIRA_USER)
            missing.push('jira_user');
        if (!input('JIRA_TOKEN') && !process.env.JIRA_TOKEN)
            missing.push('jira_token');
        if (!input('XRAY_CLIENT_ID') && !process.env.XRAY_CLIENT_ID)
            missing.push('xray_client_id');
        if (!input('XRAY_CLIENT_SECRET') && !process.env.XRAY_CLIENT_SECRET)
            missing.push('xray_client_secret');
        if (missing.length > 0) {
            throw new Error(`xray_plan is set but the following inputs are missing: ${missing.join(', ')}. ` +
                `Pass them via the action inputs of the same name, or set them as workflow env vars.`);
        }
    }
    return {
        apiKey,
        githubToken: process.env.INPUT_GITHUB_TOKEN || process.env.GITHUB_TOKEN || undefined,
        appUrl: input('APP_URL', 'http://localhost:3000'),
        trajectoriesDir: input('TRAJECTORIES_DIR', '.tester-h/trajectories'),
        replayStrict: boolInput('REPLAY_STRICT', false),
        replayTimeoutMs: intInput('REPLAY_TIMEOUT', 900) * 1000,
        suggestJourneys,
        maxNewJourneys: Math.max(0, intInput('MAX_NEW_JOURNEYS', 2)),
        suggestionTimeoutS: intInput('SUGGESTION_TIMEOUT', 600),
        anthropicApiKey,
        plannerModel: input('PLANNER_MODEL', 'claude-sonnet-4-6'),
        runAudit: boolInput('RUN_AUDIT', true),
        agentMode,
        agentId: input('AGENT_ID') || process.env.HAI_AGENT_ID || undefined,
        baseUrl: input('BASE_URL') || undefined,
        model: input('MODEL') || undefined,
        viewportWidth: intInput('VIEWPORT_WIDTH', 1280),
        viewportHeight: intInput('VIEWPORT_HEIGHT', 720),
        xrayPlan,
        xrayNoBugs: boolInput('XRAY_NO_BUGS', false),
        xrayProjectKey: input('XRAY_PROJECT_KEY') || undefined,
        xrayIssueType: input('XRAY_ISSUE_TYPE', 'Bug'),
        // Wall-clock: 15 min default, bounded between 5 min and 1 hour.
        // Per-test agent wall-clock is dominated by the suggestion timeout (600s).
        // For a 5-test plan that's ~50 min worst case; users can set XRAY_TIMEOUT.
        xrayTimeoutMs: Math.max(300, Math.min(3600, intInput('XRAY_TIMEOUT', 900))) * 1000,
    };
}
//# sourceMappingURL=config.js.map
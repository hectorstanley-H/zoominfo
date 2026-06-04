export interface OrchestratorConfig {
    apiKey: string;
    githubToken: string | undefined;
    appUrl: string;
    trajectoriesDir: string;
    replayStrict: boolean;
    replayTimeoutMs: number;
    suggestJourneys: boolean;
    maxNewJourneys: number;
    suggestionTimeoutS: number;
    anthropicApiKey: string | undefined;
    plannerModel: string;
    runAudit: boolean;
    agentMode: 'local' | 'cloud';
    agentId: string | undefined;
    baseUrl: string | undefined;
    model: string | undefined;
    viewportWidth: number;
    viewportHeight: number;
    /** Xray Test Plan key. When set, the orchestrator runs the Xray phase. */
    xrayPlan: string;
    /** Skip Jira bug creation on FAIL (CI noise control). */
    xrayNoBugs: boolean;
    /** Override project key for auto-bugs (default: inferred from plan key). */
    xrayProjectKey: string | undefined;
    /** Jira issue type for auto-bugs (default: "Bug"). */
    xrayIssueType: string;
    /** Hard cap on the Xray phase wall-clock — derived from per-test 600s × test count, bounded. */
    xrayTimeoutMs: number;
}
export interface ReplayAllResultEntry {
    name: string;
    path: string;
    device: string | null;
    status: 'pass' | 'fail';
    duration_ms: number;
    steps_ok: number;
    steps_recovered: number;
    steps_failed: number;
    first_failure_step: number | null;
    first_failure_reason: string | null;
}
export interface ReplayAllEnd {
    type: 'replay_all_end';
    dir: string;
    total: number;
    passed: number;
    failed: number;
    results: ReplayAllResultEntry[];
}
export interface AuditFinding {
    id: string;
    category: string;
    severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
    status: 'pass' | 'fail' | 'warn';
    message: string;
    evidence?: string;
    remediation?: string;
}
export interface AuditEnd {
    type: 'audit';
    url: string;
    verdict: 'pass' | 'fail';
    summary?: {
        pass: number;
        warn: number;
        fail: number;
    };
    findings?: AuditFinding[];
    error?: string;
}
export interface RunEnd {
    type: 'end';
    verdict: 'pass' | 'fail' | 'unknown';
    summary?: string;
    trajectory?: string;
    status?: string;
}
export interface XrayRunPlanEnd {
    type: 'xray_run_plan_end';
    ok: boolean;
    plan: string;
    execution: {
        key: string;
        issueId: string;
        url: string;
    };
    runs: Array<{
        testKey: string;
        status: string;
    }>;
    bugs: Array<{
        testKey: string;
        key: string;
        url: string;
    }>;
}

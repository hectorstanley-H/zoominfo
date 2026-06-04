import { AuditEnd, ReplayAllEnd, XrayRunPlanEnd } from './types.js';
import type { PlannerResult } from './planner.js';
export interface CommentInput {
    replay: ReplayAllEnd | null;
    replaySkippedReason: string | null;
    audit: AuditEnd | null;
    newFiles: string[];
    recordedSuggestions: Array<{
        name: string;
        path: string;
        verdict: string;
        summary?: string;
        why: string;
        task: string;
    }>;
    plan: PlannerResult | null;
    trajectoriesDir: string;
    passOverall: boolean;
    /** True when the user asked for the diff-aware planner pass to run. */
    suggestJourneys: boolean;
    /** True when running on a PR (the planner only fires here). */
    isPullRequest: boolean;
    /** When non-null, the Xray phase ran and the comment includes a Xray section. */
    xray: {
        plan: string;
        result: XrayRunPlanEnd | null;
        error: string | null;
        timedOut: boolean;
    } | null;
}
export declare function buildComment(input: CommentInput): string;

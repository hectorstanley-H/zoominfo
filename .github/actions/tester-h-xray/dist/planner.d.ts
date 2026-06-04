import type { OrchestratorConfig } from './types.js';
import type { PrInfo } from './github.js';
export interface PlannerJourney {
    /** Short kebab-case slug, used as the trajectory filename stem. */
    name: string;
    /** The natural-language task fed to Holo3 via `tester-h --record`. */
    task: string;
    /** Why this gap matters — surfaced in the PR comment. */
    why: string;
}
export interface PlannerResult {
    needed: boolean;
    reasoning: string;
    journeys: PlannerJourney[];
    /** Tokens used; surfaced in logs for cost monitoring. */
    usage?: {
        input_tokens: number;
        output_tokens: number;
    };
    /** Set when the planner errored — orchestrator falls back to no-suggest. */
    error?: string;
}
interface TrajectorySummary {
    name: string;
    task: string;
    stepCount: number;
    /** First ~20 steps, one line each. Enough for coverage comparison. */
    stepLines: string[];
}
export declare function loadExistingTrajectories(trajDir: string): TrajectorySummary[];
export declare function runPlanner(cfg: OrchestratorConfig, pr: PrInfo, trajectoriesDirAbs: string): Promise<PlannerResult>;
export {};

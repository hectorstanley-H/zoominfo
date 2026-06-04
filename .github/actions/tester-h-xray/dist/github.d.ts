export interface PrInfo {
    owner: string;
    repo: string;
    prNumber: number;
    title: string;
    body: string;
    diff: string;
    changedFiles: string[];
}
export declare function fetchPrInfo(): Promise<PrInfo | null>;
export declare function postPrComment(owner: string, repo: string, prNumber: number, body: string): Promise<string>;

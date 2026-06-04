// GitHub API utilities: fetch PR diff, post PR comments.
import { readFileSync } from 'fs';
function getGitHubContext() {
    const repository = process.env.GITHUB_REPOSITORY; // owner/repo
    if (!repository)
        return null;
    const [owner, repo] = repository.split('/');
    let prNumber = 0;
    const eventPath = process.env.GITHUB_EVENT_PATH;
    if (eventPath) {
        try {
            const event = JSON.parse(readFileSync(eventPath, 'utf-8'));
            prNumber = event.pull_request?.number || event.number || 0;
        }
        catch {
            // Not a PR event
        }
    }
    // Fallback: try GITHUB_REF for refs/pull/<number>/merge
    if (!prNumber) {
        const ref = process.env.GITHUB_REF || '';
        const match = ref.match(/^refs\/pull\/(\d+)\//);
        if (match)
            prNumber = parseInt(match[1], 10);
    }
    if (!prNumber)
        return null;
    return { owner, repo, prNumber };
}
export async function fetchPrInfo() {
    const ctx = getGitHubContext();
    if (!ctx) {
        console.log('[GitHub] Not running in a PR context, skipping diff fetch');
        return null;
    }
    const token = process.env.GITHUB_TOKEN || process.env.INPUT_GITHUB_TOKEN;
    if (!token) {
        console.log('[GitHub] No GITHUB_TOKEN available, skipping diff fetch');
        return null;
    }
    const { owner, repo, prNumber } = ctx;
    const headers = {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
        'X-GitHub-Api-Version': '2022-11-28',
    };
    // Fetch PR metadata
    const prRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/pulls/${prNumber}`, { headers });
    if (!prRes.ok) {
        console.warn(`[GitHub] Failed to fetch PR #${prNumber}: ${prRes.status}`);
        return null;
    }
    const pr = await prRes.json();
    // Fetch diff
    const diffRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/pulls/${prNumber}`, {
        headers: { ...headers, Accept: 'application/vnd.github.v3.diff' },
    });
    const rawDiff = diffRes.ok ? await diffRes.text() : '';
    // Fetch changed files with patch info
    const filesRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/pulls/${prNumber}/files?per_page=100`, { headers });
    const files = filesRes.ok ? await filesRes.json() : [];
    const changedFiles = files.map(f => f.filename);
    // Compress diff: prioritize UI files, drop noise, cap per-file
    const diff = compressDiff(rawDiff, files);
    return {
        owner,
        repo,
        prNumber,
        title: pr.title || '',
        body: pr.body || '',
        diff,
        changedFiles,
    };
}
// ── Diff compression ──
const MAX_DIFF_CHARS = 12_000;
const MAX_PER_FILE_CHARS = 3_000;
// Files the agent can't usefully review visually
const SKIP_PATTERNS = [
    /\.lock$/,
    /package-lock\.json$/,
    /yarn\.lock$/,
    /pnpm-lock\.yaml$/,
    /\.min\.(js|css)$/,
    /\.(png|jpg|jpeg|gif|svg|ico|woff2?|ttf|eot|mp4|webm)$/,
    /\.map$/,
    /dist\//,
    /build\//,
    /node_modules\//,
    /\.d\.ts$/,
];
// UI-relevant files get priority
const UI_PATTERNS = [
    /\.(tsx|jsx|vue|svelte|html|hbs|ejs|pug)$/,
    /\.(css|scss|sass|less|styled)$/,
    /\.module\.(css|scss)$/,
    /components?\//i,
    /pages?\//i,
    /views?\//i,
    /layouts?\//i,
    /styles?\//i,
];
function isSkipped(filename) {
    return SKIP_PATTERNS.some(p => p.test(filename));
}
function isUiFile(filename) {
    return UI_PATTERNS.some(p => p.test(filename));
}
function compressDiff(rawDiff, files) {
    // If small enough, return as-is
    if (rawDiff.length <= MAX_DIFF_CHARS)
        return rawDiff;
    // Split raw diff into per-file sections
    const fileDiffs = splitDiffByFile(rawDiff);
    // Categorize and sort: UI files first, then other code, skip noise
    const uiFiles = [];
    const otherFiles = [];
    const skippedFiles = [];
    for (const [name, diff] of fileDiffs) {
        if (isSkipped(name)) {
            skippedFiles.push(name);
        }
        else if (isUiFile(name)) {
            uiFiles.push({ name, diff });
        }
        else {
            otherFiles.push({ name, diff });
        }
    }
    // Build compressed diff within budget
    const parts = [];
    let remaining = MAX_DIFF_CHARS;
    // UI files get full budget first
    for (const f of uiFiles) {
        if (remaining <= 0)
            break;
        const truncated = f.diff.slice(0, Math.min(MAX_PER_FILE_CHARS, remaining));
        const wasTruncated = truncated.length < f.diff.length;
        parts.push(truncated + (wasTruncated ? `\n... (${f.diff.length - truncated.length} chars truncated)` : ''));
        remaining -= truncated.length;
    }
    // Then other code files
    for (const f of otherFiles) {
        if (remaining <= 200)
            break;
        const truncated = f.diff.slice(0, Math.min(MAX_PER_FILE_CHARS, remaining));
        const wasTruncated = truncated.length < f.diff.length;
        parts.push(truncated + (wasTruncated ? `\n... (${f.diff.length - truncated.length} chars truncated)` : ''));
        remaining -= truncated.length;
    }
    // Mention skipped files
    if (skippedFiles.length > 0) {
        parts.push(`\n(${skippedFiles.length} non-UI files omitted: ${skippedFiles.slice(0, 5).join(', ')}${skippedFiles.length > 5 ? ', ...' : ''})`);
    }
    return parts.join('\n');
}
function splitDiffByFile(diff) {
    const files = new Map();
    const sections = diff.split(/^diff --git /m);
    for (const section of sections) {
        if (!section.trim())
            continue;
        const fullSection = 'diff --git ' + section;
        // Extract filename from "diff --git a/path b/path"
        const match = section.match(/^a\/(.+?) b\//);
        const name = match?.[1] || 'unknown';
        files.set(name, fullSection);
    }
    return files;
}
export async function postPrComment(owner, repo, prNumber, body) {
    const token = process.env.GITHUB_TOKEN || process.env.INPUT_GITHUB_TOKEN;
    if (!token) {
        console.log('[GitHub] No GITHUB_TOKEN, skipping PR comment');
        return '';
    }
    const headers = {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
        'X-GitHub-Api-Version': '2022-11-28',
    };
    const commentsRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/issues/${prNumber}/comments?per_page=100`, { headers });
    let existingCommentId = null;
    if (commentsRes.ok) {
        const comments = await commentsRes.json();
        const existing = comments.find(c => c.body.includes('<!-- h-action-report -->'));
        if (existing)
            existingCommentId = existing.id;
    }
    if (existingCommentId) {
        const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/issues/comments/${existingCommentId}`, {
            method: 'PATCH',
            headers: { ...headers, 'Content-Type': 'application/json' },
            body: JSON.stringify({ body }),
        });
        if (res.ok) {
            const json = await res.json();
            console.log(`[GitHub] Updated PR comment #${existingCommentId}`);
            return json.html_url || '';
        }
        return '';
    }
    const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/issues/${prNumber}/comments`, {
        method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({ body }),
    });
    if (res.ok) {
        const json = await res.json();
        console.log(`[GitHub] Posted new PR comment`);
        return json.html_url || '';
    }
    return '';
}
//# sourceMappingURL=github.js.map
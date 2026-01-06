/**
 * Git Analyzer for Build in Public
 * Parses git commit information and generates tweet-friendly summaries
 */

import { GitCommit } from './storage.js';

/**
 * Parse a git commit from command output or structured data
 */
export function parseCommit(commitData: any): GitCommit | null {
  try {
    if (typeof commitData === 'string') {
      // Parse from git log format
      return parseCommitFromLog(commitData);
    }

    // Already structured
    return {
      hash: commitData.hash || '',
      message: commitData.message || '',
      filesChanged: commitData.filesChanged || [],
      timestamp: commitData.timestamp || new Date().toISOString(),
      additions: commitData.additions,
      deletions: commitData.deletions,
    };
  } catch (error) {
    console.error('Failed to parse commit:', error);
    return null;
  }
}

/**
 * Parse commit from git log output
 * Expected format: hash|author|timestamp|message|files
 */
function parseCommitFromLog(logOutput: string): GitCommit | null {
  const lines = logOutput.trim().split('\n');
  if (lines.length === 0) {
    return null;
  }

  const firstLine = lines[0];
  const parts = firstLine.split('|');

  if (parts.length < 4) {
    return null;
  }

  return {
    hash: parts[0].trim(),
    message: parts[3].trim(),
    filesChanged: parts[4] ? parts[4].split(',').map((f) => f.trim()) : [],
    timestamp: parts[2].trim(),
  };
}

/**
 * Format commit message for Twitter (280 char limit)
 */
export function formatCommitTweet(commit: GitCommit): string {
  const filesCount = commit.filesChanged.length;
  const filesText = filesCount === 1 ? '1 file' : `${filesCount} files`;

  let tweet = `📝 ${commit.message}\n\n`;
  tweet += `Changed ${filesText}`;

  if (commit.additions !== undefined || commit.deletions !== undefined) {
    tweet += ` (+${commit.additions || 0}/-${commit.deletions || 0})`;
  }

  tweet += `\n\n#BuildInPublic #Git`;

  // Ensure 280 char limit
  if (tweet.length > 280) {
    // Truncate commit message if needed
    const maxMessageLen = 280 - 70; // Reserve space for metadata
    const truncatedMessage =
      commit.message.length > maxMessageLen
        ? commit.message.substring(0, maxMessageLen - 3) + '...'
        : commit.message;

    tweet = `📝 ${truncatedMessage}\n\n`;
    tweet += `Changed ${filesText}`;
    if (commit.additions !== undefined || commit.deletions !== undefined) {
      tweet += ` (+${commit.additions || 0}/-${commit.deletions || 0})`;
    }
    tweet += `\n\n#BuildInPublic #Git`;
  }

  return tweet;
}

/**
 * Summarize multiple commits into a thread
 */
export function summarizeCommits(commits: GitCommit[]): string[] {
  if (commits.length === 0) {
    return [];
  }

  if (commits.length === 1) {
    return [formatCommitTweet(commits[0])];
  }

  const thread: string[] = [];

  // First tweet: overview
  let overview = `🚀 Just pushed ${commits.length} commits!\n\n`;
  overview += `Summary of changes:\n`;
  overview += commits
    .slice(0, 3)
    .map((c, i) => `${i + 1}. ${c.message}`)
    .join('\n');

  if (commits.length > 3) {
    overview += `\n... and ${commits.length - 3} more`;
  }

  overview += `\n\n#BuildInPublic`;

  thread.push(overview);

  // Additional tweets for detailed commits (if space allows)
  commits.slice(0, 3).forEach((commit) => {
    thread.push(formatCommitTweet(commit));
  });

  return thread;
}

/**
 * Extract key changes from commit
 */
export function extractKeyChanges(commit: GitCommit): string[] {
  const changes: string[] = [];

  // Categorize file changes
  const categories = categorizeFiles(commit.filesChanged);

  Object.entries(categories).forEach(([category, files]) => {
    if (files.length > 0) {
      changes.push(`${category}: ${files.length} file(s)`);
    }
  });

  return changes;
}

/**
 * Categorize files by type
 */
function categorizeFiles(files: string[]): Record<string, string[]> {
  const categories: Record<string, string[]> = {
    'Code': [],
    'Tests': [],
    'Docs': [],
    'Config': [],
    'Other': [],
  };

  files.forEach((file) => {
    const lower = file.toLowerCase();

    if (lower.includes('test') || lower.includes('spec')) {
      categories['Tests'].push(file);
    } else if (
      lower.endsWith('.md') ||
      lower.includes('readme') ||
      lower.includes('doc')
    ) {
      categories['Docs'].push(file);
    } else if (
      lower.includes('config') ||
      lower.endsWith('.json') ||
      lower.endsWith('.yaml') ||
      lower.endsWith('.yml')
    ) {
      categories['Config'].push(file);
    } else if (
      lower.endsWith('.ts') ||
      lower.endsWith('.js') ||
      lower.endsWith('.py') ||
      lower.endsWith('.java') ||
      lower.endsWith('.go') ||
      lower.endsWith('.rs')
    ) {
      categories['Code'].push(file);
    } else {
      categories['Other'].push(file);
    }
  });

  return categories;
}

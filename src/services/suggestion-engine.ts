/**
 * Suggestion Engine for Build in Public
 * Analyzes session context and generates intelligent tweet suggestions
 */

import { SessionContext, GitCommit } from './storage.js';

export interface Suggestion {
  message: string;
  confidence: number;
  reason: string;
  type: 'commit' | 'achievement' | 'session' | 'learning';
}

/**
 * Generate tweet suggestions based on session context
 */
export function generateSuggestions(context: SessionContext): Suggestion[] {
  const suggestions: Suggestion[] = [];

  // Strategy 1: Commit-based suggestions
  if (context.commits && context.commits.length > 0) {
    const commitSuggestion = createCommitSuggestion(
      context.commits[context.commits.length - 1]
    );
    if (commitSuggestion) {
      suggestions.push(commitSuggestion);
    }
  }

  // Strategy 2: Achievement-based suggestions
  if (context.achievements && context.achievements.length > 0) {
    const achievementSuggestion = createAchievementSuggestion(context);
    if (achievementSuggestion) {
      suggestions.push(achievementSuggestion);
    }
  }

  // Strategy 3: Learning-based suggestions
  if (context.learnings && context.learnings.length > 0) {
    const learningSuggestion = createLearningSuggestion(context);
    if (learningSuggestion) {
      suggestions.push(learningSuggestion);
    }
  }

  // Strategy 4: Session summary
  if (context.filesModified && context.filesModified.length >= 3) {
    const sessionSuggestion = createSessionSuggestion(context);
    if (sessionSuggestion) {
      suggestions.push(sessionSuggestion);
    }
  }

  // Sort by confidence (highest first)
  return suggestions.sort((a, b) => b.confidence - a.confidence);
}

/**
 * Calculate confidence score for suggestions
 */
export function scoreConfidence(context: SessionContext): number {
  let score = 0;

  // Explicit triggers (high confidence)
  if (context.customMessage?.includes('#thread')) {
    score += 0.8;
  }
  if (context.triggerMessage?.match(/(done|finished|terminei|concluí)/i)) {
    score += 0.6;
  }

  // Implicit signals (medium confidence)
  if (context.commits && context.commits.length > 0) {
    score += 0.4;
  }
  if (context.filesModified && context.filesModified.length >= 3) {
    score += 0.3;
  }
  if (context.achievements && context.achievements.length > 0) {
    score += 0.5;
  }

  // Recency boost (recent activity is more relevant)
  const timeSinceStart = Date.now() - new Date(context.startTime).getTime();
  if (timeSinceStart < 2 * 60 * 60 * 1000) {
    // Within 2 hours
    score += 0.2;
  }

  return Math.min(score, 1.0);
}

/**
 * Create suggestion based on git commit
 */
function createCommitSuggestion(commit: GitCommit): Suggestion | null {
  if (!commit || !commit.message) {
    return null;
  }

  const filesCount = commit.filesChanged?.length || 0;
  const filesText = filesCount === 1 ? '1 file' : `${filesCount} files`;

  let message = `Just committed: "${commit.message}"\n\n`;
  message += `Modified ${filesText}. `;

  if (commit.additions !== undefined || commit.deletions !== undefined) {
    message += `+${commit.additions || 0}/-${commit.deletions || 0} lines. `;
  }

  message += `#BuildInPublic #Coding`;

  // Trim to 280 chars
  if (message.length > 280) {
    message = message.substring(0, 277) + '...';
  }

  return {
    message,
    confidence: 0.85,
    reason: 'Recent git commit detected',
    type: 'commit',
  };
}

/**
 * Create suggestion based on achievements
 */
function createAchievementSuggestion(
  context: SessionContext
): Suggestion | null {
  if (!context.achievements || context.achievements.length === 0) {
    return null;
  }

  const topAchievements = context.achievements.slice(0, 3);
  let message = '✅ Progress update:\n\n';

  topAchievements.forEach((achievement, index) => {
    message += `${index + 1}. ${achievement}\n`;
  });

  message += `\n#BuildInPublic`;

  if (message.length > 280) {
    message = message.substring(0, 277) + '...';
  }

  return {
    message,
    confidence: 0.75,
    reason: `${context.achievements.length} achievements logged`,
    type: 'achievement',
  };
}

/**
 * Create suggestion based on learnings
 */
function createLearningSuggestion(context: SessionContext): Suggestion | null {
  if (!context.learnings || context.learnings.length === 0) {
    return null;
  }

  const learning = context.learnings[0]; // Take first/most recent
  let message = `💡 TIL (Today I Learned):\n\n${learning}\n\n#BuildInPublic #Learning`;

  if (message.length > 280) {
    message = message.substring(0, 277) + '...';
  }

  return {
    message,
    confidence: 0.7,
    reason: 'Learning moment captured',
    type: 'learning',
  };
}

/**
 * Create suggestion based on session summary
 */
function createSessionSuggestion(context: SessionContext): Suggestion | null {
  const filesCount = context.filesModified?.length || 0;
  const toolsCount = context.toolsUsed?.length || 0;

  if (filesCount === 0) {
    return null;
  }

  let message = `Wrapped up a coding session! 🚀\n\n`;
  message += `Modified ${filesCount} files `;

  if (toolsCount > 0) {
    message += `using ${toolsCount} different tools. `;
  }

  if (context.challenges && context.challenges.length > 0) {
    message += `\n\nKey challenge: ${context.challenges[0]}`;
  }

  message += `\n\n#BuildInPublic`;

  if (message.length > 280) {
    message = message.substring(0, 277) + '...';
  }

  return {
    message,
    confidence: 0.6,
    reason: `Active session with ${filesCount} files modified`,
    type: 'session',
  };
}

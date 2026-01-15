/**
 * Suggestion Engine for Build in Public
 * Analyzes session context and generates intelligent tweet suggestions
 */

import { SessionContext, GitCommit } from './storage.js';
import { preferencesService } from './preferences.js';

export interface Suggestion {
  message: string;
  confidence: number;
  reason: string;
  type: 'commit' | 'achievement' | 'session' | 'learning';
}

/**
 * Language-specific strings for tweet generation
 */
const STRINGS = {
  'en-US': {
    justCommitted: 'Just committed',
    modified: 'Modified',
    file: 'file',
    files: 'files',
    progressUpdate: '✅ Progress update',
    til: '💡 TIL (Today I Learned)',
    wrappedUp: 'Wrapped up a coding session! 🚀',
    using: 'using',
    differentTools: 'different tools',
    keyChallenge: 'Key challenge',
    buildInPublic: '#BuildInPublic',
    coding: '#Coding',
    learning: '#Learning',
  },
  'pt-BR': {
    justCommitted: 'Acabei de commitar',
    modified: 'Modificados',
    file: 'arquivo',
    files: 'arquivos',
    progressUpdate: '✅ Atualização de progresso',
    til: '💡 Hoje Eu Aprendi',
    wrappedUp: 'Finalizei uma sessão de código! 🚀',
    using: 'usando',
    differentTools: 'ferramentas diferentes',
    keyChallenge: 'Desafio principal',
    buildInPublic: '#ConstruindoEmPúblico',
    coding: '#Programação',
    learning: '#Aprendizado',
  },
};

/**
 * Get language strings based on user preferences
 * Defaults to 'en-US' if preferences not available
 */
function getLanguageStrings() {
  const preferences = preferencesService.getPreferences();
  const language = preferences.language || 'en-US';
  return STRINGS[language];
}

/**
 * Generate tweet suggestions based on session context
 */
export function generateSuggestions(context: SessionContext): Suggestion[] {
  const suggestions: Suggestion[] = [];
  const lang = getLanguageStrings();

  // Strategy 1: Commit-based suggestions
  if (context.commits && context.commits.length > 0) {
    const commitSuggestion = createCommitSuggestion(
      context.commits[context.commits.length - 1],
      lang
    );
    if (commitSuggestion) {
      suggestions.push(commitSuggestion);
    }
  }

  // Strategy 2: Achievement-based suggestions
  if (context.achievements && context.achievements.length > 0) {
    const achievementSuggestion = createAchievementSuggestion(context, lang);
    if (achievementSuggestion) {
      suggestions.push(achievementSuggestion);
    }
  }

  // Strategy 3: Learning-based suggestions
  if (context.learnings && context.learnings.length > 0) {
    const learningSuggestion = createLearningSuggestion(context, lang);
    if (learningSuggestion) {
      suggestions.push(learningSuggestion);
    }
  }

  // Strategy 4: Session summary
  if (context.filesModified && context.filesModified.length >= 3) {
    const sessionSuggestion = createSessionSuggestion(context, lang);
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
function createCommitSuggestion(commit: GitCommit, lang: typeof STRINGS['en-US']): Suggestion | null {
  if (!commit || !commit.message) {
    return null;
  }

  const filesCount = commit.filesChanged?.length || 0;
  const filesText = filesCount === 1 ? `1 ${lang.file}` : `${filesCount} ${lang.files}`;

  let message = `${lang.justCommitted}: "${commit.message}"\n\n`;
  message += `${lang.modified} ${filesText}. `;

  if (commit.additions !== undefined || commit.deletions !== undefined) {
    message += `+${commit.additions || 0}/-${commit.deletions || 0} lines. `;
  }

  message += `${lang.buildInPublic} ${lang.coding}`;

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
  context: SessionContext,
  lang: typeof STRINGS['en-US']
): Suggestion | null {
  if (!context.achievements || context.achievements.length === 0) {
    return null;
  }

  const topAchievements = context.achievements.slice(0, 3);
  let message = `${lang.progressUpdate}:\n\n`;

  topAchievements.forEach((achievement, index) => {
    message += `${index + 1}. ${achievement}\n`;
  });

  message += `\n${lang.buildInPublic}`;

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
function createLearningSuggestion(context: SessionContext, lang: typeof STRINGS['en-US']): Suggestion | null {
  if (!context.learnings || context.learnings.length === 0) {
    return null;
  }

  const learning = context.learnings[0]; // Take first/most recent
  let message = `${lang.til}:\n\n${learning}\n\n${lang.buildInPublic} ${lang.learning}`;

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
function createSessionSuggestion(context: SessionContext, lang: typeof STRINGS['en-US']): Suggestion | null {
  const filesCount = context.filesModified?.length || 0;
  const toolsCount = context.toolsUsed?.length || 0;

  if (filesCount === 0) {
    return null;
  }

  const filesText = filesCount === 1 ? `1 ${lang.file}` : `${filesCount} ${lang.files}`;

  let message = `${lang.wrappedUp}\n\n`;
  message += `${lang.modified} ${filesText} `;

  if (toolsCount > 0) {
    message += `${lang.using} ${toolsCount} ${lang.differentTools}. `;
  }

  if (context.challenges && context.challenges.length > 0) {
    message += `\n\n${lang.keyChallenge}: ${context.challenges[0]}`;
  }

  message += `\n\n${lang.buildInPublic}`;

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

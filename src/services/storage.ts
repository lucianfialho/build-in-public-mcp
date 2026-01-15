/**
 * Local file storage for Build in Public
 * Manages auth tokens, context, and history in ~/.build-in-public/
 */

import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

const STORAGE_DIR = path.join(os.homedir(), '.build-in-public');
const AUTH_FILE = path.join(STORAGE_DIR, 'auth.json');
const CONTEXT_FILE = path.join(STORAGE_DIR, 'context.json');
const HISTORY_FILE = path.join(STORAGE_DIR, 'history.json');
const PREFERENCES_FILE = path.join(STORAGE_DIR, 'preferences.json');

export interface AuthTokens {
  apiKey: string;
  apiSecret: string;
  accessToken: string;
  accessTokenSecret: string;
}

export interface UserPreferences {
  language: 'pt-BR' | 'en-US';
  features: {
    enableCommitTweets: boolean;
    enableAchievementTweets: boolean;
    enableLearningTweets: boolean;
  };
}

export interface TweetHistory {
  tweets: Array<{
    id: string;
    url: string;
    message: string;
    timestamp: string;
  }>;
  threads: Array<{
    id: string;
    urls: string[];
    messages: string[];
    timestamp: string;
  }>;
}

export interface GitCommit {
  hash: string;
  message: string;
  filesChanged: string[];
  timestamp: string;
  additions?: number;
  deletions?: number;
}

export interface Command {
  command: string;
  description: string;
  timestamp?: string;
}

export interface SessionContext {
  sessionId: string;
  startTime: string;
  lastUpdated?: string;
  filesModified: string[];
  commandsRun: Command[];
  toolsUsed: string[];
  userMessages: string[];
  commits: GitCommit[];
  achievements: string[];
  challenges: string[];
  learnings: string[];
  shouldTweet: boolean;
  triggerMessage?: string;
  customMessage?: string;
}

/**
 * Ensure storage directory exists
 */
export function ensureStorageDir(): void {
  if (!fs.existsSync(STORAGE_DIR)) {
    fs.mkdirSync(STORAGE_DIR, { recursive: true, mode: 0o700 }); // rwx------
    console.error(`📁 Created storage directory: ${STORAGE_DIR}`);
  }
}

/**
 * Check if auth tokens exist (either in env vars or file)
 */
export function hasAuthTokens(): boolean {
  // Check environment variables first
  const hasEnvTokens =
    !!process.env.TWITTER_API_KEY &&
    !!process.env.TWITTER_API_SECRET &&
    !!process.env.TWITTER_ACCESS_TOKEN &&
    !!process.env.TWITTER_ACCESS_SECRET;

  return hasEnvTokens || fs.existsSync(AUTH_FILE);
}

/**
 * Save auth tokens to file
 */
export function saveAuthTokens(tokens: AuthTokens): void {
  ensureStorageDir();
  fs.writeFileSync(AUTH_FILE, JSON.stringify(tokens, null, 2), {
    mode: 0o600, // rw-------
  });
  console.error('✅ Auth tokens saved to:', AUTH_FILE);
}

/**
 * Load auth tokens from environment variables or file
 * Priority: environment variables > auth.json file
 */
export function loadAuthTokens(): AuthTokens | null {
  // Try environment variables first (following Supabase MCP pattern)
  console.error('🔍 Debug: Checking env vars:', {
    hasApiKey: !!process.env.TWITTER_API_KEY,
    hasApiSecret: !!process.env.TWITTER_API_SECRET,
    hasAccessToken: !!process.env.TWITTER_ACCESS_TOKEN,
    hasAccessSecret: !!process.env.TWITTER_ACCESS_SECRET,
  });

  if (
    process.env.TWITTER_API_KEY &&
    process.env.TWITTER_API_SECRET &&
    process.env.TWITTER_ACCESS_TOKEN &&
    process.env.TWITTER_ACCESS_SECRET
  ) {
    console.error('🔐 Using Twitter credentials from environment variables');
    return {
      apiKey: process.env.TWITTER_API_KEY,
      apiSecret: process.env.TWITTER_API_SECRET,
      accessToken: process.env.TWITTER_ACCESS_TOKEN,
      accessTokenSecret: process.env.TWITTER_ACCESS_SECRET,
    };
  }

  // Fall back to auth.json file
  if (!fs.existsSync(AUTH_FILE)) {
    return null;
  }

  try {
    const data = fs.readFileSync(AUTH_FILE, 'utf-8');
    console.error('🔐 Using Twitter credentials from:', AUTH_FILE);
    return JSON.parse(data) as AuthTokens;
  } catch (error) {
    console.error('❌ Failed to load auth tokens:', error);
    return null;
  }
}

/**
 * Delete auth tokens (for re-auth)
 */
export function deleteAuthTokens(): void {
  if (fs.existsSync(AUTH_FILE)) {
    fs.unlinkSync(AUTH_FILE);
    console.error('🗑️  Auth tokens deleted');
  }
}

/**
 * Save session context
 */
export function saveContext(context: SessionContext): void {
  ensureStorageDir();
  const data = {
    ...context,
    lastUpdated: new Date().toISOString(),
  };
  fs.writeFileSync(CONTEXT_FILE, JSON.stringify(data, null, 2));
}

/**
 * Load session context
 */
export function loadContext(): SessionContext | null {
  if (!fs.existsSync(CONTEXT_FILE)) {
    return null;
  }

  try {
    const data = fs.readFileSync(CONTEXT_FILE, 'utf-8');
    return JSON.parse(data) as SessionContext;
  } catch (error) {
    console.error('❌ Failed to load context:', error);
    return null;
  }
}

/**
 * Add tweet to history
 */
export function addTweetToHistory(
  id: string,
  url: string,
  message: string
): void {
  ensureStorageDir();

  let history: TweetHistory = { tweets: [], threads: [] };

  if (fs.existsSync(HISTORY_FILE)) {
    try {
      const data = fs.readFileSync(HISTORY_FILE, 'utf-8');
      history = JSON.parse(data) as TweetHistory;
    } catch (error) {
      console.error('⚠️  Failed to load history, creating new:', error);
    }
  }

  history.tweets.push({
    id,
    url,
    message,
    timestamp: new Date().toISOString(),
  });

  fs.writeFileSync(HISTORY_FILE, JSON.stringify(history, null, 2));
}

/**
 * Add thread to history
 */
export function addThreadToHistory(
  id: string,
  urls: string[],
  messages: string[]
): void {
  ensureStorageDir();

  let history: TweetHistory = { tweets: [], threads: [] };

  if (fs.existsSync(HISTORY_FILE)) {
    try {
      const data = fs.readFileSync(HISTORY_FILE, 'utf-8');
      history = JSON.parse(data) as TweetHistory;
    } catch (error) {
      console.error('⚠️  Failed to load history, creating new:', error);
    }
  }

  history.threads.push({
    id,
    urls,
    messages,
    timestamp: new Date().toISOString(),
  });

  fs.writeFileSync(HISTORY_FILE, JSON.stringify(history, null, 2));
}

/**
 * Get storage directory path
 */
export function getStorageDir(): string {
  return STORAGE_DIR;
}

/**
 * Save session context
 */
export function saveSessionContext(context: SessionContext): void {
  ensureStorageDir();
  const data = {
    ...context,
    lastUpdated: new Date().toISOString(),
  };
  fs.writeFileSync(CONTEXT_FILE, JSON.stringify(data, null, 2));
  console.error('💾 Session context saved');
}

/**
 * Load session context
 */
export function loadSessionContext(): SessionContext | null {
  if (!fs.existsSync(CONTEXT_FILE)) {
    return null;
  }

  try {
    const data = fs.readFileSync(CONTEXT_FILE, 'utf-8');
    return JSON.parse(data) as SessionContext;
  } catch (error) {
    console.error('❌ Failed to load session context:', error);
    return null;
  }
}

/**
 * Clear session context
 */
export function clearSessionContext(): void {
  if (fs.existsSync(CONTEXT_FILE)) {
    fs.unlinkSync(CONTEXT_FILE);
    console.error('🗑️  Session context cleared');
  }
}

/**
 * Check if session context exists
 */
export function hasSessionContext(): boolean {
  return fs.existsSync(CONTEXT_FILE);
}

/**
 * Check if preferences exist
 */
export function hasPreferences(): boolean {
  return fs.existsSync(PREFERENCES_FILE);
}

/**
 * Save user preferences to file
 */
export function savePreferences(preferences: UserPreferences): void {
  ensureStorageDir();
  fs.writeFileSync(PREFERENCES_FILE, JSON.stringify(preferences, null, 2), {
    mode: 0o600, // rw-------
  });
  console.error('✅ Preferences saved to:', PREFERENCES_FILE);
}

/**
 * Load user preferences from file
 */
export function loadPreferences(): UserPreferences | null {
  if (!fs.existsSync(PREFERENCES_FILE)) {
    return null;
  }

  try {
    const data = fs.readFileSync(PREFERENCES_FILE, 'utf-8');
    return JSON.parse(data) as UserPreferences;
  } catch (error) {
    console.error('❌ Failed to load preferences:', error);
    return null;
  }
}

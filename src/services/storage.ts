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

export interface AuthTokens {
  apiKey: string;
  apiSecret: string;
  accessToken: string;
  accessTokenSecret: string;
}

export interface SessionContext {
  filesModified?: string[];
  commandsRun?: string[];
  toolsUsed?: string[];
  lastUpdated?: string;
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
 * Check if auth tokens exist
 */
export function hasAuthTokens(): boolean {
  return fs.existsSync(AUTH_FILE);
}

/**
 * Save auth tokens
 */
export function saveAuthTokens(tokens: AuthTokens): void {
  ensureStorageDir();
  fs.writeFileSync(AUTH_FILE, JSON.stringify(tokens, null, 2), {
    mode: 0o600, // rw-------
  });
  console.error('✅ Auth tokens saved to:', AUTH_FILE);
}

/**
 * Load auth tokens
 */
export function loadAuthTokens(): AuthTokens | null {
  if (!fs.existsSync(AUTH_FILE)) {
    return null;
  }

  try {
    const data = fs.readFileSync(AUTH_FILE, 'utf-8');
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

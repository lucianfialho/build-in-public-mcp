/**
 * Twitter OAuth helpers
 * PIN-based OAuth 1.0a flow
 */

import { TwitterApi } from 'twitter-api-v2';
import * as readline from 'readline';
import { exec } from 'child_process';
import { promisify } from 'util';
import { saveAuthTokens, AuthTokens } from '../services/storage.js';

const execAsync = promisify(exec);

/**
 * Default Twitter App Credentials
 * These are public and safe to commit - they identify the app, not the user
 * Users can override with their own app by setting env vars:
 * - TWITTER_API_KEY
 * - TWITTER_API_SECRET
 */
const DEFAULT_API_KEY = 'zLW4QQ7597dy2YR4ruZJCtdme';
const DEFAULT_API_SECRET = 'd0kKxuevPIcGRMmvrJ4RUKD6NBCRss769CGZiQ1pDKvRlm0nQM';

/**
 * Open URL in browser
 */
async function openBrowser(url: string): Promise<void> {
  const platform = process.platform;

  try {
    if (platform === 'darwin') {
      await execAsync(`open "${url}"`);
    } else if (platform === 'win32') {
      await execAsync(`start "${url}"`);
    } else {
      // Linux
      await execAsync(`xdg-open "${url}"`);
    }
    console.error('🌐 Browser opened for authorization');
  } catch (error) {
    console.error('⚠️  Could not open browser automatically');
    console.error('📎 Please open this URL manually:', url);
  }
}

/**
 * Get user input from stdin
 */
function getUserInput(prompt: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stderr, // Use stderr to not interfere with STDIO protocol
  });

  return new Promise((resolve) => {
    rl.question(prompt, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

// Store auth link temporarily (in-memory, per-process)
let pendingAuthLink: { url: string; oauth_token: string; oauth_token_secret: string } | null = null;

/**
 * Start OAuth flow - returns authorization URL
 */
export async function startOAuthFlow(): Promise<{ url: string }> {
  console.error('🔐 Starting Twitter OAuth flow...\n');

  // Step 1: Use default credentials or get from env vars
  const apiKey = process.env.TWITTER_APP_KEY || DEFAULT_API_KEY;
  const apiSecret = process.env.TWITTER_APP_SECRET || DEFAULT_API_SECRET;

  console.error('✨ Using Build in Public MCP official app');
  console.error('   (You can use your own app by setting TWITTER_APP_KEY and TWITTER_APP_SECRET env vars)\n');

  // Step 2: Initialize OAuth client
  console.error('🔄 Initializing OAuth...');
  const client = new TwitterApi({
    appKey: apiKey,
    appSecret: apiSecret,
  });

  // Step 3: Get authorization URL
  const authLink = await client.generateAuthLink(undefined, {
    linkMode: 'authorize', // Use 'authorize' for PIN-based flow
  });

  console.error('\n✅ Authorization URL generated');
  console.error('📱 Opening browser for authorization...\n');

  // Step 4: Open browser
  await openBrowser(authLink.url);

  // Store auth link for later completion
  pendingAuthLink = authLink;

  return { url: authLink.url };
}

/**
 * Complete OAuth flow with PIN
 */
export async function completeOAuthFlow(pin: string): Promise<AuthTokens> {
  if (!pendingAuthLink) {
    throw new Error('No pending OAuth flow. Please call startOAuthFlow first.');
  }

  if (!pin) {
    throw new Error('PIN is required');
  }

  console.error('\n🔄 Exchanging PIN for access tokens...');

  const apiKey = process.env.TWITTER_APP_KEY || DEFAULT_API_KEY;
  const apiSecret = process.env.TWITTER_APP_SECRET || DEFAULT_API_SECRET;

  const client = new TwitterApi({
    appKey: apiKey,
    appSecret: apiSecret,
    accessToken: pendingAuthLink.oauth_token,
    accessSecret: pendingAuthLink.oauth_token_secret,
  });

  const { client: loggedClient, accessToken, accessSecret } = await client.login(pin);

  // Verify credentials by getting user info
  console.error('✅ Verifying credentials...');
  const currentUser = await loggedClient.v2.me();

  console.error(`\n🎉 Successfully authenticated as: @${currentUser.data.username}`);

  // Save tokens
  const tokens: AuthTokens = {
    apiKey,
    apiSecret,
    accessToken,
    accessTokenSecret: accessSecret,
  };

  saveAuthTokens(tokens);

  // Clear pending auth link
  pendingAuthLink = null;

  return tokens;
}

/**
 * Create Twitter client from saved tokens
 */
export function createTwitterClient(tokens: AuthTokens): TwitterApi {
  return new TwitterApi({
    appKey: tokens.apiKey,
    appSecret: tokens.apiSecret,
    accessToken: tokens.accessToken,
    accessSecret: tokens.accessTokenSecret,
  });
}

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

/**
 * Perform OAuth flow and save tokens
 */
export async function performOAuthFlow(): Promise<AuthTokens> {
  console.error('🔐 Starting Twitter OAuth flow...\n');

  // Step 1: Get API credentials from user
  console.error('📋 You need API credentials from Twitter Developer Portal');
  console.error('   https://developer.twitter.com/en/portal/dashboard\n');

  const apiKey = await getUserInput('Enter your API Key (Consumer Key): ');
  if (!apiKey) {
    throw new Error('API Key is required');
  }

  const apiSecret = await getUserInput(
    'Enter your API Secret (Consumer Secret): '
  );
  if (!apiSecret) {
    throw new Error('API Secret is required');
  }

  // Step 2: Initialize OAuth client
  console.error('\n🔄 Initializing OAuth...');
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

  console.error('\n📝 After authorizing, Twitter will show you a PIN code');

  // Step 5: Get PIN from user
  const pin = await getUserInput('\nEnter the PIN code from Twitter: ');
  if (!pin) {
    throw new Error('PIN is required');
  }

  // Step 6: Exchange PIN for access tokens
  console.error('\n🔄 Exchanging PIN for access tokens...');

  const { client: loggedClient, accessToken, accessSecret } = await client.login(pin);

  // Step 7: Verify credentials by getting user info
  console.error('✅ Verifying credentials...');
  const currentUser = await loggedClient.v2.me();

  console.error(`\n🎉 Successfully authenticated as: @${currentUser.data.username}`);

  // Step 8: Save tokens
  const tokens: AuthTokens = {
    apiKey,
    apiSecret,
    accessToken,
    accessTokenSecret: accessSecret,
  };

  saveAuthTokens(tokens);

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

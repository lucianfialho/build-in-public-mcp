/**
 * Twitter API service
 * Handles tweet posting, thread creation, and API interactions
 */

import { TwitterApi } from 'twitter-api-v2';
import {
  loadAuthTokens,
  hasAuthTokens,
  addTweetToHistory,
  addThreadToHistory,
} from './storage.js';
import { createTwitterClient } from '../utils/oauth.js';

/**
 * Get authenticated Twitter client
 */
export function getTwitterClient(): TwitterApi | null {
  if (!hasAuthTokens()) {
    return null;
  }

  const tokens = loadAuthTokens();
  if (!tokens) {
    return null;
  }

  return createTwitterClient(tokens);
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  return hasAuthTokens();
}

/**
 * Post a single tweet
 */
export async function postTweet(message: string): Promise<{
  id: string;
  url: string;
}> {
  const client = getTwitterClient();
  if (!client) {
    throw new Error(
      'Not authenticated. Please run mcp__bip__setup_auth first.'
    );
  }

  console.error('📤 Posting tweet...');

  try {
    // Post tweet
    const tweet = await client.v2.tweet(message);

    // Get authenticated user info for URL
    const me = await client.v2.me();
    const username = me.data.username;

    const tweetId = tweet.data.id;
    const tweetUrl = `https://twitter.com/${username}/status/${tweetId}`;

    // Save to history
    addTweetToHistory(tweetId, tweetUrl, message);

    console.error('✅ Tweet posted successfully!');
    console.error('🔗', tweetUrl);

    return {
      id: tweetId,
      url: tweetUrl,
    };
  } catch (error) {
    console.error('❌ Failed to post tweet:', error);
    throw error;
  }
}

/**
 * Create a Twitter thread
 * Posts multiple tweets in reply chain
 */
export async function postThread(messages: string[]): Promise<{
  ids: string[];
  urls: string[];
}> {
  const client = getTwitterClient();
  if (!client) {
    throw new Error(
      'Not authenticated. Please run mcp__bip__setup_auth first.'
    );
  }

  if (messages.length === 0) {
    throw new Error('Thread must have at least one message');
  }

  console.error(`🧵 Creating thread with ${messages.length} tweets...`);

  try {
    // Get user info for URLs
    const me = await client.v2.me();
    const username = me.data.username;

    const ids: string[] = [];
    const urls: string[] = [];
    let previousTweetId: string | undefined;

    // Post each tweet in the thread
    for (let i = 0; i < messages.length; i++) {
      const message = messages[i];
      console.error(`📤 Posting tweet ${i + 1}/${messages.length}...`);

      const tweet = await client.v2.tweet(message, {
        reply: previousTweetId
          ? { in_reply_to_tweet_id: previousTweetId }
          : undefined,
      });

      const tweetId = tweet.data.id;
      const tweetUrl = `https://twitter.com/${username}/status/${tweetId}`;

      ids.push(tweetId);
      urls.push(tweetUrl);

      previousTweetId = tweetId;

      // Small delay between tweets to avoid rate limiting
      if (i < messages.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    // Save to history
    addThreadToHistory(ids[0], urls, messages);

    console.error('✅ Thread posted successfully!');
    console.error('🔗 Thread starts at:', urls[0]);

    return {
      ids,
      urls,
    };
  } catch (error) {
    console.error('❌ Failed to post thread:', error);
    throw error;
  }
}

/**
 * Verify API credentials work
 */
export async function verifyCredentials(): Promise<{
  username: string;
  name: string;
}> {
  const client = getTwitterClient();
  if (!client) {
    throw new Error('Not authenticated');
  }

  try {
    const me = await client.v2.me();
    return {
      username: me.data.username,
      name: me.data.name,
    };
  } catch (error) {
    console.error('❌ Failed to verify credentials:', error);
    throw error;
  }
}

#!/usr/bin/env node

/**
 * Build in Public MCP Server
 * Entry point for STDIO transport
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListPromptsRequestSchema,
  GetPromptRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

import { startOAuthFlow, completeOAuthFlow } from './utils/oauth.js';
import {
  postTweet,
  postThread,
  isAuthenticated,
  verifyCredentials,
} from './services/twitter.js';
import {
  getStorageDir,
  loadSessionContext,
  saveSessionContext,
  hasSessionContext,
  SessionContext,
} from './services/storage.js';
import { generateSuggestions, scoreConfidence } from './services/suggestion-engine.js';
import { preferencesService } from './services/preferences.js';

// MCP Server instance
const server = new Server(
  {
    name: 'build-in-public',
    version: '0.4.1',
  },
  {
    capabilities: {
      tools: {},
      prompts: {},
    },
  }
);

/**
 * List available prompts
 */
server.setRequestHandler(ListPromptsRequestSchema, async () => {
  return {
    prompts: [
      {
        name: 'retro',
        description: 'Analyze your entire coding session and generate tweet suggestions about what you accomplished',
        arguments: [],
      },
      {
        name: 'quick',
        description: 'Post a quick tweet with a custom message',
        arguments: [
          {
            name: 'message',
            description: 'Your tweet message (will be posted immediately)',
            required: true,
          },
        ],
      },
      {
        name: 'suggest',
        description: 'Get AI-powered tweet suggestions based on current session context',
        arguments: [],
      },
    ],
  };
});

/**
 * Get prompt content
 */
server.setRequestHandler(GetPromptRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  switch (name) {
    case 'retro':
      return {
        messages: [
          {
            role: 'user',
            content: {
              type: 'text',
              text: `# Build in Public - Retrospective Mode

Analyze the ENTIRE coding session and help me share what I accomplished on Twitter.

## Your Task

1. **Review the full conversation** - Look at everything we've done from the start of this session
2. **Extract key information:**
   - What features/functionality were built?
   - What bugs were fixed?
   - What was learned (TIL moments)?
   - What challenges were overcome?
   - What technologies/tools were used?
   - Any interesting technical decisions or breakthroughs?

3. **Save the context** - Call mcp__bip__save_context with a comprehensive SessionContext object including:
   - filesModified: array of file paths that were changed
   - commandsRun: array of notable commands executed
   - commits: git commits if any
   - achievements: list of things accomplished
   - challenges: problems that were solved
   - learnings: new things discovered/learned
   - toolsUsed: tools and technologies used

4. **Generate suggestions** - Call mcp__bip__suggest to get AI-powered tweet suggestions

5. **Present options** - Show me the suggestions with confidence scores and let me choose which one to post (or customize)

6. **Post the tweet** - Once I choose, use mcp__bip__tweet to post it

**Important:** This is about celebrating progress and sharing learnings authentically. Focus on what was actually accomplished, not hype.`,
            },
          },
        ],
      };

    case 'quick':
      const message = args?.message as string;
      if (!message) {
        return {
          messages: [
            {
              role: 'user',
              content: {
                type: 'text',
                text: 'Error: Please provide a message for your tweet.',
              },
            },
          ],
        };
      }
      return {
        messages: [
          {
            role: 'user',
            content: {
              type: 'text',
              text: `Post this message to Twitter immediately using mcp__bip__tweet:

"${message}"

After posting, show me the tweet URL.`,
            },
          },
        ],
      };

    case 'suggest':
      return {
        messages: [
          {
            role: 'user',
            content: {
              type: 'text',
              text: `# Build in Public - Get Tweet Suggestions

Based on the current session context, generate intelligent tweet suggestions.

## Your Task

1. **Load context** - Call mcp__bip__get_context to see what's available
2. **Generate suggestions** - Call mcp__bip__suggest to get AI-powered tweet ideas
3. **Present options** - Show me the suggestions with confidence scores
4. **Let me choose** - I'll pick one to post or provide a custom message
5. **Post** - Use mcp__bip__tweet when I'm ready

Focus on authentic sharing of progress, learnings, and challenges.`,
            },
          },
        ],
      };

    default:
      throw new Error(`Unknown prompt: ${name}`);
  }
});

/**
 * List available tools
 */
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'mcp__bip__tweet',
        description:
          'Post a tweet immediately for build in public. Requires authentication.',
        inputSchema: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              description: 'The tweet message to post (max 280 characters)',
            },
          },
          required: ['message'],
        },
      },
      {
        name: 'mcp__bip__thread',
        description:
          'Create a Twitter thread from multiple messages. Posts tweets in reply chain.',
        inputSchema: {
          type: 'object',
          properties: {
            messages: {
              type: 'array',
              items: { type: 'string' },
              description: 'Array of tweet messages for the thread',
            },
            replyToTweetId: {
              type: 'string',
              description: 'Optional: Tweet ID to reply to (creates thread as replies to this tweet)',
            },
          },
          required: ['messages'],
        },
      },
      {
        name: 'mcp__bip__setup_auth',
        description:
          'Setup Twitter authentication via OAuth 1.0a (PIN-based flow). Call without PIN to get authorization URL, then call again with PIN to complete.',
        inputSchema: {
          type: 'object',
          properties: {
            pin: {
              type: 'string',
              description: 'PIN code from Twitter (leave empty to start OAuth flow)',
            },
          },
        },
      },
      {
        name: 'mcp__bip__status',
        description: 'Check authentication status and storage location',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'mcp__bip__suggest',
        description:
          'Generate intelligent tweet suggestions based on session context',
        inputSchema: {
          type: 'object',
          properties: {
            contextId: {
              type: 'string',
              description: 'Optional context ID (uses current session if not provided)',
            },
          },
        },
      },
      {
        name: 'mcp__bip__save_context',
        description: 'Save session context for later analysis and suggestions',
        inputSchema: {
          type: 'object',
          properties: {
            context: {
              type: 'object',
              description: 'Session context data',
            },
          },
          required: ['context'],
        },
      },
      {
        name: 'mcp__bip__get_context',
        description: 'Retrieve current session context',
        inputSchema: {
          type: 'object',
          properties: {
            contextId: {
              type: 'string',
              description: 'Optional context ID (uses current session if not provided)',
            },
          },
        },
      },
      {
        name: 'mcp__bip__configure',
        description: 'Configure user preferences for Build in Public (language and features)',
        inputSchema: {
          type: 'object',
          properties: {
            language: {
              type: 'string',
              enum: ['pt-BR', 'en-US'],
              description: 'Preferred language for tweets and messages',
            },
            features: {
              type: 'object',
              description: 'Feature flags to enable/disable specific tweet types',
              properties: {
                enableCommitTweets: {
                  type: 'boolean',
                  description: 'Enable automatic tweet suggestions for git commits',
                },
                enableAchievementTweets: {
                  type: 'boolean',
                  description: 'Enable tweet suggestions for logged achievements',
                },
                enableLearningTweets: {
                  type: 'boolean',
                  description: 'Enable tweet suggestions for learning moments (TIL)',
                },
              },
            },
          },
        },
      },
    ],
  };
});

/**
 * Handle tool calls
 */
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'mcp__bip__tweet': {
        const { message } = args as { message: string };

        if (!message) {
          throw new Error('Message is required');
        }

        if (message.length > 280) {
          throw new Error(
            `Tweet is too long (${message.length} characters, max 280)`
          );
        }

        // Check authentication
        if (!isAuthenticated()) {
          return {
            content: [
              {
                type: 'text',
                text:
                  '❌ Not authenticated\n\n' +
                  'Please run mcp__bip__setup_auth first to authenticate with Twitter.',
              },
            ],
            isError: true,
          };
        }

        // Post tweet
        const result = await postTweet(message);

        return {
          content: [
            {
              type: 'text',
              text:
                `✅ Tweet posted successfully!\n\n` +
                `🔗 ${result.url}\n\n` +
                `Message: "${message}"`,
            },
          ],
        };
      }

      case 'mcp__bip__thread': {
        const { messages, replyToTweetId } = args as { messages: string[]; replyToTweetId?: string };

        if (!messages || messages.length === 0) {
          throw new Error('Thread must have at least one message');
        }

        // Validate message lengths
        for (let i = 0; i < messages.length; i++) {
          if (messages[i].length > 280) {
            throw new Error(
              `Message ${i + 1} is too long (${messages[i].length} characters, max 280)`
            );
          }
        }

        // Check authentication
        if (!isAuthenticated()) {
          return {
            content: [
              {
                type: 'text',
                text:
                  '❌ Not authenticated\n\n' +
                  'Please run mcp__bip__setup_auth first to authenticate with Twitter.',
              },
            ],
            isError: true,
          };
        }

        // Post thread
        const result = await postThread(messages, replyToTweetId);

        return {
          content: [
            {
              type: 'text',
              text:
                `✅ Thread posted successfully!\n\n` +
                `🧵 ${messages.length} tweets in thread\n` +
                `🔗 Thread starts at: ${result.urls[0]}\n\n` +
                `All tweet URLs:\n${result.urls.map((url, i) => `  ${i + 1}. ${url}`).join('\n')}`,
            },
          ],
        };
      }

      case 'mcp__bip__setup_auth': {
        const { pin } = args as { pin?: string };

        try {
          if (!pin) {
            // Step 1: Start OAuth flow and return authorization URL
            console.error('\n🔐 Starting OAuth setup...\n');

            const { url } = await startOAuthFlow();

            return {
              content: [
                {
                  type: 'text',
                  text:
                    `🔐 Twitter Authorization\n\n` +
                    `✅ Authorization URL opened in your browser!\n\n` +
                    `📋 If the browser didn't open, go to:\n${url}\n\n` +
                    `After authorizing, Twitter will show you a PIN code.\n\n` +
                    `📝 **Next step:** Call this tool again with the PIN:\n` +
                    `   mcp__bip__setup_auth with pin: "YOUR_PIN_HERE"`,
                },
              ],
            };
          } else {
            // Step 2: Complete OAuth flow with PIN
            const tokens = await completeOAuthFlow(pin);

            // Verify credentials
            const user = await verifyCredentials();

            return {
              content: [
                {
                  type: 'text',
                  text:
                    `✅ Authentication successful!\n\n` +
                    `👤 Authenticated as: @${user.username} (${user.name})\n` +
                    `💾 Tokens saved to: ${getStorageDir()}/auth.json\n\n` +
                    `You can now use:\n` +
                    `  - mcp__bip__tweet to post tweets\n` +
                    `  - mcp__bip__thread to create threads`,
                },
              ],
            };
          }
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : String(error);
          return {
            content: [
              {
                type: 'text',
                text:
                  `❌ OAuth setup failed\n\n` +
                  `Error: ${errorMessage}\n\n` +
                  `Make sure you:\n` +
                  `  1. Started the OAuth flow first (call without PIN)\n` +
                  `  2. Authorized the app on Twitter\n` +
                  `  3. Entered the correct PIN code`,
              },
            ],
            isError: true,
          };
        }
      }

      case 'mcp__bip__status': {
        const authenticated = isAuthenticated();

        let statusText = `📊 Build in Public MCP Server Status\n\n`;
        statusText += `Version: 0.4.1\n`;
        statusText += `Storage: ${getStorageDir()}\n\n`;

        // Debug: Show env vars status
        statusText += `🔍 Environment Variables:\n`;
        statusText += `  TWITTER_API_KEY: ${process.env.TWITTER_API_KEY ? '✅ Set' : '❌ Not set'}\n`;
        statusText += `  TWITTER_API_SECRET: ${process.env.TWITTER_API_SECRET ? '✅ Set' : '❌ Not set'}\n`;
        statusText += `  TWITTER_ACCESS_TOKEN: ${process.env.TWITTER_ACCESS_TOKEN ? '✅ Set' : '❌ Not set'}\n`;
        statusText += `  TWITTER_ACCESS_SECRET: ${process.env.TWITTER_ACCESS_SECRET ? '✅ Set' : '❌ Not set'}\n\n`;

        if (authenticated) {
          try {
            const user = await verifyCredentials();
            statusText += `✅ Authenticated as: @${user.username} (${user.name})\n\n`;
            statusText += `Available tools:\n`;
            statusText += `  - mcp__bip__tweet - Post immediate tweets\n`;
            statusText += `  - mcp__bip__thread - Create Twitter threads\n`;
          } catch (error) {
            statusText += `⚠️  Authentication file exists but credentials are invalid\n`;
            statusText += `   Run mcp__bip__setup_auth to re-authenticate\n`;
          }
        } else {
          statusText += `❌ Not authenticated\n\n`;
          statusText += `Run mcp__bip__setup_auth to authenticate with Twitter\n`;
        }

        return {
          content: [
            {
              type: 'text',
              text: statusText,
            },
          ],
        };
      }

      case 'mcp__bip__suggest': {
        // Load session context
        const context = loadSessionContext();

        if (!context) {
          return {
            content: [
              {
                type: 'text',
                text:
                  '⚠️  No session context found\n\n' +
                  'Start coding and the system will automatically track your session. ' +
                  'Or save context manually using mcp__bip__save_context.',
              },
            ],
          };
        }

        // Generate suggestions
        const suggestions = generateSuggestions(context);
        const confidence = scoreConfidence(context);

        if (suggestions.length === 0) {
          return {
            content: [
              {
                type: 'text',
                text:
                  '💡 No strong suggestions yet\n\n' +
                  `Session confidence: ${(confidence * 100).toFixed(0)}%\n\n` +
                  'Keep working! Suggestions will appear when:\n' +
                  '  - You commit code to git\n' +
                  '  - You modify multiple files\n' +
                  '  - You log achievements or learnings',
              },
            ],
          };
        }

        let responseText = `💡 Tweet Suggestions (${suggestions.length})\n\n`;
        responseText += `Overall confidence: ${(confidence * 100).toFixed(0)}%\n\n`;

        suggestions.forEach((suggestion, index) => {
          responseText += `${index + 1}. [${(suggestion.confidence * 100).toFixed(0)}% confidence] ${suggestion.type}\n`;
          responseText += `   ${suggestion.reason}\n\n`;
          responseText += `   "${suggestion.message}"\n\n`;
        });

        responseText += `\nUse mcp__bip__tweet to post any of these suggestions!`;

        return {
          content: [
            {
              type: 'text',
              text: responseText,
            },
          ],
        };
      }

      case 'mcp__bip__save_context': {
        const { context } = args as { context: any };

        if (!context) {
          throw new Error('Context is required');
        }

        // Save the context
        saveSessionContext(context as SessionContext);

        return {
          content: [
            {
              type: 'text',
              text:
                '💾 Session context saved successfully!\n\n' +
                `Files modified: ${context.filesModified?.length || 0}\n` +
                `Commands run: ${context.commandsRun?.length || 0}\n` +
                `Commits: ${context.commits?.length || 0}\n\n` +
                'Use mcp__bip__suggest to generate tweet suggestions based on this context.',
            },
          ],
        };
      }

      case 'mcp__bip__get_context': {
        const context = loadSessionContext();

        if (!context) {
          return {
            content: [
              {
                type: 'text',
                text:
                  '⚠️  No session context found\n\n' +
                  'Context will be automatically created as you work, or you can save context manually using mcp__bip__save_context.',
              },
            ],
          };
        }

        let contextText = `📊 Session Context\n\n`;
        contextText += `Session ID: ${context.sessionId}\n`;
        contextText += `Started: ${new Date(context.startTime).toLocaleString()}\n`;
        if (context.lastUpdated) {
          contextText += `Last updated: ${new Date(context.lastUpdated).toLocaleString()}\n`;
        }
        contextText += `\n`;

        contextText += `📁 Files modified: ${context.filesModified?.length || 0}\n`;
        contextText += `⚙️  Commands run: ${context.commandsRun?.length || 0}\n`;
        contextText += `🔧 Tools used: ${context.toolsUsed?.length || 0}\n`;
        contextText += `💬 User messages: ${context.userMessages?.length || 0}\n`;
        contextText += `📝 Git commits: ${context.commits?.length || 0}\n`;
        contextText += `✅ Achievements: ${context.achievements?.length || 0}\n`;
        contextText += `🎯 Challenges: ${context.challenges?.length || 0}\n`;
        contextText += `💡 Learnings: ${context.learnings?.length || 0}\n\n`;

        if (context.shouldTweet) {
          contextText += `🐦 Ready to tweet: Yes\n`;
          if (context.triggerMessage) {
            contextText += `Trigger: "${context.triggerMessage}"\n`;
          }
        }

        return {
          content: [
            {
              type: 'text',
              text: contextText,
            },
          ],
        };
      }

      case 'mcp__bip__configure': {
        const { language, features } = args as {
          language?: 'pt-BR' | 'en-US';
          features?: {
            enableCommitTweets?: boolean;
            enableAchievementTweets?: boolean;
            enableLearningTweets?: boolean;
          };
        };

        // If no parameters provided, return current configuration
        if (!language && !features) {
          const currentPrefs = preferencesService.getPreferences();

          let configText = `⚙️  Current Configuration\n\n`;
          configText += `Language: ${currentPrefs.language}\n\n`;
          configText += `Features:\n`;
          configText += `  • Commit tweets: ${currentPrefs.features.enableCommitTweets ? '✅' : '❌'}\n`;
          configText += `  • Achievement tweets: ${currentPrefs.features.enableAchievementTweets ? '✅' : '❌'}\n`;
          configText += `  • Learning tweets: ${currentPrefs.features.enableLearningTweets ? '✅' : '❌'}\n`;

          return {
            content: [
              {
                type: 'text',
                text: configText,
              },
            ],
          };
        }

        // Validate language enum if provided
        if (language && language !== 'pt-BR' && language !== 'en-US') {
          return {
            content: [
              {
                type: 'text',
                text:
                  `❌ Invalid language: ${language}\n\n` +
                  `Supported languages: pt-BR, en-US`,
              },
            ],
            isError: true,
          };
        }

        // Build update object
        const updates: any = {};
        if (language) {
          updates.language = language;
        }
        if (features) {
          updates.features = features;
        }

        // Update preferences
        const updatedPrefs = preferencesService.updatePreferences(updates);

        let responseText = `✅ Preferences updated successfully!\n\n`;
        responseText += `Language: ${updatedPrefs.language}\n\n`;
        responseText += `Features:\n`;
        responseText += `  • Commit tweets: ${updatedPrefs.features.enableCommitTweets ? '✅' : '❌'}\n`;
        responseText += `  • Achievement tweets: ${updatedPrefs.features.enableAchievementTweets ? '✅' : '❌'}\n`;
        responseText += `  • Learning tweets: ${updatedPrefs.features.enableLearningTweets ? '✅' : '❌'}\n`;

        return {
          content: [
            {
              type: 'text',
              text: responseText,
            },
          ],
        };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      content: [
        {
          type: 'text',
          text: `❌ Error: ${errorMessage}`,
        },
      ],
      isError: true,
    };
  }
});

/**
 * Start the server using STDIO transport
 */
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);

  // Log to stderr (stdout is used for MCP protocol)
  console.error('🚀 Build in Public MCP Server started');
  console.error('📍 Version: 0.4.1');
  console.error('🔗 Transport: STDIO');
  console.error('💾 Storage:', getStorageDir());
  console.error('');
}

main().catch((error) => {
  console.error('❌ Failed to start server:', error);
  process.exit(1);
});

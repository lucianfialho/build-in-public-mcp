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
} from '@modelcontextprotocol/sdk/types.js';

import { performOAuthFlow } from './utils/oauth.js';
import {
  postTweet,
  postThread,
  isAuthenticated,
  verifyCredentials,
} from './services/twitter.js';
import { getStorageDir } from './services/storage.js';

// MCP Server instance
const server = new Server(
  {
    name: 'build-in-public',
    version: '0.2.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

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
          },
          required: ['messages'],
        },
      },
      {
        name: 'mcp__bip__setup_auth',
        description:
          'Setup Twitter authentication via OAuth 1.0a (PIN-based flow)',
        inputSchema: {
          type: 'object',
          properties: {},
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
        const { messages } = args as { messages: string[] };

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
        const result = await postThread(messages);

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
        console.error('\n🔐 Starting OAuth setup...\n');
        console.error('⚠️  IMPORTANT: This is an interactive flow.');
        console.error(
          '   Make sure you are running this in a terminal (not via Claude Code UI).\n'
        );

        try {
          const tokens = await performOAuthFlow();

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
                  `  1. Have valid Twitter API credentials\n` +
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
        statusText += `Version: 0.2.0\n`;
        statusText += `Storage: ${getStorageDir()}\n\n`;

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
  console.error('📍 Version: 0.2.0');
  console.error('🔗 Transport: STDIO');
  console.error('💾 Storage:', getStorageDir());
  console.error('');
}

main().catch((error) => {
  console.error('❌ Failed to start server:', error);
  process.exit(1);
});

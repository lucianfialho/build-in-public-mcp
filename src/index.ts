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

// MCP Server instance
const server = new Server(
  {
    name: 'build-in-public',
    version: '0.1.0',
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
        description: 'Post a tweet immediately for build in public',
        inputSchema: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              description: 'The tweet message to post',
            },
          },
          required: ['message'],
        },
      },
      {
        name: 'mcp__bip__setup_auth',
        description: 'Setup Twitter authentication via OAuth',
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

        // TODO: Implement tweet posting
        return {
          content: [
            {
              type: 'text',
              text: `✅ Tweet posted: ${message}\n\n[Not yet implemented - coming in next commit]`,
            },
          ],
        };
      }

      case 'mcp__bip__setup_auth': {
        // TODO: Implement OAuth setup
        return {
          content: [
            {
              type: 'text',
              text: '🔐 OAuth setup\n\n[Not yet implemented - coming in next commit]',
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
  console.error('📍 Version: 0.1.0');
  console.error('🔗 Transport: STDIO');
}

main().catch((error) => {
  console.error('❌ Failed to start server:', error);
  process.exit(1);
});

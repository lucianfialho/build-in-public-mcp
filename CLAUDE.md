# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Build in Public MCP Server is an MCP (Model Context Protocol) server that enables developers to share their coding progress on Twitter directly from Claude Code. It analyzes coding sessions and generates AI-powered tweet suggestions about achievements, learnings, and progress.

## Development Commands

### Build and Development
```bash
# Build TypeScript to JavaScript
npm run build

# Watch mode for development (auto-rebuild on changes)
npm run dev

# Start the MCP server
npm start
```

### Testing
```bash
# No tests currently configured
npm test  # Returns error - tests not implemented yet
```

### Installation & Publishing
```bash
# Install dependencies
npm install

# Global installation (for testing)
npm install -g .

# Add to Claude Code via npx (recommended for users)
claude mcp add --transport stdio build-in-public npx @lucianfialho/build-in-public-mcp

# Add to Claude Code via global install
claude mcp add --transport stdio build-in-public build-in-public-mcp
```

## Architecture

### MCP Server Design (STDIO Transport)

This is an MCP server that communicates with Claude Code using STDIO transport. The architecture follows this pattern:

```
Claude Code ←→ STDIO ←→ MCP Server (local process) ←→ Twitter API
                              ↓
                   ~/.build-in-public/
                   - auth.json (OAuth tokens)
                   - context.json (Session context)
                   - history.json (Tweet history)
```

**Key architectural points:**
- **100% local** - No external servers or databases
- **STDIO transport** - Uses stdin/stdout for MCP protocol communication (stderr for logging)
- **Session-based** - Tracks coding sessions and generates suggestions based on accumulated context
- **OAuth 1.0a** - PIN-based Twitter authentication flow

### Entry Point

`src/index.ts` is the main entry point that:
- Initializes the MCP server using `@modelcontextprotocol/sdk`
- Registers MCP tools and prompts
- Sets up STDIO transport for Claude Code integration
- Handles all tool call requests
- Uses stderr for logging (stdout is reserved for MCP protocol)

### Core Services

#### Twitter Service (`src/services/twitter.ts`)
- **Purpose**: Twitter API integration using `twitter-api-v2`
- **Key functions**:
  - `postTweet()` - Posts a single tweet
  - `postThread()` - Creates threaded tweets with reply chains
  - `verifyCredentials()` - Validates API credentials
  - `getTwitterClient()` - Returns authenticated Twitter client
- **Authentication**: Supports both environment variables (priority) and file-based auth tokens

#### Storage Service (`src/services/storage.ts`)
- **Purpose**: Local file storage in `~/.build-in-public/`
- **Files managed**:
  - `auth.json` - OAuth tokens (rw-------)
  - `context.json` - Current session context
  - `history.json` - Tweet and thread history
- **Key interfaces**:
  - `SessionContext` - Tracks files modified, commands run, commits, achievements, learnings
  - `AuthTokens` - API keys and access tokens
  - `TweetHistory` - Record of all posted tweets and threads

#### Suggestion Engine (`src/services/suggestion-engine.ts`)
- **Purpose**: AI-powered tweet generation from session context
- **Strategies**:
  1. Commit-based - Generates tweets from git commits
  2. Achievement-based - Creates progress updates from logged achievements
  3. Learning-based - Generates "TIL" tweets from captured learnings
  4. Session summary - Wraps up coding sessions with statistics
- **Confidence scoring**: Evaluates how ready a session is for tweeting based on commits, files modified, achievements
- **Character limit**: All suggestions respect Twitter's 280-character limit

#### OAuth Utilities (`src/utils/oauth.ts`)
- **Purpose**: PIN-based OAuth 1.0a flow for Twitter authentication
- **Flow**:
  1. Prompts user for API credentials (Consumer Key/Secret)
  2. Generates authorization URL
  3. Opens browser for user authorization
  4. Exchanges PIN for access tokens
  5. Saves tokens securely to `~/.build-in-public/auth.json`
- **Interactive**: Uses readline for terminal input (via stderr)

### MCP Tools

The server exposes 7 MCP tools (all prefixed with `mcp__bip__`):

1. **tweet** - Post a single tweet immediately
2. **thread** - Create a Twitter thread from multiple messages
3. **setup_auth** - Interactive OAuth setup (PIN-based)
4. **status** - Check authentication status and environment
5. **suggest** - Generate AI-powered tweet suggestions from session context
6. **save_context** - Save session context for later analysis
7. **get_context** - Retrieve current session context

### MCP Prompts

The server exposes 3 MCP prompts that Claude Code can use:

1. **retro** - Full session retrospective mode
   - Analyzes entire coding session
   - Extracts achievements, learnings, challenges
   - Generates multiple tweet suggestions with confidence scores
   - Guides user through selection and posting

2. **quick** - Quick tweet posting
   - Posts a message immediately
   - Takes message as argument

3. **suggest** - Context-based suggestions
   - Loads current session context
   - Generates tweet ideas
   - Presents options for user selection

### Authentication Priority

The system checks for Twitter credentials in this order:
1. **Environment variables** (highest priority):
   - `TWITTER_API_KEY`
   - `TWITTER_API_SECRET`
   - `TWITTER_ACCESS_TOKEN`
   - `TWITTER_ACCESS_SECRET`
2. **File-based tokens**: `~/.build-in-public/auth.json`

This allows flexible deployment - env vars for CI/CD, file-based for local development.

## TypeScript Configuration

- **Target**: ES2020 (modern JavaScript)
- **Module**: CommonJS (for Node.js compatibility)
- **Output**: `./dist` directory
- **Source maps**: Enabled for debugging
- **Declaration files**: Generated for TypeScript consumers
- **Strict mode**: Enabled

## Important Implementation Notes

### STDIO Protocol Considerations
- **Never write to stdout** - Reserved for MCP protocol JSON-RPC messages
- **Use stderr for all logging** - `console.error()` for user-visible messages
- **Interactive flows must use stderr** - readline prompts go to stderr

### Error Handling
- Twitter API 403 errors include helpful guidance about permissions
- All tools return structured error responses with `isError: true`
- OAuth failures provide troubleshooting steps

### Session Context Structure
When saving context via `mcp__bip__save_context`, include:
- `filesModified`: Array of file paths changed
- `commandsRun`: Array of commands with descriptions
- `commits`: Git commits with hash, message, files changed
- `achievements`: List of accomplishments
- `challenges`: Problems that were solved
- `learnings`: TIL moments
- `toolsUsed`: Tools and technologies used

This context powers the suggestion engine's confidence scoring and tweet generation.

## File Permissions
- Storage directory: `0o700` (rwx------)
- Auth tokens file: `0o600` (rw-------)
- Other files: Default permissions

## Version
Current version: 0.3.2 (defined in package.json and src/index.ts)

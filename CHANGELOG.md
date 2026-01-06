# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Planned
- Enhanced hooks for automatic context tracking
- Analytics integration (v2.0)
- Template system for tweets

## [0.3.2] - 2026-01-06

### Changed
- ⚡ **Removed `/bp` skill** - Incompatible with NPM distribution
- ✨ **Implemented MCP Prompts** - Native Claude Code integration
  - `retro` - Analyze session and generate tweets
  - `quick <message>` - Post quick tweet
  - `suggest` - Get AI-powered suggestions
- 📝 **Natural language interaction** - Just talk to Claude naturally
- 🔧 Updated all documentation to reflect prompt-based workflow

### Technical
- Added `ListPromptsRequestSchema` and `GetPromptRequestSchema` handlers
- Prompts embedded directly in MCP server (no external files)
- Removed `.claude/` directory from package distribution

## [0.3.1] - 2026-01-06

### Fixed
- 📦 **Added `.claude/skills/` to NPM package** - Skills now distributed with package
- 🐛 Fixed skill discovery issue in NPM installations

### Technical
- Updated `package.json` files array to include `.claude` directory

## [0.3.0] - 2026-01-06

### Added
- 🤖 **AI-powered tweet suggestion engine** with 4 strategies:
  - Commit-based: Suggests tweets from git commits
  - Achievement-based: Celebrates accomplishments
  - Learning-based: Shares TIL moments
  - Session-based: Summarizes coding sessions
- 🔄 **Retrospective mode** - Analyze entire session and extract insights
- 💾 **Context tracking** - SessionContext with achievements, challenges, learnings
- 🔧 **3 new MCP tools**:
  - `mcp__bip__suggest` - Generate intelligent tweet suggestions
  - `mcp__bip__save_context` - Save session context
  - `mcp__bip__get_context` - Retrieve session context
- 🧵 **Thread reply support** - `replyToTweetId` parameter for creating thread replies
- 🎯 **Confidence scoring** - AI rates suggestion quality (0.0-1.0)

### Technical Implementation
- `src/services/suggestion-engine.ts` - AI suggestion generator
- `src/services/git-analyzer.ts` - Git commit parser
- Enhanced `SessionContext` interface with commits, achievements, challenges, learnings
- Updated storage to `~/.build-in-public/` (unified location)
- Python hooks for automatic context tracking

### Features
- Analyze full coding sessions
- Extract meaningful achievements and learnings
- Generate multiple tweet suggestions with confidence scores
- Create threads that reply to existing tweets
- Track session context automatically

## [0.2.0] - 2026-01-02

### Added
- ✅ **Twitter OAuth implementation** - PIN-based OAuth 1.0a flow
- ✅ **Tweet posting** - `mcp__bip__tweet` tool fully functional
- ✅ **Thread creation** - `mcp__bip__thread` tool for multi-tweet threads
- ✅ **Status check** - `mcp__bip__status` tool to verify auth and config
- 💾 **Local storage** - Auth tokens, context, and history saved to `~/.build-in-public/`
- 🔐 **Credential verification** - Validates tokens and shows authenticated user
- 📊 **Tweet history** - Tracks all posted tweets and threads

### Technical Implementation
- `src/services/storage.ts` - Local file storage manager
- `src/services/twitter.ts` - Twitter API client with full functionality
- `src/utils/oauth.ts` - PIN-based OAuth flow with browser auto-open
- Interactive OAuth flow via stdin/stderr
- Token storage with proper file permissions (600)
- Error handling and user-friendly messages

### Features
- Post tweets immediately (max 280 chars)
- Create threaded tweets with automatic reply chains
- OAuth tokens stored locally and securely
- History tracking for tweets and threads
- Automatic username verification

## [0.1.0] - 2026-01-02

### Added
- 🎉 Initial MCP server implementation
- 📡 STDIO transport for Claude Code integration
- 🛠️ Tool stubs: `mcp__bip__tweet`, `mcp__bip__setup_auth`
- 📦 NPM package structure
- 📚 Basic documentation (README, LICENSE)
- 🏗️ TypeScript build setup

### Technical Details
- MCP SDK: @modelcontextprotocol/sdk v1.25.1
- Twitter API: twitter-api-v2 v1.28.0
- Runtime: Node.js 18+
- Architecture: 100% local via STDIO

[unreleased]: https://github.com/lucianfialho/build-in-public-mcp/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/lucianfialho/build-in-public-mcp/releases/tag/v0.1.0

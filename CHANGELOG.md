# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Planned
- Skill for automatic context tracking
- MCP prompts for tweet/thread templates
- Analytics integration (v2.0)

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

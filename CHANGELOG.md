# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Planned
- Twitter OAuth implementation
- Tweet posting functionality
- Thread creation
- Skill for automatic context tracking

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

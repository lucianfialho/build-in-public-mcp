# Build in Public MCP Server

> 🚧 **Alpha Version - Under Active Development**

MCP (Model Context Protocol) server for Build in Public - automatically share your dev progress on Twitter directly from Claude Code.

## 🎯 What is this?

This MCP server allows developers to share their coding progress on Twitter automatically while working with Claude Code. Perfect for the #BuildInPublic movement!

**Features:**
- 🐦 Post tweets immediately with `/bp` command
- 🧵 Create threads about your dev progress
- 🔐 OAuth authentication (tokens stored locally)
- 💯 100% local - no external servers needed
- ⚡ Fast STDIO transport

## 📦 Installation

### Method 1: NPX (Recommended)

```bash
claude mcp add --transport stdio build-in-public npx -y @lucianfialho/build-in-public-mcp
```

### Method 2: Global Install

```bash
npm install -g @lucianfialho/build-in-public-mcp
claude mcp add --transport stdio build-in-public build-in-public-mcp
```

## 🚀 Quick Start

### 1. Setup Twitter Authentication

First time only:
```
You: How do I setup build in public?
Claude: Let me help you setup Twitter authentication
> Calls: mcp__bip__setup_auth
> Opens browser for OAuth
> You authorize the app
> Copy PIN from Twitter
> Paste in terminal
✅ Done! Tokens saved to ~/.build-in-public/auth.json
```

### 2. Start Posting!

**Immediate tweet:**
```bash
/bp Just launched my new feature! 🚀
```

**Thread (coming soon):**
```
"Finished payment integration #thread"
[Claude works on it...]
[git push detected]
→ Thread auto-posted to Twitter
```

## 🛠️ Architecture

```
Claude Code → STDIO → MCP Server (local) → HTTPS → Twitter API
                           ↓
                 ~/.build-in-public/
                 - auth.json (OAuth tokens)
                 - context.json (Session context)
                 - history.json (Tweet history)
```

**100% local, zero external infrastructure!**

## 📚 Available Tools

### `mcp__bip__tweet`
Post a tweet immediately.

**Input:**
```json
{
  "message": "Your tweet message here"
}
```

**Returns:** Tweet URL

### `mcp__bip__setup_auth`
Setup Twitter OAuth authentication.

**Input:** None (interactive flow)

**Returns:** Auth status

### `mcp__bip__thread` *(coming soon)*
Create a Twitter thread from multiple messages.

## 🔐 Privacy & Security

- ✅ OAuth tokens stored locally in `~/.build-in-public/auth.json`
- ✅ Never sent to external servers (except Twitter API)
- ✅ No analytics, no tracking, no telemetry
- ✅ Open source - inspect the code yourself

## 🗺️ Roadmap

- [x] v0.1.0 - Basic MCP server + STDIO transport
- [ ] v0.2.0 - Twitter OAuth + tweet posting
- [ ] v0.3.0 - Thread creation
- [ ] v1.0.0 - Production ready
- [ ] v1.1.0 - Skill for automatic context tracking
- [ ] v2.0.0 - Optional Apify backend for analytics

## 🤝 Contributing

This is an early alpha! Contributions, issues, and feedback welcome.

**Repository:** [github.com/lucianfialho/build-in-public-mcp](https://github.com/lucianfialho/build-in-public-mcp)

## 📄 License

MIT License - see LICENSE file for details

## 🙏 Credits

Built with [Claude Code](https://claude.com/code) and inspired by the #BuildInPublic community.

---

**Made with ❤️ for developers who build in public**

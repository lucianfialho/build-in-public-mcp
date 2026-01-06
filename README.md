# Build in Public MCP Server

> ✅ **v0.3.2 - MCP Prompts & AI-Powered Suggestions!**

MCP (Model Context Protocol) server for Build in Public - automatically share your dev progress on Twitter directly from Claude Code.

## 🎯 What is this?

**The idea is simple:** If Claude Code is already helping you build, why not use it to document the journey too?

This MCP server analyzes your coding sessions and generates intelligent tweet suggestions about what you accomplished. Share your dev journey without breaking flow!

**Features:**
- 🤖 **AI-powered tweet suggestions** - Analyzes your coding session and suggests tweets
- 🔄 **Retrospective mode** (`/bp retro`) - Review entire session and extract achievements
- 🐦 Post tweets immediately with `/bp` command
- 🧵 Create threads about your dev progress
- 🔐 OAuth authentication (tokens stored locally)
- 💯 100% local - no external servers needed
- ⚡ Fast STDIO transport

## 📦 Installation

### Method 1: NPX (Recommended)

```bash
claude mcp add --transport stdio build-in-public npx @lucianfialho/build-in-public-mcp
```

### Method 2: Global Install

```bash
npm install -g @lucianfialho/build-in-public-mcp
claude mcp add --transport stdio build-in-public build-in-public-mcp
```

## 📖 How It Works

**The Philosophy:** If Claude Code is already helping you code, why not help you share your journey too?

1. **You code** - Claude Code assists you with development
2. **Context is captured** - Files changed, commands run, achievements unlocked
3. **AI analyzes** - When you run `/bp retro`, AI extracts meaningful insights
4. **Suggestions generated** - Get tweet ideas about what you actually accomplished
5. **One-click post** - Choose a suggestion and post to Twitter instantly

## 🚀 Quick Start

### 1. Setup Twitter Authentication

You have **two options** for authentication:

#### Option A: Interactive OAuth (Recommended)

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

#### Option B: Environment Variables

Set these environment variables before starting Claude Code:

```bash
export TWITTER_API_KEY="your_api_key"
export TWITTER_API_SECRET="your_api_secret"
export TWITTER_ACCESS_TOKEN="your_access_token"
export TWITTER_ACCESS_SECRET="your_access_secret"
```

**Where to get these credentials:**
1. Go to [Twitter Developer Portal](https://developer.twitter.com/en/portal/dashboard)
2. Create an app (or use existing)
3. Go to "Keys and tokens"
4. Copy API Key & Secret (Consumer Keys)
5. Generate Access Token & Secret

**Priority:** If both methods are configured, environment variables take precedence over `~/.build-in-public/auth.json`.

### 2. Start Posting!

#### Option 1: AI-Powered Retro (Recommended!)
Let Claude analyze your entire coding session and suggest tweets:

Just ask Claude naturally:
```
"Analyze my session and help me share what I accomplished on Twitter"
```

Or in other projects, you can use:
```
"Hey Claude, let's do a build in public retro"
```

Claude will:
- Review everything you did this session
- Extract achievements, learnings, and challenges
- Generate multiple tweet suggestions with confidence scores
- Let you choose or customize before posting

**Example flow:**
```
You: "Analyze my session and suggest a tweet about what I built"

Claude:
📊 Session Analysis Complete!

Achievements:
✅ Implemented OAuth authentication system
✅ Fixed 3 critical bugs
✅ Shipped v2.0 with new dashboard

Based on your session, here are tweet suggestions:

1. [85% confidence] "Just shipped v2.0! 🚀
   New features: OAuth login, redesigned dashboard, 3 bugs squashed.
   4 hours of flow state → production ready ✨ #BuildInPublic"

2. [75% confidence] "💡 TIL: OAuth token refresh is trickier than I thought..."

Which one would you like to post?

You: "Post #1"

Claude: ✅ Tweet posted! [shows URL]
```

#### Option 2: Quick Tweet
Just ask Claude to post directly:
```
"Post to Twitter: Just launched my new feature! 🚀"
```

#### Option 3: AI Suggestions from Current Context
```
"Give me tweet suggestions based on what I've been working on"
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

## 🎭 MCP Prompts (Advanced)

The server exposes MCP prompts that Claude can use automatically:

### `retro`
Triggers full session analysis and tweet generation workflow.

### `quick <message>`
Posts a quick tweet with the provided message.

### `suggest`
Generates AI-powered tweet suggestions from current session context.

**Note:** You don't need to use these directly - just talk to Claude naturally and it will use them when appropriate!

## 📚 Available Tools

### `mcp__bip__tweet`
Post a tweet immediately.

**Input:**
```json
{
  "message": "Your tweet message here (max 280 chars)"
}
```

**Returns:** Tweet URL

### `mcp__bip__thread`
Create a Twitter thread from multiple messages. Posts tweets in reply chain.

**Input:**
```json
{
  "messages": ["Tweet 1", "Tweet 2", "Tweet 3"]
}
```

**Returns:** Array of tweet URLs

### `mcp__bip__setup_auth`
Setup Twitter OAuth authentication via PIN-based flow.

**Input:** None (interactive flow)

**Returns:** Auth status and username

### `mcp__bip__status`
Check authentication status and show storage location.

**Input:** None

**Returns:** Status info including authenticated user

## 🔐 Privacy & Security

- ✅ OAuth tokens stored locally in `~/.build-in-public/auth.json`
- ✅ Never sent to external servers (except Twitter API)
- ✅ No analytics, no tracking, no telemetry
- ✅ Open source - inspect the code yourself

## 🗺️ Roadmap

- [x] v0.1.0 - Basic MCP server + STDIO transport
- [x] v0.2.0 - Twitter OAuth + tweet posting + thread creation
- [x] v0.3.0 - AI-powered suggestions + retro mode + context tracking
- [x] v0.3.2 - MCP prompts integration (retro, quick, suggest) ✅
- [ ] v1.0.0 - Production ready + comprehensive docs
- [ ] v1.1.0 - Enhanced hooks for automatic context tracking
- [ ] v2.0.0 - Optional analytics and insights

## 🤝 Contributing

This is an early alpha! Contributions, issues, and feedback welcome.

**Repository:** [github.com/lucianfialho/build-in-public-mcp](https://github.com/lucianfialho/build-in-public-mcp)

## 📄 License

MIT License - see LICENSE file for details

## 🙏 Credits

Built with [Claude Code](https://claude.com/code) and inspired by the #BuildInPublic community.

---

**Made with ❤️ for developers who build in public**

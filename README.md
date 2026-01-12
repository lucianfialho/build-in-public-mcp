# Build in Public MCP Server

> ✅ **v0.4.1 - OAuth Fix for STDIO!**

MCP (Model Context Protocol) server for Build in Public - automatically share your dev progress on Twitter directly from Claude Code, Cursor, VS Code, JetBrains IDEs, and more!

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
- 🔌 **Multi-IDE support** - Works with Claude Code, Cursor, VS Code, JetBrains, and more!

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

## 🔌 Compatible with Multiple IDEs

This MCP server uses **STDIO transport**, making it compatible with various AI-powered IDEs and editors!

### Cursor

Add to your `~/.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "build-in-public": {
      "command": "npx",
      "args": ["@lucianfialho/build-in-public-mcp"]
    }
  }
}
```

**How to configure:**
1. Open Command Palette (`Ctrl+Shift+P` or `Cmd+Shift+P`)
2. Search for "Cursor Settings"
3. Click "MCP" in sidebar
4. Click "Add new global MCP server"
5. Paste the configuration above

**Note:** MCP tools are available in Cursor's Agent/Composer. Cursor currently supports up to 40 tools.

### VS Code

Add to your User Settings JSON (`Ctrl+Shift+P` → "Preferences: Open User Settings (JSON)"):

```json
{
  "mcp.servers": {
    "build-in-public": {
      "command": "npx",
      "args": ["@lucianfialho/build-in-public-mcp"],
      "transport": "stdio"
    }
  }
}
```

### JetBrains IDEs (IntelliJ, PyCharm, WebStorm, Android Studio)

**Requires:** v2025.2 or later

1. Go to Settings → Tools → AI Assistant → Model Context Protocol
2. Add a new MCP server:
   - **Name:** build-in-public
   - **Transport:** STDIO
   - **Command:** `npx`
   - **Arguments:** `@lucianfialho/build-in-public-mcp`

### Visual Studio

**Requires:** VS 2026 or VS 2022 v17.14+

1. Go to Tools → Options → AI Assistant → MCP Servers
2. Add new server:
   - **Transport:** STDIO
   - **Command:** `npx @lucianfialho/build-in-public-mcp`

### Claude Desktop

Add to your config file:

**macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows:** `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "build-in-public": {
      "command": "npx",
      "args": ["@lucianfialho/build-in-public-mcp"]
    }
  }
}
```

### Windsurf / Cline

Follow similar configuration patterns as VS Code or Cursor. Refer to your IDE's MCP documentation.

---

**💡 Tip:** If you installed globally (`npm install -g`), replace `"command": "npx"` with `"command": "build-in-public-mcp"` and remove the args array.

## 📖 How It Works

**The Philosophy:** If Claude Code is already helping you code, why not help you share your journey too?

1. **You code** - Claude Code assists you with development
2. **Context is captured** - Files changed, commands run, achievements unlocked
3. **AI analyzes** - When you run `/bp retro`, AI extracts meaningful insights
4. **Suggestions generated** - Get tweet ideas about what you actually accomplished
5. **One-click post** - Choose a suggestion and post to Twitter instantly

## 🚀 Quick Start

### 1. Setup Twitter Authentication (2-Step Process)

**Step 1: Start OAuth Flow**

```
You: Setup build in public authentication
Claude:
  🔐 Twitter Authorization

  ✅ Authorization URL opened in your browser!

  📋 If the browser didn't open, go to:
  https://api.twitter.com/oauth/authorize?oauth_token=...

  After authorizing, Twitter will show you a PIN code.

  📝 Next step: Call this tool again with the PIN:
     mcp__bip__setup_auth with pin: "YOUR_PIN_HERE"
```

**Step 2: Complete with PIN**

```
You: Call setup_auth with pin: "1234567"
Claude:
  🔄 Exchanging PIN for access tokens...
  ✅ Verifying credentials...

  🎉 Successfully authenticated as: @your_username
  💾 Tokens saved to: ~/.build-in-public/auth.json

  You can now use:
    - mcp__bip__tweet to post tweets
    - mcp__bip__thread to create threads
```

**That's it!** No need to:
- ❌ Create a Twitter Developer account
- ❌ Create an app
- ❌ Copy API keys
- ❌ Configure permissions

Just authorize and paste the PIN! 🎉

---

#### Advanced: Use Your Own Twitter App (Optional)

If you want to use your own Twitter app instead of the default:

**Option 1: Environment Variables (For Access Tokens)**
```bash
export TWITTER_ACCESS_TOKEN="your_access_token"
export TWITTER_ACCESS_SECRET="your_access_secret"
```

**Option 2: Custom App Credentials (For OAuth)**
```bash
export TWITTER_APP_KEY="your_app_key"
export TWITTER_APP_SECRET="your_app_secret"
```

Then run the OAuth flow normally.

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
AI IDE/Editor → STDIO → MCP Server (local) → HTTPS → Twitter API
                            ↓
                  ~/.build-in-public/
                  - auth.json (OAuth tokens)
                  - context.json (Session context)
                  - history.json (Tweet history)
```

**100% local, zero external infrastructure!**

The STDIO transport makes this server compatible with any MCP-enabled IDE or editor, including Claude Code, Cursor, VS Code, JetBrains IDEs, Visual Studio, Claude Desktop, Windsurf, and Cline.

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
- [x] v0.3.2 - MCP prompts integration (retro, quick, suggest)
- [x] v0.3.3 - Multi-IDE compatibility documentation
- [x] v0.4.0 - Simplified OAuth (no Twitter Developer account needed!)
- [x] v0.4.1 - Fixed OAuth STDIO conflict (2-step PIN flow) ✅
- [ ] v0.5.0 - Official testing on Cursor, VS Code, JetBrains
- [ ] v1.0.0 - Production ready + comprehensive docs
- [ ] v1.1.0 - Enhanced hooks for automatic context tracking
- [ ] v2.0.0 - Optional analytics and insights

## 🤝 Contributing

This is an early alpha! Contributions, issues, and feedback welcome.

**Repository:** [github.com/lucianfialho/build-in-public-mcp](https://github.com/lucianfialho/build-in-public-mcp)

## 📄 License

MIT License - see LICENSE file for details

---

**Made with ❤️ for developers who build in public**

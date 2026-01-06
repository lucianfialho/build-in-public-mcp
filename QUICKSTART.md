# Quick Start Guide

## Install in 2 Minutes

### Step 1: Install the MCP Server

```bash
# Using NPX (recommended - always latest version)
claude mcp add --transport stdio build-in-public npx @lucianfialho/build-in-public-mcp

# OR install globally
npm install -g @lucianfialho/build-in-public-mcp
claude mcp add --transport stdio build-in-public build-in-public-mcp
```

After adding, **restart Claude Code** for changes to take effect.

### Step 2: Setup Twitter Authentication

You have **two options**:

#### Option A: Interactive OAuth (Recommended)

In Claude Code, ask:
```
Setup Twitter authentication for build in public
```

Claude will call `mcp__bip__setup_auth` which will:
1. Ask for your Twitter API credentials
2. Open browser for authorization
3. Ask you to enter the PIN from Twitter
4. Save tokens to `~/.build-in-public/auth.json`

#### Option B: Environment Variables

Set these before starting Claude Code:
```bash
export TWITTER_API_KEY="your_api_key"
export TWITTER_API_SECRET="your_api_secret"
export TWITTER_ACCESS_TOKEN="your_access_token"
export TWITTER_ACCESS_SECRET="your_access_secret"
```

**Where to get credentials:**
1. Go to [Twitter Developer Portal](https://developer.twitter.com/en/portal/dashboard)
2. Create an app (if you don't have one)
3. Go to "Keys and tokens"
4. Copy:
   - API Key & Secret (Consumer Keys)
   - Access Token & Secret (generate if needed)

### Step 3: Start Posting!

Just talk to Claude naturally! The MCP server provides prompts that Claude uses automatically.

## Usage Examples

### Quick Tweet
```
You: Post to Twitter: Just shipped a new feature! 🚀

Claude: [Posts to Twitter via mcp__bip__tweet]
✅ Tweet posted: https://twitter.com/you/status/123...
```

### AI-Powered Retro (Analyze Your Session)
```
You: Analyze my coding session and suggest a tweet about what I built

Claude: [Reviews session, extracts achievements, generates suggestions]
📊 Session Analysis Complete!

Achievements:
✅ Implemented OAuth authentication
✅ Fixed 3 bugs
✅ Deployed to production

Tweet Suggestions:
1. [85% confidence] "Just shipped OAuth! 🚀 ..."
2. [75% confidence] "💡 TIL about token refresh..."

Which would you like to post?
```

### Create a Thread
```
You: Create a thread about the OAuth feature I just built

Claude: [Analyzes context, creates thread via mcp__bip__thread]
✅ Thread posted! [URLs]
```

### Check Status
```
You: What's the status of build in public?

Claude: [Calls mcp__bip__status]
📊 Build in Public MCP Server Status
Version: 0.3.2
✅ Authenticated as: @your_username
```

## Troubleshooting

### "Not authenticated" error

Run setup again:
```
Setup Twitter auth
```

### MCP server not found

Check if it's registered:
```bash
claude mcp list
```

If not listed, add it again:
```bash
claude mcp add --transport stdio build-in-public npx @lucianfialho/build-in-public-mcp
```

Then restart Claude Code.

### OAuth flow doesn't open browser

The URL will be printed to terminal. Copy and paste it manually into your browser.

### Tokens invalid

Delete old tokens and re-authenticate:
```bash
rm ~/.build-in-public/auth.json
```

Then setup auth again.

## What Gets Created

After setup, you'll have:

```
~/.build-in-public/
├── auth.json       # Your Twitter OAuth tokens
├── context.json    # Session context (optional)
└── history.json    # Tweet/thread history
```

**Important:** Never commit `auth.json` to git!

## Next Steps

- Read [README.md](README.md) for full documentation
- Check [examples/basic-usage.md](examples/basic-usage.md) for more examples
- Report issues on [GitHub](https://github.com/lucianfialho/build-in-public-mcp/issues)

---

**Happy building in public! 🚀**

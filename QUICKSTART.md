# Quick Start Guide

## Install in 2 Minutes

### Step 1: Install the MCP Server

```bash
# Using NPX (recommended - always latest version)
claude mcp add --transport stdio build-in-public npx -y @lucianfialho/build-in-public-mcp

# OR install globally
npm install -g @lucianfialho/build-in-public-mcp
claude mcp add --transport stdio build-in-public build-in-public-mcp
```

### Step 2: Setup Twitter Authentication

In Claude Code, ask:
```
Setup Twitter authentication for build in public
```

Claude will call `mcp__bip__setup_auth` which will:
1. Ask for your Twitter API credentials
2. Open browser for authorization
3. Ask you to enter the PIN from Twitter
4. Save tokens to `~/.build-in-public/auth.json`

**Where to get API credentials:**
1. Go to [Twitter Developer Portal](https://developer.twitter.com/en/portal/dashboard)
2. Create an app (if you don't have one)
3. Go to "Keys and tokens"
4. Copy your:
   - API Key (Consumer Key)
   - API Secret (Consumer Secret)

### Step 3: Start Posting!

```
You: /bp Just shipped a new feature! 🚀

Claude: [Posts to Twitter]
✅ Tweet posted: https://twitter.com/you/status/123...
```

## Usage Examples

### Immediate Tweet
```
/bp Launched my new product today! 🎉
```

### Create a Thread
```
Create a thread about the feature I just built
```

Claude will call `mcp__bip__thread` with messages like:
```
["🧵 Just built OAuth integration", "It took 3 days but works perfectly", "Next up: payment processing"]
```

### Check Status
```
What's the status of build in public?
```

Claude will call `mcp__bip__status` and show:
- Authentication status
- Storage location
- Available tools

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
claude mcp add --transport stdio build-in-public npx -y @lucianfialho/build-in-public-mcp
```

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

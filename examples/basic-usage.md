# Basic Usage Examples

## Installation

### Quick Start (NPX)

```bash
claude mcp add --transport stdio build-in-public npx @lucianfialho/build-in-public-mcp
```

Then restart Claude Code.

This command tells Claude Code to:
- Add an MCP server named "build-in-public"
- Use STDIO transport (stdin/stdout communication)
- Run via NPX (always uses latest version from NPM)

### Permanent Installation

```bash
# Install globally
npm install -g @lucianfialho/build-in-public-mcp

# Add to Claude Code
claude mcp add --transport stdio build-in-public build-in-public-mcp
```

## Usage in Claude Code

### Tweet Immediately

Just ask Claude naturally:

```
You: Post to Twitter: Just shipped a new feature! 🚀

Claude: I'll post that tweet for you...
> Calls: mcp__bip__tweet({ message: "Just shipped a new feature! 🚀" })
> Returns: ✅ Tweet posted: https://twitter.com/you/status/123...

Claude: ✅ Tweet posted! Your tweet is live at https://twitter.com/you/status/123...
```

**Alternative ways to ask:**
- "Share on Twitter: [your message]"
- "Tweet this: [your message]"
- "Post a tweet about [topic]"

### Setup Authentication (First Time)

```
You: Setup Twitter auth for build in public

Claude: I'll help you setup Twitter authentication
> Calls: mcp__bip__setup_auth()
> MCP server opens browser
> You authorize the app on Twitter
> You copy the PIN
> You paste PIN in terminal

Claude: ✅ Authentication complete! Tokens saved to ~/.build-in-public/auth.json
```

## How It Works

### Architecture

```
┌─────────────────────┐
│   Claude Code       │
│   (Your IDE)        │
└──────────┬──────────┘
           │ STDIO (stdin/stdout)
           ▼
┌─────────────────────┐
│   MCP Server        │
│   (Local Process)   │
│   - Receives tools  │
│   - Executes logic  │
└──────────┬──────────┘
           │ HTTPS
           ▼
┌─────────────────────┐
│   Twitter API       │
└─────────────────────┘
```

### Data Flow

1. **You send a message** in Claude Code (e.g., "Post to Twitter: My message")
2. **Claude understands** your intent and decides to use MCP tool
3. **Claude calls** `mcp__bip__tweet` via STDIO
4. **MCP server** receives the call, processes it
5. **MCP server** posts to Twitter API
6. **MCP server** returns result to Claude
7. **Claude shows** the result to you

**Note:** Claude uses MCP prompts (`retro`, `quick`, `suggest`) automatically when appropriate. You don't need to memorize commands!

### Storage

All data is stored locally in `~/.build-in-public/`:

```
~/.build-in-public/
├── auth.json          # OAuth tokens (encrypted)
├── context.json       # Session context
└── history.json       # Tweet/thread history
```

**Important:** These files contain your Twitter credentials. Never commit them to git!

## Troubleshooting

### MCP server not found

```bash
# Check if MCP is installed
claude mcp list

# If not listed, add it again
claude mcp add --transport stdio build-in-public npx @lucianfialho/build-in-public-mcp

# Then restart Claude Code
```

### Auth not working

```bash
# Remove old auth file
rm ~/.build-in-public/auth.json

# In Claude Code, ask:
# "Setup Twitter auth for build in public"
```

### Tools not appearing

Verify the MCP server is listed and connected:
```bash
claude mcp list

# Should show:
# build-in-public: npx @lucianfialho/build-in-public-mcp - ✓ Connected
```

## Advanced Usage

### Custom Context (Coming Soon)

```
You: Create a thread about the auth feature I just built #thread

Claude: Let me gather context and create a thread...
> Calls: mcp__bip__thread({
    messages: ["🧵 Just built Twitter OAuth integration"],
    context: {
      files: ["src/utils/oauth.ts", "src/services/twitter.ts"],
      commands: ["npm install twitter-api-v2"],
      tools: ["Write", "Edit", "Bash"]
    }
  })

Claude: ✅ Thread posted! [link]
```

## Next Steps

- Read the [main README](../README.md) for full documentation
- Check the [roadmap](../CHANGELOG.md) for upcoming features
- Report issues on [GitHub](https://github.com/lucianfialho/build-in-public-mcp/issues)

---

**Happy building in public! 🚀**

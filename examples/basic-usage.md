# Basic Usage Examples

## Installation

### Quick Start (NPX)

```bash
claude mcp add --transport stdio build-in-public npx -y @lucianfialho/build-in-public-mcp
```

This command tells Claude Code to:
- Add an MCP server named "build-in-public"
- Use STDIO transport (stdin/stdout communication)
- Run via NPX (always uses latest version)

### Permanent Installation

```bash
# Install globally
npm install -g @lucianfialho/build-in-public-mcp

# Add to Claude Code
claude mcp add --transport stdio build-in-public build-in-public-mcp
```

## Usage in Claude Code

### Tweet Immediately

```
You: /bp Just shipped a new feature! 🚀

Claude: Let me post that tweet for you...
> Calls: mcp__bip__tweet({ message: "Just shipped a new feature! 🚀" })
> Returns: ✅ Tweet posted: https://twitter.com/you/status/123...

Claude: Done! Your tweet is live at [link]
```

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

1. **You type a command** in Claude Code (e.g., `/bp My message`)
2. **Claude recognizes** it needs to use MCP tool
3. **Claude calls** `mcp__bip__tweet` via STDIO
4. **MCP server** receives the call, processes it
5. **MCP server** posts to Twitter API
6. **MCP server** returns result to Claude
7. **Claude shows** the result to you

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
claude mcp add --transport stdio build-in-public npx -y @lucianfialho/build-in-public-mcp
```

### Auth not working

```bash
# Remove old auth file
rm ~/.build-in-public/auth.json

# Setup again
# In Claude Code:
# "Setup Twitter auth"
```

### Tools not appearing

Check Claude Code MCP configuration:
```bash
cat ~/.config/claude/mcp.json
# or on macOS:
cat ~/Library/Application\ Support/Claude/mcp.json
```

Should contain:
```json
{
  "mcpServers": {
    "build-in-public": {
      "command": "npx",
      "args": ["-y", "@lucianfialho/build-in-public-mcp"],
      "transport": "stdio"
    }
  }
}
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

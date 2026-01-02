# Thread Creation Example

## Scenario

You just finished implementing a new authentication feature and want to share your progress.

## Input

In Claude Code:
```
Create a thread about the OAuth feature I just built
```

Claude analyzes context and calls:
```typescript
mcp__bip__thread({
  messages: [
    "🧵 Just finished implementing Twitter OAuth for my build-in-public MCP server!",
    "The flow is PIN-based which works great for CLI tools. Browser auto-opens and you just paste the PIN.",
    "Tokens are stored locally in ~/.build-in-public/ with 600 permissions for security.",
    "Next up: Adding thread creation support! (which I'm using right now 🤯)"
  ]
})
```

## Output on Twitter

**Tweet 1** (Thread start):
```
🧵 Just finished implementing Twitter OAuth for my build-in-public MCP server!
```

**Tweet 2** (Reply to Tweet 1):
```
The flow is PIN-based which works great for CLI tools. Browser auto-opens and you just paste the PIN.
```

**Tweet 3** (Reply to Tweet 2):
```
Tokens are stored locally in ~/.build-in-public/ with 600 permissions for security.
```

**Tweet 4** (Reply to Tweet 3):
```
Next up: Adding thread creation support! (which I'm using right now 🤯)
```

## Claude's Response

```
✅ Thread posted successfully!

🧵 4 tweets in thread
🔗 Thread starts at: https://twitter.com/you/status/123456789

All tweet URLs:
  1. https://twitter.com/you/status/123456789
  2. https://twitter.com/you/status/123456790
  3. https://twitter.com/you/status/123456791
  4. https://twitter.com/you/status/123456792
```

## How It Works

1. **MCP Server receives** the `mcp__bip__thread` call with array of messages
2. **Posts first tweet** - This becomes the thread anchor
3. **For each subsequent tweet**:
   - Posts as reply to previous tweet
   - Waits 1 second to avoid rate limiting
   - Tracks all tweet IDs and URLs
4. **Returns** all URLs to Claude
5. **Saves to history** in `~/.build-in-public/history.json`

## History File

After posting, `~/.build-in-public/history.json` contains:

```json
{
  "tweets": [],
  "threads": [
    {
      "id": "123456789",
      "urls": [
        "https://twitter.com/you/status/123456789",
        "https://twitter.com/you/status/123456790",
        "https://twitter.com/you/status/123456791",
        "https://twitter.com/you/status/123456792"
      ],
      "messages": [
        "🧵 Just finished implementing Twitter OAuth for my build-in-public MCP server!",
        "The flow is PIN-based which works great for CLI tools. Browser auto-opens and you just paste the PIN.",
        "Tokens are stored locally in ~/.build-in-public/ with 600 permissions for security.",
        "Next up: Adding thread creation support! (which I'm using right now 🤯)"
      ],
      "timestamp": "2026-01-02T14:30:00.000Z"
    }
  ]
}
```

## Tips

### Max Tweet Length

Each message must be ≤280 characters. If any message is too long, the tool returns an error:

```
❌ Error: Message 2 is too long (315 characters, max 280)
```

### Thread Size

No hard limit on thread size, but Twitter has rate limits:
- **300 tweets per 3 hours** for your account
- Each thread consumes N tweets (where N = number of messages)

### Emojis

Emojis count as characters:
- 🧵 = 2 characters
- 🚀 = 2 characters
- 😀 = 2 characters

Plan accordingly when composing messages.

### Rate Limiting

The MCP server automatically:
- Waits 1 second between tweets in a thread
- Handles Twitter API rate limit errors gracefully
- Returns clear error messages if rate limited

## Real-World Usage

### Example 1: Feature Launch

```javascript
mcp__bip__thread({
  messages: [
    "🎉 Launching our new AI chat feature today!",
    "Built with Claude Code and shipped in 2 weeks",
    "Key features: streaming responses, markdown support, code highlighting",
    "Try it now at https://myapp.com 🚀"
  ]
})
```

### Example 2: Bug Fix

```javascript
mcp__bip__thread({
  messages: [
    "🐛 Fixed a critical auth bug today",
    "Issue: tokens were expiring after 1 hour instead of 7 days",
    "Root cause: wrong TTL config in Redis",
    "Lesson learned: always test token expiration in staging!"
  ]
})
```

### Example 3: Learning in Public

```javascript
mcp__bip__thread({
  messages: [
    "📚 Today I learned about MCP (Model Context Protocol)",
    "It's like LSP but for AI - standardizes how AI apps connect to tools",
    "Built my first MCP server in TypeScript. Super straightforward!",
    "Check it out: https://github.com/user/my-mcp-server"
  ]
})
```

---

**Happy threading! 🧵**

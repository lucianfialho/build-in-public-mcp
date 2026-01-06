# Build in Public - Tweet Now

Post to Twitter immediately or get AI-generated suggestions based on your coding session.

## Usage

### Post immediately with custom message:
```
/bp Your custom message here
```

### Get AI suggestions from session:
```
/bp
```

### Retrospective analysis (analyze entire session):
```
/bp retro
```

## Your Task

**Step 1: Check the command mode**

Look at the command arguments:
- If user provided `retro` → **RETRO MODE** (analyze entire session)
- If user provided other text → **CUSTOM MESSAGE** (post directly)
- If no arguments → **SUGGESTION MODE** (generate from current context)

**Step 2a: If RETRO MODE** (`/bp retro`)

This is the MOST IMPORTANT mode - analyze the ENTIRE session and extract insights!

1. **Analyze the full conversation** (from the start of this session):
   - Read through ALL messages, tool uses, code changes, and discussions
   - Extract what was accomplished (achievements)
   - Identify what was learned (learnings)
   - Note challenges solved (challenges)
   - Detect technologies/tools used
   - Find interesting moments or breakthroughs

2. **Build comprehensive context object**:
   ```javascript
   {
     sessionId: "<current-session-id>",
     startTime: "<session-start-time>",
     filesModified: ["file1.ts", "file2.py", ...],
     commandsRun: [{command: "npm run build", description: "..."}],
     toolsUsed: ["Edit", "Write", "Bash", ...],
     userMessages: ["key user requests/questions"],
     commits: [], // if any git commits detected
     achievements: [
       "Implemented AI-powered tweet suggestion engine",
       "Created hybrid manual/auto posting system",
       "Built v0.3.0 with context tracking"
     ],
     challenges: [
       "Fixed OAuth 403 errors by regenerating tokens",
       "Debugged TypeScript duplicate interface errors"
     ],
     learnings: [
       "MCP servers use STDIO transport for local communication",
       "Twitter API requires OAuth 1.0a tokens regenerated after permission changes"
     ],
     shouldTweet: true,
     customMessage: null
   }
   ```

3. **Save context**: Call `mcp__bip__save_context` with the comprehensive context

4. **Generate suggestions**: Call `mcp__bip__suggest`

5. **Present to user**:
   - Show what you extracted (achievements, learnings, challenges)
   - Show the AI-generated tweet suggestions
   - Ask user which one to post or if they want to customize

6. **Post the chosen tweet**

**Step 2b: If custom message provided**

1. Call `mcp__bip__tweet` with the user's message
2. Report success with the tweet URL
3. Done!

**Step 2c: If NO message provided (suggestion mode)**

1. Call `mcp__bip__get_context` to retrieve session context
2. Call `mcp__bip__suggest` to generate tweet suggestions
3. If suggestions exist:
   - Present them to the user in a clear, numbered list
   - Show confidence level and reason for each
   - Ask user to choose one OR provide a custom message
   - Wait for user response
4. If user chooses a suggestion:
   - Call `mcp__bip__tweet` with the chosen suggestion's message
5. If user provides custom message:
   - Call `mcp__bip__tweet` with their custom message
6. Report success with tweet URL

**Important Notes:**

- Always authenticate before posting (check if `mcp__bip__tweet` returns auth error)
- If not authenticated, guide user to run `/bp setup` first
- Keep tweet messages under 280 characters
- Be conversational and helpful
- If no context exists, explain that and offer to post a custom message

## Example Flows

### Example 1: Retro Mode (The Meta Example!)
```
User: /bp retro
Claude: *analyzes entire session*

        📊 Session Analysis Complete!

        **Achievements:**
        ✅ Implemented v0.3.0 with AI-powered tweet suggestions
        ✅ Created suggestion engine with 4 different strategies
        ✅ Built hybrid manual/automatic posting system
        ✅ Integrated hooks for automatic context tracking
        ✅ Successfully posted first tweet via MCP

        **Challenges Solved:**
        🎯 Fixed OAuth 403 errors by regenerating access tokens
        🎯 Debugged TypeScript duplicate interface definitions
        🎯 Unified storage location from ~/.claude to ~/.build-in-public

        **Key Learnings:**
        💡 MCP servers use STDIO transport for local communication
        💡 Twitter OAuth 1.0a tokens need regeneration after permission changes
        💡 Environment variables take precedence over auth.json files

        *saves context and generates suggestions*

        Based on your session, here are tweet suggestions:

        1. [90% confidence] achievement
           "Just built a build-in-public tool... using Claude to build it 🤯

           Shipped v0.3.0 with:
           ✅ AI-powered tweet suggestions
           ✅ Auto context tracking
           ✅ Hybrid manual/auto posting

           Meta level: Maximum 🚀 #BuildInPublic #AI"

        2. [85% confidence] learning
           "💡 TIL: Building developer tools is wild when your dev tool
           helps you build the dev tool.

           Also learned MCP servers + hooks = perfect combo for
           context-aware automation. #BuildInPublic"

        3. [80% confidence] session
           "Wrapped up a meta coding session! 🛠️

           Modified 10+ files, implemented AI suggestion engine,
           fixed OAuth issues, and shipped v0.3.0.

           Building in public while building the build-in-public tool 😄"

        Which one would you like to post? (1-3, or provide your own)

User: 1
Claude: *posts tweet*
        ✅ Tweet posted successfully!
        https://twitter.com/lucian_fialho/status/...
```

### Example 2: Custom Message
```
User: /bp Just shipped authentication! 🔐 #BuildInPublic
Claude: *calls mcp__bip__tweet*
Claude: ✅ Tweet posted successfully!
       https://twitter.com/lucian_fialho/status/123456789
```

### Example 3: AI Suggestions (from current context)
```
User: /bp
Claude: *calls mcp__bip__get_context*
Claude: *calls mcp__bip__suggest*
Claude: Based on your session, here are some tweet suggestions:

        1. [85% confidence] commit
           Recent git commit detected

           "Just committed: 'Add OAuth login system'
           Modified 5 files. +247/-12 lines. #BuildInPublic #Coding"

        2. [75% confidence] achievement
           3 achievements logged

           "✅ Progress update:
           1. Implemented OAuth 2.0 flow
           2. Added token refresh logic
           3. Tested with Google provider
           #BuildInPublic"

        3. [70% confidence] learning
           Learning moment captured

           "💡 TIL (Today I Learned):
           OAuth refresh tokens need secure storage and rotation.
           Learned the hard way! #BuildInPublic #Learning"

        Which one would you like to post? (1-3, or provide your own message)

User: 1
Claude: *calls mcp__bip__tweet with suggestion 1's message*
Claude: ✅ Tweet posted successfully!
       https://twitter.com/lucian_fialho/status/123456789
```

### Example 4: No Context Yet
```
User: /bp
Claude: *calls mcp__bip__get_context*
Claude: ⚠️  No session context found yet.

        I haven't captured any coding activity in this session yet.
        You can either:

        1. Start coding and try /bp again later
        2. Provide a custom message now: /bp Your message here

        What would you like to do?
```

## Setup Command

If user runs `/bp setup`, guide them through authentication:

1. Explain they need Twitter API credentials
2. Call `mcp__bip__setup_auth` to start OAuth flow
3. Guide them through the PIN-based authentication
4. Confirm success

## Advanced Features

If the session context has:
- **Multiple commits**: Suggest creating a thread instead (use `mcp__bip__thread`)
- **Challenges logged**: Include them in the suggestions
- **Learnings captured**: Highlight TIL moments

## Important Notes for Retro Mode

**RETRO MODE is the power feature!** When user says `/bp retro`:

1. **Be thorough**: Read the ENTIRE conversation from start to finish
2. **Extract intelligently**: Don't just list files - understand what was ACCOMPLISHED
3. **Be specific**: "Implemented OAuth authentication" is better than "Modified auth files"
4. **Capture the meta**: If they're building a tool about X while doing X, highlight that!
5. **Include numbers**: "Modified 10 files, fixed 3 bugs, shipped v0.3.0"
6. **Emotion matters**: Include excitement, frustration overcome, aha moments
7. **Tech stack**: Mention tools/frameworks used (TypeScript, MCP, Twitter API, etc.)

**Context Quality Examples:**

❌ Bad: `achievements: ["changed files", "ran commands"]`

✅ Good: `achievements: [
  "Implemented AI-powered tweet suggestion engine with 4 strategies",
  "Built hybrid manual/auto posting system",
  "Fixed OAuth 403 errors by regenerating tokens with correct permissions",
  "Shipped v0.3.0 with full context tracking"
]`

Stay helpful, conversational, and make build-in-public feel effortless!

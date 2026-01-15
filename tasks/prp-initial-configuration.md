# PRP: Initial Configuration Flow

## Introduction
Add an initial configuration flow that prompts users to set their preferences (language and enabled features) before posting their first thread. Users can skip and use defaults (en-US, all features enabled) or configure later via a dedicated tool.

## Goals
- Provide a smooth onboarding experience with optional configuration
- Support multiple languages for tweet generation (starting with pt-BR and en-US)
- Allow users to enable/disable specific features (commit tweets, achievement tweets, learning tweets)
- Store preferences persistently in `~/.build-in-public/preferences.json`
- Enable reconfiguration at any time via MCP tool
- Never block users - defaults always available

## User Stories

### US-001: Create preferences storage system
**Description:** As a developer, I need to store user preferences persistently so they are remembered across sessions.

**Acceptance Criteria:**
- [ ] Create `UserPreferences` interface with: `language`, `features` object (enableCommitTweets, enableAchievementTweets, enableLearningTweets)
- [ ] Add methods to storage service: `savePreferences()`, `loadPreferences()`, `hasPreferences()`
- [ ] Preferences saved to `~/.build-in-public/preferences.json` with 0o600 permissions
- [ ] Typecheck passes

### US-002: Implement preferences service with defaults
**Description:** As a developer, I need a service that handles preferences with sensible defaults so users can use the system immediately.

**Acceptance Criteria:**
- [ ] Create `PreferencesService` with `getPreferences()` method
- [ ] Default values: language='en-US', all features enabled (true)
- [ ] Service loads from file if exists, otherwise returns defaults
- [ ] Service has `updatePreferences()` method to save changes
- [ ] Typecheck passes

### US-003: Create MCP configure tool
**Description:** As a user, I want Claude to help me configure my preferences so I can customize tweet generation.

**Acceptance Criteria:**
- [ ] Add `mcp__bip__configure` tool with parameters: language (optional), features (optional)
- [ ] Tool accepts: language ('pt-BR' | 'en-US'), features object with boolean flags
- [ ] Tool validates input and saves to preferences.json
- [ ] Tool returns current configuration after saving
- [ ] If no parameters provided, returns current config without changing
- [ ] Typecheck passes

### US-004: Check configuration before first thread
**Description:** As a user, I want to be prompted to configure preferences before posting my first thread so I can customize the experience.

**Acceptance Criteria:**
- [ ] Before generating thread suggestions, check if preferences exist
- [ ] If no preferences file exists AND user is about to post first thread, suggest running configure tool
- [ ] Suggestion is informative, not blocking (user can proceed with defaults)
- [ ] Check integrated into `suggest` and `retro` prompts
- [ ] Typecheck passes

### US-005: Update suggestion engine to use language preference
**Description:** As a user, I want tweets generated in my preferred language so my audience can understand them.

**Acceptance Criteria:**
- [ ] Suggestion engine loads language from preferences
- [ ] All tweet templates and prompts use the configured language
- [ ] System message in suggestion engine includes language instruction
- [ ] Default to 'en-US' if preferences not set
- [ ] Typecheck passes

### US-006: Add reconfigure capability
**Description:** As a user, I want to change my preferences later so I can adjust settings as my needs change.

**Acceptance Criteria:**
- [ ] `mcp__bip__configure` tool can be called multiple times
- [ ] Tool merges partial updates (doesn't require all fields)
- [ ] Tool shows before/after configuration when updating
- [ ] Documentation updated with reconfigure example
- [ ] Typecheck passes

## Functional Requirements
- FR-1: Store user preferences in `~/.build-in-public/preferences.json` with secure permissions
- FR-2: Support languages: 'pt-BR' (Portuguese Brazil) and 'en-US' (English US)
- FR-3: Support feature toggles: enableCommitTweets, enableAchievementTweets, enableLearningTweets
- FR-4: Provide defaults: language='en-US', all features=true
- FR-5: Never block user actions - always allow proceeding with defaults
- FR-6: Prompt configuration before first thread (suggestion only, not requirement)
- FR-7: Allow reconfiguration at any time via MCP tool
- FR-8: Suggestion engine respects language preference when generating tweets

## Non-Goals
- No support for custom languages beyond pt-BR and en-US in this version
- No advanced configuration (tone, style, templates) - only language and feature toggles
- No migration of existing users - they'll get defaults until they configure
- No validation of Twitter API compatibility with different languages
- No automatic language detection from system locale

## Technical Considerations
- Reuse existing storage service pattern from auth.json and context.json
- Add language parameter to suggestion engine's AI prompt
- Preferences file independent from other storage (no breaking changes)
- Feature toggles filter which strategies run in suggestion engine
- MCP tool must validate language enum values

## Success Metrics
- Users can configure language in under 30 seconds
- First-time users see configuration prompt before first thread
- 100% of suggestions respect language preference
- No errors when preferences file missing (defaults work)

## Open Questions
- Should we add more languages in the future? (Spanish, French, etc.)
- Should feature toggles affect context collection or only suggestion generation?
- Should we add a "reset to defaults" option?

## 1. Contracts and Control Plane

- [x] 1.1 Add conversation-agent scoped settings types and validation schemas for identity, participation, context, scoped instructions, and lightweight run policy.
- [x] 1.2 Extend conversation participant or membership records to carry optional scoped settings with defaults for existing memberships.
- [x] 1.3 Add a Control Plane update path for conversation-agent settings that requires the agent to belong to the selected conversation.
- [x] 1.4 Ensure scoped setting updates do not mutate global agent policy, system prompt, runtime provider, or historical messages/runs.
- [x] 1.5 Add Control Plane tests for per-conversation isolation, membership validation, and historical content preservation.

## 2. View Model and Routing State

- [x] 2.1 Extend inspector selection with a conversation-agent mode keyed by conversation id and agent id.
- [x] 2.2 Add view-model data for agent-in-chat details, including scoped settings, effective display labels, membership status, and read-only global defaults.
- [x] 2.3 Update composer target and mention data to respect conversation-scoped enabled state and display labels.
- [x] 2.4 Expose scoped participation settings to orchestration and run request preparation where currently supported.
- [x] 2.5 Add unavailable-state handling when a selected conversation-agent membership is removed or absent from a snapshot.

## 3. Context Inspector UI

- [x] 3.1 Implement an AgentInChatDetail inspector component using the same layout primitives and CSS language as the existing conversation detail surface.
- [x] 3.2 Render editable scoped identity, responsibility, notes, scoped instructions, participation mode, priority, quiet mode, context scope, history summary, run confirmation, and auto-dispatch controls.
- [x] 3.3 Render global agent defaults as read-only summary rows with a clear action to open the global Agents settings surface.
- [x] 3.4 Preserve conversation timeline and composer state while switching between chat information, agent-in-chat settings, and other inspector detail modes.
- [x] 3.5 Add localized labels for the agent-in-chat inspector in English and Simplified Chinese.

## 4. Workbench Entry Points

- [x] 4.1 Remove the redundant center-header conversation detail `i` action as the primary detail entry point.
- [x] 4.2 Ensure mouse and keyboard activation of the active chat title opens conversation detail in the right Context Inspector.
- [x] 4.3 Change timeline agent avatar/name activation to open the agent-in-chat inspector instead of navigating to the global Agents page.
- [x] 4.4 Make chat information participant tiles open the same agent-in-chat inspector while keeping add/remove membership actions discoverable.
- [x] 4.5 Keep an explicit global agent settings action available from the agent-in-chat inspector for users who need global configuration.

## 5. Composer Simplification

- [x] 5.1 Remove the Low/Medium/High/XHigh effort selector from the normal composer surface.
- [x] 5.2 Preserve effort defaults and run metadata outside the composer so existing agent defaults and run detail behavior remain compatible.
- [x] 5.3 Update composer tests and rendered expectations to verify effort no longer appears in normal chat input chrome.
- [x] 5.4 Re-check full-access confirmation behavior while touching composer controls and fix any broken confirmation loop found during verification.

## 6. Verification

- [x] 6.1 Add UI tests for opening conversation detail from the title and confirming the header `i` entry point is absent.
- [x] 6.2 Add UI tests for opening agent-in-chat settings from timeline author identity and chat participant tiles.
- [x] 6.3 Add UI tests for scoped setting edits, global default read-only rows, and per-conversation isolation.
- [x] 6.4 Add responsive rendered coverage for the agent-in-chat inspector in wide and narrow/mobile-web layouts.
- [x] 6.5 Run relevant package tests and a browser verification pass on `http://localhost:5173/` covering title activation, agent-in-chat detail, participant detail, and composer simplification.

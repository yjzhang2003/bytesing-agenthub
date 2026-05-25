## Why

AgentHub group chats need a way to tune how each participating agent behaves in that specific conversation without changing the agent's global identity, runtime provider, or workspace defaults. The current right-side conversation detail surface already establishes the expected layout language, but agent clicks currently leave the conversation context by opening the global Agents page.

## What Changes

- Add conversation-scoped agent settings for group and single-agent chats.
- Open an "agent in this chat" detail surface in the right Context Inspector when the user clicks an agent avatar or name in the timeline or chat participants area.
- Keep the new agent-in-chat detail visually aligned with the existing conversation detail layout, using the same section structure, row density, controls, and inspector behavior.
- Restore conversation detail entry to the chat title activation path and remove the redundant header `i` action as a primary entry point.
- Remove the routine Claude Code `effort` selector from the normal composer surface; runtime/provider tuning belongs in agent defaults, scoped agent settings, run detail, or advanced configuration rather than the chat input chrome.
- Persist only conversation-scoped overrides on the conversation-agent membership; do not mutate global agent configuration from this surface.

## Capabilities

### New Capabilities
- `conversation-agent-settings`: Conversation-scoped configuration for a participating agent, including identity override, participation behavior, scoped instructions, context boundaries, and read-only global defaults.

### Modified Capabilities
- `conversation-workbench`: Change chat and agent detail entry points so conversation title opens conversation detail, agent avatar/name opens agent-in-chat detail, and the header no longer relies on a separate `i` button.
- `workbench-mvp-ui`: Require the new agent-in-chat inspector to preserve the same right-sidebar layout language as the existing conversation detail surface and remove routine runtime effort controls from the composer.

## Impact

- Control Plane conversation membership model and update APIs for conversation-scoped agent settings.
- Desktop/Web workbench view model, Context Inspector selection model, timeline author click handling, chat information participant tiles, and composer controls.
- UI tests for title activation, agent-in-chat inspector rendering, scoped setting updates, composer simplification, localized labels, and responsive inspector behavior.

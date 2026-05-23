## Why

The workbench currently opens inspector details for operational timeline items, but the active chat itself has no dedicated information surface. AgentHub needs a more IM-like group chat detail panel so users can understand who participates in a chat, add or remove agents, and review chat metadata without leaving the conversation.

## What Changes

- Add a chat information inspector mode that opens when the user clicks the active chat title/header.
- Show participating agents at the top of the inspector with compact avatars, names, and add/remove affordances inspired by IM group detail panels.
- Allow adding available agents into the active chat from the right inspector while preserving the current conversation and composer context.
- Show chat basic information below participants, including chat name, description/announcement-style notes where available, workspace/runtime context, created or updated metadata, and membership summary.
- Preserve existing inspector behavior for plans, permissions, diffs, runtime, artifacts, and run details.
- Keep the design compatible with English and Simplified Chinese product chrome.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `conversation-workbench`: Adds chat title/header selection as a first-class inspector interaction and defines the chat info detail surface.
- `workbench-mvp-ui`: Extends Context Inspector modes to include active chat information and IM-style participant management.
- `agent-collaboration`: Defines group chat membership behavior for adding/removing agents while preserving ordered conversation history.
- `localized-product-experience`: Requires chat info inspector labels and participant management actions to be localized.

## Impact

- Shared UI view model and inspector selection types need a chat-info mode.
- Desktop/Web workbench header or active chat title needs an activation affordance.
- Shared UI inspector components need a chat info detail view with participant avatars, add/remove controls, and metadata rows.
- Control Plane contracts or snapshot mapping may need conversation participant membership data instead of assuming every agent participates in every chat.
- Tests should cover opening chat info from the title, rendering participants, adding/removing agents, preserving timeline/composer state, responsive behavior, and English/Simplified Chinese labels.

## Context

The chat information inspector currently renders participant tiles and opens `AddChatAgentDialog` from `packages/ui/src/components/inspector.tsx`. The dialog is a small single-select control backed by `availableAgents`, and `onAddAgentToChat` accepts one `agentId` per call. The requested experience is closer to a mobile IM contact picker: search at the top, rows with circular check controls, avatars, names, and multi-select before confirmation.

Existing conversation membership contracts already distinguish current participants from eligible workspace agents. This change can stay mostly in Desktop/Web UI by rendering a multi-select picker over `availableAgents` and invoking the existing add action for each selected agent unless a batch API is introduced later.

## Goals / Non-Goals

**Goals:**

- Replace the single-select add-agent dialog with a searchable multi-select list picker.
- Match the provided visual direction while preserving AgentHub's compact workbench tokens, localization, keyboard support, and responsive safety.
- Keep current chat, inspector, and composer state stable while the picker is open and after confirmation.
- Verify selection, search filtering, empty states, localization, and narrow layout behavior.

**Non-Goals:**

- Changing the persisted conversation membership data model.
- Adding a new batch membership API endpoint as part of the spec; the UI may fan out to existing single-agent add calls.
- Redesigning the participant tiles outside the add-agent picker.
- Adding arbitrary contact imports or workspace-wide agent creation from this dialog.

## Decisions

1. Use a custom AgentHub picker surface instead of adapting the existing select control.
   - Rationale: the target layout requires row-level avatars, search, circular selection controls, and multi-select state; a native/select-style component cannot express that without awkward markup or vendor internals.
   - Alternative considered: Ant Design Select in `multiple` mode. It would provide multi-selection quickly but would not match the requested contact-picker visual structure and would make avatar row layout harder to keep accessible.

2. Keep the callback boundary compatible by adding selected agents sequentially.
   - Rationale: `onAddAgentToChat(conversationId, agentId)` is already wired through UI and Web app state to the Control Plane. Calling it once per selected agent avoids contract churn.
   - Alternative considered: introduce `onAddAgentsToChat(conversationId, agentIds)`. That is cleaner for batching but requires broader client/API changes and can be added later if sequential updates prove too slow.

3. Store picker state locally in the dialog.
   - Rationale: search query and selected IDs are transient UI state. Resetting them on open/chat change keeps the picker predictable and avoids leaking selections between conversations.
   - Alternative considered: lift state to the inspector. That would make state easier to inspect externally but adds no current product value.

4. Treat avatars as existing AgentHub identity thumbnails.
   - Rationale: the current `ChatInfoParticipantViewModel` exposes initials, not image URLs. The implementation should use available avatar primitives now and remain compatible with image thumbnails if the view model later includes them.
   - Alternative considered: add avatar image URLs now. That would exceed the requested dialog change and touch backend/demo data contracts unnecessarily.

## Risks / Trade-offs

- Sequential add calls may briefly show intermediate membership state if the app reloads after each call -> batch the UI callback loop before one refresh when wiring permits, or keep refresh behavior after all selected calls in the app layer.
- Multi-select confirmation can partially fail if one selected add fails -> keep the dialog open or surface an error state during implementation if client errors are observable.
- Large agent lists can become tall -> constrain the dialog body with an internal scroll area and keep search/actions fixed.
- Search and row selection can conflict with keyboard expectations -> rows must be button/checkbox-like controls with visible focus and accessible selected state.

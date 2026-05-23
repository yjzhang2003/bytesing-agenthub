## Context

AgentHub already has an IM-style workbench with a left conversation list, center timeline/composer, and right Context Inspector. The inspector is currently driven by operational selections such as runtime, plans, permissions, diffs, artifacts, and runs. The active chat title is visible in the center surface, but clicking it does not expose a chat-level detail view.

The current shared UI view model also treats conversation participants as all workspace agents, which is good enough for a demo list but not enough for chat membership controls. The implementation should introduce an explicit chat information model while remaining compatible with current snapshots until Control Plane stores per-conversation membership.

## Goals / Non-Goals

**Goals:**

- Make the active chat title/header open a right-side chat information inspector.
- Present a compact group-chat-style participant area with agent avatars, names, add action, and remove affordance.
- Show basic chat information below participants, including title, kind, workspace, runtime, timestamps, and membership summary.
- Preserve existing inspector selection behavior for timeline cards and runtime details.
- Keep Desktop/Web behavior localized in English and Simplified Chinese.
- Provide a path from demo-wide "all agents participate" data to explicit conversation-agent membership.

**Non-Goals:**

- Building direct human user membership management.
- Adding file/media sharing, message search implementation, notification toggles, or pinned-chat persistence in this change.
- Changing provider run routing beyond selecting which agents are visible/available in a chat.
- Redesigning the entire workbench layout.

## Decisions

### Use a dedicated `chat-info` inspector mode

Add `chat-info` to the shared `InspectorMode` union and normalize it like other inspector selections. The chat header/title activation will set `{ mode: "chat-info", id: activeConversationId }`.

Rationale: This keeps chat metadata in the existing right inspector rather than introducing a separate drawer or route. It also preserves the current mental model: selecting something in the workbench updates the Context Inspector.

Alternative considered: Reusing the empty inspector state for chat metadata. That would avoid a new mode, but it would make "nothing selected" and "active chat selected" indistinguishable and would limit future chat actions.

### Add a `ChatInfoViewModel`

Extend `WorkbenchViewModel` with a chat info object derived from the active conversation, workspace, runtime, available agents, and membership data. The model should include:

- `id`, `title`, `kind`, `workspaceName`, `runtimeLabel`, `createdAtLabel`, `updatedAtLabel`
- `participants`: active agent participants with id, display name, role, provider label, capability tags, and avatar fallback initials
- `availableAgents`: agents not currently in the chat and eligible for adding
- `membershipSummary`, `announcement`, and `note` fields where data exists, with null placeholders for unavailable metadata

Rationale: A view-model layer keeps inspector rendering simple and gives tests a stable contract. It also allows the first implementation to derive membership from existing agents while Control Plane membership APIs mature.

Alternative considered: Passing raw snapshot data directly to the inspector. That would couple UI components to backend schema details and make fallback behavior harder to test.

### Model membership explicitly in contracts when supported

Control Plane should eventually expose conversation membership in the snapshot instead of forcing clients to infer participants from every workspace agent. The minimal schema can be a `conversationParticipants` array keyed by `conversationId` and `agentId`, with optional `joinedAt`, `addedByUserId`, and `archivedAt` fields. Existing local-demo data can seed all default agents into the demo conversation.

Rationale: Membership belongs to the conversation domain and is needed for add/remove actions to be durable across clients.

Alternative considered: Store membership as an array on each conversation record. That is simpler for reads, but a separate join-like collection is easier to update, audit, and extend with membership metadata.

### Start with chat membership actions as UI callbacks

Add optional workbench props such as `onAddAgentToChat(conversationId, agentId)` and `onRemoveAgentFromChat(conversationId, agentId)`. The web app can wire these to Control Plane endpoints once the service supports them; tests can assert callback behavior immediately.

Rationale: This keeps shared UI implementation independent from transport details while making the interaction testable.

Alternative considered: Mutating local UI state only. That would make the demo look interactive but diverge from the Control Plane-backed workbench direction.

### Keep layout compact and IM-like without copying mobile settings wholesale

The inspector participant area should use AgentHub's compact desktop visual language: a grid or wrapping row of square avatars, text labels, an add tile, and remove controls. Basic information should be rendered as dense rows/sections below, using existing semantic tokens and localized labels.

Rationale: The user-provided reference is a mobile IM group settings panel. AgentHub should preserve the information hierarchy while adapting spacing, density, and controls to the existing desktop/web workbench.

## Risks / Trade-offs

- [Risk] Existing snapshots do not contain explicit chat membership. → Mitigation: derive initial participants from existing conversation/agent data, then introduce `conversationParticipants` with backward-compatible fallback.
- [Risk] Add/remove actions may imply durable persistence before Control Plane endpoints exist. → Mitigation: specify UI callbacks and service endpoints as implementation tasks; disable or no-op actions only when unsupported by `availableActions`.
- [Risk] Right inspector can become visually crowded with many agents. → Mitigation: use wrapping participant tiles, scroll inside the inspector body, and cap tile dimensions.
- [Risk] Chinese labels may be longer than English in compact controls. → Mitigation: add localized strings and rendered coverage for wide and narrow inspector layouts.
- [Risk] Removing an agent with active runs could create confusing routing state. → Mitigation: initial remove action only changes future chat membership and does not rewrite history or cancel active runs.

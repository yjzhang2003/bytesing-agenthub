## Context

The workbench already has an IM-style conversation detail surface in the right Context Inspector. It shows participant tiles, chat metadata, membership management, and conversation controls using compact sections and rows. The same inspector also hosts operational details such as runs, diffs, permissions, and runtime state.

Today, activating an agent author or avatar from the timeline opens the global Agents center view. That breaks the conversation context and only exposes global agent configuration. Group chats need a narrower surface: how this agent participates in this specific conversation. The new surface must not look like a separate settings product; it should feel like a sibling of the existing conversation detail panel.

The composer currently exposes Claude Code effort as a normal chat input control. That setting is runtime/provider tuning rather than a conversation action, and it creates the impression that every message needs low-level execution configuration.

## Goals / Non-Goals

**Goals:**
- Add conversation-scoped agent settings stored on conversation membership, separate from global agent defaults.
- Open those settings in the right Context Inspector from agent avatars/names in the timeline and chat participants area.
- Keep the surface visually consistent with the current conversation detail layout: same inspector body, section headings, row density, avatar treatment, switches, text inputs, and responsive drawer behavior.
- Make the conversation title the primary way to open conversation detail and remove the redundant `i` header action.
- Remove routine effort selection from the composer while preserving run metadata and advanced/default configuration paths.

**Non-Goals:**
- Do not redesign the global Agents page.
- Do not expose full provider, runtime, MCP, plugin, hooks, or tool ACL editing inside the chat inspector.
- Do not change historical messages or completed runs when scoped settings change.
- Do not implement Codex-specific run controls as part of this change.

## Decisions

1. Store scoped settings on the conversation-agent membership.

   Conversation membership already represents whether an agent participates in a chat. The scoped settings belong to that same relation because the values only make sense for the pair of `conversationId` and `agentId`.

   The membership settings should include:
   - `displayNameOverride`
   - `responsibilityOverride`
   - `notes`
   - `enabled`
   - `participationMode`: `manual`, `orchestrated`, or `proactive`
   - `priority`: `low`, `normal`, or `high`
   - `quietMode`
   - `contextScope`: `conversation`, `workspace-summary`, or `conversation-artifacts`
   - `includeHistorySummary`
   - `scopedInstructions`
   - `requireRunConfirmation`
   - `allowAutoDispatch`

   Alternative considered: store settings in agent policy. Rejected because that would make conversation-local choices affect unrelated conversations.

2. Use Context Inspector selection for agent-in-chat details.

   Add a selection mode such as `conversation-agent` carrying `conversationId` and `agentId`. The right inspector can then render the new detail surface without changing center navigation.

   Alternative considered: navigate to the Agents center view and pass conversation context. Rejected because it loses the active chat timeline and conflicts with the user's goal of a right-sidebar detail surface.

3. Match conversation detail layout directly.

   The new component should reuse or mirror `ChatInfoDetail` primitives: `agenthub-inspector-body`, `DetailSection`, participant/avatar header treatment, `agenthub-agent-settings-group`, `agenthub-agent-readonly-row`, `agenthub-settings-row`, `AgentHubSwitch`, `AgentHubTextInput`, and compact action rows. Any new classes should extend that structure instead of introducing a visually separate card layout.

   Alternative considered: build an Agents-page-like editor in the inspector. Rejected because it would mix center-page configuration language into the chat detail surface.

4. Split read/write scope in the inspector.

   Editable rows are limited to conversation-scoped settings. Global defaults are shown in a read-only summary with an explicit action to open global agent settings in the Agents page. Runtime/provider settings remain global or advanced.

   Alternative considered: allow runtime/provider overrides per conversation. Rejected for MVP because those controls are high-risk and make the scoped surface harder to understand.

5. Simplify composer runtime controls.

   Remove the effort selector from the normal composer. Permission mode can remain only if the current product decision keeps per-run permission gating in the composer, but effort should move to agent defaults or advanced settings because it is not a natural chat action.

## Risks / Trade-offs

- [Risk] Users may expect global agent edits from the new panel. -> Mitigation: title the surface "Agent in this chat", show global defaults as read-only, and label the global settings action clearly.
- [Risk] Scoped instructions could be confused with private notes. -> Mitigation: separate "Notes" from "Scoped instructions" and state in UI copy that only scoped instructions affect agent behavior.
- [Risk] Orchestrator behavior may not immediately honor every scoped setting. -> Mitigation: persist all settings first, then wire orchestration and run creation to honor enabled state, auto-dispatch, priority, context scope, and confirmation in focused steps.
- [Risk] Removing effort from the composer may hide an existing capability. -> Mitigation: preserve effort in stored agent defaults and run detail metadata; only remove it from the routine chat input.
- [Risk] Adding editable inspector state can conflict with live snapshot updates. -> Mitigation: keep local drafts per field, commit on blur/save, and reset drafts only when the selected conversation-agent changes or server values update without local edits.

## Migration Plan

1. Extend conversation membership contracts with optional scoped settings and default them for existing memberships.
2. Add Control Plane update methods for conversation-agent settings without changing global agent policy.
3. Add view-model fields for participant-scoped settings, effective labels, and read-only global summaries.
4. Add Context Inspector selection and detail rendering for conversation-agent settings.
5. Change title and agent activation routes: title opens chat info, agent author/avatar/participant opens agent-in-chat detail, header `i` action is removed.
6. Remove composer effort from normal UI and update tests.
7. Roll back by ignoring the optional membership settings and keeping global agent behavior unchanged.

## Open Questions

- Whether scoped changes should auto-save on field blur or require a single Save action. The recommended default is one Save action for text fields and immediate switch/select updates only where existing conversation detail already behaves that way.
- Whether `proactive` participation should be enabled in the first implementation or stored but hidden until orchestration can honor it fully.

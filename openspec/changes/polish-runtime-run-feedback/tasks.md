## 1. Run Feedback Model

- [x] 1.1 Add view-model fields for user-facing run summary labels that omit raw run ids, session ids, override source identifiers, and low-level audit fields from timeline content.
- [x] 1.2 Add or normalize a Claude Code authentication/setup failure category for run/provider failures that include unauthenticated CLI messages.
- [x] 1.3 Preserve original provider failure text for Run detail diagnostics without rendering it as primary conversation content.
- [x] 1.4 Ensure Run detail exposes effective Claude Code permission preset, effort, settings source, profile labels, MCP profile, timing, and high-risk status.

## 2. Header Detail Surface

- [x] 2.1 Replace the primary right-sidebar collapse affordance in the conversation header with explicit Conversation Info and Run Detail header actions.
- [x] 2.2 Route Conversation Info and Run Detail header actions through the same inspector/detail selection state used by timeline item selection.
- [x] 2.3 Implement active, selected, or most recent run resolution for the Run Detail header action, including disabled or empty state behavior when no run exists.
- [x] 2.4 Add click-outside dismissal for overlay or drawer detail presentations while keeping interactions inside detail content open.

## 3. Timeline and Detail UI

- [x] 3.1 Update run timeline cards to show concise queued/running/failed/completed summaries with agent identity and high-level settings only.
- [x] 3.2 Ensure selecting a run timeline card opens the Run detail surface.
- [x] 3.3 Update Conversation detail so it is opened by the chat title or Conversation Info header action and closed by outside-click behavior in overlay/drawer mode.
- [x] 3.4 Update Connections or provider diagnostics display to show Claude Code login/setup guidance when the normalized auth failure category is present.
- [x] 3.5 Keep technical/audit run metadata available in a secondary diagnostics or advanced section in Run detail.

## 4. Verification

- [x] 4.1 Add UI tests proving run timeline cards do not contain raw UUIDs, session ids, or `run-override` text.
- [x] 4.2 Add UI tests for Conversation Info and Run Detail header actions, including the no-run empty or disabled state.
- [x] 4.3 Add UI behavior tests for click-outside detail dismissal and inside-panel interaction preservation.
- [x] 4.4 Add runtime or view-model tests for Claude Code unauthenticated failure classification.
- [x] 4.5 Run the relevant package tests and OpenSpec validation for `polish-runtime-run-feedback`.

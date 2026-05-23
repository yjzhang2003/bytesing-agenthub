## 1. Dependency And Theme Foundation

- [x] 1.1 Add Ant Design dependencies to the workspace package that owns shared UI and verify Web/Electron builds resolve styles correctly.
- [x] 1.2 Add a root AgentHub Ant Design provider around Desktop/Web UI rendering without changing Control Plane snapshot loading.
- [x] 1.3 Implement an AgentHub theme bridge that maps existing dark/light semantic tokens to Ant Design theme tokens and component tokens.
- [x] 1.4 Add tests for theme provider rendering, dark/light switching, and compact token values used by wrapped controls.

## 2. AgentHub Wrapper Primitives

- [x] 2.1 Create AgentHub wrapper components for button, icon button, input, text area, select, checkbox, switch, form item, tooltip, dropdown, modal, tabs, badge, avatar, empty state, skeleton/spinner, and notification/message feedback.
- [x] 2.2 Update wrapper styles so Ant Design-backed controls match AgentHub density, border, focus, hover, disabled, and dark/light visual states.
- [x] 2.3 Replace direct uses of current low-level handcrafted controls where the wrapper behavior is equivalent.
- [x] 2.4 Add component tests for wrapper accessibility labels, disabled states, validation states, and stable behavior without asserting Ant Design internal DOM.

## 3. Agents Page Migration

- [x] 3.1 Migrate the Agents side list rows to shared avatar, badge/list-row, button, empty, and loading wrappers while preserving the chat-sidebar width and resizable behavior.
- [x] 3.2 Migrate the Agent editor form to Ant Design-backed form, input, text area, select, and action controls.
- [x] 3.3 Preserve create, update, archive, default-agent archive disabling, policy JSON validation, and snapshot reload behavior.
- [x] 3.4 Update UI tests for listing default/custom agents, editing fields, validation errors, create/update/archive callbacks, and selected-agent navigation from timeline.

## 4. Connections And Settings Migration

- [x] 4.1 Migrate Connections provider rows and detail sections to shared avatar/badge/list-row/button/empty/loading wrappers.
- [x] 4.2 Preserve Claude Code provider status, Codex placeholder, runtime diagnostics, memory diagnostics, failure reasons, checked time, and refresh behavior.
- [x] 4.3 Migrate Settings common controls to shared Ant Design-backed wrappers while keeping only general workspace/appearance/permission settings there.
- [x] 4.4 Update UI tests for connected/missing/misconfigured provider states, memory disabled/unavailable states, Codex placeholder state, and settings controls.

## 5. Composer, Timeline, And Ant Design X Spike

- [x] 5.1 Migrate composer input, send button, target selection, tooltip/dropdown behavior, disabled state, and validation messaging to shared wrappers.
- [x] 5.2 Preserve run creation payload shape, selected agent targeting, runtime-disabled behavior, and mention/direct-mode labels.
- [x] 5.3 Spike Ant Design X Bubble, Sender, Conversations, and chat avatar primitives against AgentHub timeline requirements.
- [x] 5.4 Document the Ant Design X decision in the change implementation notes and either adopt compatible pieces or keep the custom timeline.
- [x] 5.5 If timeline pieces migrate, preserve mixed message/run-event/card ordering, agent avatar/name navigation, inspector selection, compact density, and dark/light behavior.

## 6. Verification And Rollout

- [x] 6.1 Run `pnpm check` and update snapshots/assertions affected by wrapper markup without coupling tests to vendor internals.
- [x] 6.2 Run existing local smoke verification for Control Plane, Desktop Runtime, fake Claude Code, and memory flows where applicable.
- [x] 6.3 Browser-verify dark and light themes across conversation, Agents, Connections, Settings, empty/offline states, modal/dropdown/tooltip overlays, and narrow desktop layouts.
- [x] 6.4 Measure dependency/build impact and note any bundle or CSS payload concerns before completing the change.

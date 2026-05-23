## 1. Contracts and Control Plane Membership

- [x] 1.1 Extend shared contracts with explicit conversation-agent membership data in the workbench snapshot, preserving backward-compatible parsing for legacy snapshots.
- [x] 1.2 Add Control Plane in-memory/local-demo membership storage seeded with default conversation participants.
- [x] 1.3 Add Control Plane endpoints or event-backed actions for adding and removing an agent from a conversation.
- [x] 1.4 Update Web client API helpers to call chat membership add/remove actions and refresh or apply resulting snapshot state.

## 2. Shared View Model and Inspector State

- [x] 2.1 Add `chat-info` to inspector selection types, selection normalization, and workbench state transitions.
- [x] 2.2 Introduce a `ChatInfoViewModel` with participants, available agents, chat metadata, workspace/runtime labels, and membership summary.
- [x] 2.3 Derive chat participants from explicit membership when present and fall back to current compatible agent participant behavior when absent.
- [x] 2.4 Ensure selecting timeline items, runtime details, and management pages continues to preserve active conversation and composer state.

## 3. Desktop/Web UI

- [x] 3.1 Make the active chat title/header an accessible button that opens the `chat-info` inspector via mouse and keyboard.
- [x] 3.2 Build the chat information inspector surface with IM-style agent avatar tiles, Add agent tile, Remove affordance, and compact basic information rows.
- [x] 3.3 Wire add/remove participant controls to optional workbench callbacks with disabled/empty states when no eligible agents exist.
- [x] 3.4 Adapt the chat information surface for wide right-inspector layout and narrow/mobile-web inspector drawer behavior.

## 4. Localization and Visual Polish

- [x] 4.1 Add English and Simplified Chinese translation keys for chat information labels, add/remove actions, empty states, and accessibility names.
- [x] 4.2 Preserve source content for chat titles, agent display names, technical workspace/runtime values, and historical messages.
- [x] 4.3 Style participant tiles and metadata rows using existing AgentHub semantic tokens, density, focus states, and responsive constraints.
- [x] 4.4 Verify the layout remains readable for longer Chinese labels and multiple participating agents.

## 5. Verification

- [x] 5.1 Add shared UI tests for opening chat information from the title, rendering participants and metadata, and preserving timeline/composer state.
- [x] 5.2 Add tests for add/remove agent callbacks, no-available-agent state, and legacy snapshot membership fallback.
- [x] 5.3 Add Control Plane contract/service tests for membership persistence and snapshot synchronization.
- [x] 5.4 Add English and Simplified Chinese rendered coverage for the chat information inspector in wide and narrow layouts.
- [x] 5.5 Run `pnpm --filter @agenthub/ui typecheck`, targeted UI/control-plane tests, `pnpm check`, and OpenSpec validation.

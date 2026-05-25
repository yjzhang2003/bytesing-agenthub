## 1. Contracts And Models

- [x] 1.1 Add contract types for conversation-agent Claude session bindings, including conversation id, agent id, provider mode, optional provider session id, configuration snapshot, timestamps, and last run id.
- [x] 1.2 Extend runtime provider event contracts with optional Claude Code session metadata associated with an AgentHub run id.
- [x] 1.3 Update Zod schemas and validation tests for the new binding and provider session metadata shapes.

## 2. Control Plane Session Binding

- [x] 2.1 Add Control Plane storage and helpers for looking up, creating, and updating hidden conversation-agent Claude session bindings.
- [x] 2.2 Create empty bindings when a single-agent conversation is created for a Claude Code-backed agent.
- [x] 2.3 Create empty bindings when a Claude Code-backed agent is added to an existing conversation.
- [x] 2.4 Lazily create missing bindings for historical conversations when a valid Claude Code-backed participant starts a run.
- [x] 2.5 Capture the effective session-defining Claude Code configuration snapshot when a binding is created.

## 3. Run Creation And Resume Routing

- [x] 3.1 Resolve the target conversation-agent binding during local run creation for Claude Code-backed agents.
- [x] 3.2 Queue first runs without a resume session id when the binding has not yet captured a provider session id.
- [x] 3.3 Queue subsequent runs with `session: { behavior: "continue", sessionId }` so Desktop Runtime invokes `--resume <claudeSessionId>`.
- [x] 3.4 Ensure different agents in the same conversation and the same agent in different conversations use separate bindings.
- [x] 3.5 Prevent ordinary per-run overrides from silently changing session-defining configuration after a provider session id exists.

## 4. Desktop Runtime Session Capture

- [x] 4.1 Extend the Claude Code stream parser to detect provider session ids from supported stream-json records.
- [x] 4.2 Publish normalized provider session metadata events for the matching AgentHub run id.
- [x] 4.3 Keep normal run status and message streaming working when no provider session id is observed.
- [x] 4.4 Add Desktop Runtime tests for first-run capture, missing session metadata, and resumed command arguments.

## 5. Control Plane Provider Event Handling

- [x] 5.1 Handle normalized provider session metadata events from Desktop Runtime.
- [x] 5.2 Update only the hidden binding matching the reporting run's owner, workspace, conversation, and agent.
- [x] 5.3 Ignore session metadata for unknown or unauthorized runs.
- [x] 5.4 Add Control Plane tests for captured session persistence and subsequent run resume injection.

## 6. Workbench UI

- [x] 6.1 Remove routine `sessionBehavior` and raw `sessionId` controls from the normal Claude Code composer surface.
- [x] 6.2 Keep Claude Code session ids out of timeline cards, message bubbles, and normal run detail rows.
- [x] 6.3 Preserve user-relevant Claude Code settings such as permission and effort without exposing provider session mechanics.
- [x] 6.4 Add UI tests proving ordinary composer sends do not require session mode selection and rendered workbench output does not contain raw session ids.

## 7. Verification

- [x] 7.1 Run contract, Control Plane, Desktop Runtime, and UI test suites touched by the change.
- [x] 7.2 Run `pnpm typecheck`.
- [x] 7.3 Validate the OpenSpec change with `openspec validate bind-agent-claude-sessions`.
- [x] 7.4 Manually verify a local first run creates a binding and a follow-up run for the same agent uses `--resume` without displaying the session id.

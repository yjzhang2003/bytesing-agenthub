## 1. Contracts and schemas

- [x] 1.1 Add collaboration runtime domain types for agent roster entries, mention messages, tasks, task claims, heartbeats, user questions, collaboration events, and OpenSpec links.
- [x] 1.2 Add Zod validation schemas and exported validation helpers for all collaboration runtime records.
- [x] 1.3 Extend workbench snapshot/client state contracts with a summarized collaboration status model for the active conversation.
- [x] 1.4 Add contract tests covering valid records, invalid task transitions, blocking user questions, and OpenSpec link summaries.

## 2. Project collaboration runtime

- [x] 2.1 Add a focused collaboration runtime module that resolves the project/conversation state root without exposing raw state paths to the UI contract.
- [x] 2.2 Implement state initialization for `agents.json`, `events.jsonl`, `tasks`, `inbox`, `outbox`, `questions`, and `openspec-links.json`.
- [x] 2.3 Implement append-only collaboration event recording with schema validation.
- [x] 2.4 Implement roster synchronization from conversation participants while preserving historical records for removed agents.
- [x] 2.5 Implement task create, claim, complete, fail, and blocked transitions with version, claim token, lease, and terminal-state checks.
- [x] 2.6 Implement heartbeat and blocked-state summarization for active, idle, stale, blocked, completed, and failed agent work states.
- [x] 2.7 Add unit tests for state initialization, roster sync, event append, task claim conflicts, terminal transitions, heartbeat freshness, and blocked question summaries.

## 3. Mention routing and user questions

- [x] 3.1 Add mention parsing/resolution that maps `@agent` to active conversation participants and `@user` to the conversation owner.
- [x] 3.2 Add mention intent handling for discussion, task handoff, review, status nudge, and blocking user question creation.
- [x] 3.3 Route unaddressed group messages to Orchestrator as coordinator without automatic worker dispatch.
- [x] 3.4 Enforce Plan Mode or allowed auto-dispatch policy before Orchestrator-created worker tasks are dispatched from an unaddressed message.
- [x] 3.5 Add tests for worker mentions, Orchestrator mentions, unaddressed group messages, invalid mentions, task handoff, and `@user` blocking questions.

## 4. OpenSpec projection

- [x] 4.1 Add OpenSpec link records that associate collaboration tasks and decisions with `openspec/changes/<change>/` artifacts.
- [x] 4.2 Implement idempotent projection for approved collaboration tasks into OpenSpec task entries or task-link metadata.
- [x] 4.3 Implement projection for accepted design/scope decisions into the appropriate OpenSpec proposal, design, or spec artifact.
- [x] 4.4 Keep transient messages, heartbeats, and draft discussion outside OpenSpec by default.
- [x] 4.5 Add tests proving projected records are stable, repeated projection is idempotent, and transient records are not written to OpenSpec artifacts.

## 5. Control Plane integration

- [x] 5.1 Wire collaboration status into Control Plane workbench snapshots for the active project-bound conversation.
- [x] 5.2 Add Control Plane methods or endpoints for recording mention messages, answering user questions, and refreshing collaboration status.
- [x] 5.3 Publish collaboration-related events for task status changes, user question creation/answering, and OpenSpec projection updates.
- [x] 5.4 Preserve existing direct agent run behavior for conversations that have no collaboration state initialized.
- [x] 5.5 Add integration tests covering collaboration snapshot loading, mention routing, blocking question answer flow, and unchanged legacy run behavior.

## 6. Workbench right-sidebar UI

- [x] 6.1 Add view-model mapping from collaboration status summaries to compact agent status rows.
- [x] 6.2 Add a Context Inspector mode for collaboration agent status with localized English and Simplified Chinese labels.
- [x] 6.3 Show each participating agent's identity, availability, current task, blocked-question marker, and linked OpenSpec change summary in the right sidebar.
- [x] 6.4 Add an affordance to open or answer blocking user questions from the sidebar without replacing the conversation timeline.
- [x] 6.5 Keep existing chat information, plan, permission, diff, runtime, artifact, and run inspector modes behaviorally unchanged.
- [x] 6.6 Add component tests for agent status rows, blocked question display, OpenSpec link display, unavailable collaboration state, and localization.

## 7. Verification and documentation

- [x] 7.1 Add end-to-end or integration coverage for a group conversation where Orchestrator routes an unaddressed message, assigns an agent task, blocks on `@user`, receives an answer, and updates status.
- [x] 7.2 Add rendered verification for the right-sidebar collaboration status in active, idle, blocked, stale, completed, and unavailable states.
- [x] 7.3 Document the collaboration state root, record ownership rules, OpenSpec projection rules, and UI scope in developer documentation.
- [x] 7.4 Run the relevant package tests, contract tests, and UI tests and record verification results before applying the change.

## Context

AgentHub currently has the pieces for a local run loop: the Web client can call Control Plane `/runs`, Control Plane can enqueue runtime commands, Desktop Runtime can poll commands and invoke provider adapters, the Claude Code adapter can spawn a local process, and provider events can be posted back to Control Plane. The gap is that these pieces need to be tightened into one verified path with reliable status transitions and workbench-visible output.

The change should build on the existing local-demo authentication mode, smoke provider mode, and shared contract package. Hosted Supabase, cloud runtime execution, team workspaces, and durable persistence remain outside the MVP loop.

## Goals / Non-Goals

**Goals:**

- Make a user-started direct agent run travel from Desktop/Web to Control Plane, then to Desktop Runtime, then through the configured provider adapter.
- Preserve the provider boundary so smoke mode and Claude Code mode use the same runtime command and event contract.
- Normalize provider status and message output into Control Plane run state, SSE events, snapshot state, and workbench timeline items.
- Support cancellation by sending `run.cancel` to Desktop Runtime and reflecting cancelled or failed terminal state.
- Add verification for the deterministic smoke loop and the Claude Code adapter boundary.
- Document how local developers enable real Claude Code mode.

**Non-Goals:**

- Implement hosted Supabase persistence or multi-user synchronization.
- Add cloud runtime execution, deployment, PR, preview hosting, or team workspace flows.
- Complete Plan Mode orchestration across multiple workers.
- Add a full permission policy engine for Claude Code actions beyond the already specified permission gateway.
- Store full terminal transcripts or source diffs durably in cloud storage.

## Decisions

1. Control Plane remains the run coordinator.

   Desktop/Web will create runs through Control Plane rather than calling Desktop Runtime directly. Control Plane owns run ids, initial queued state, runtime-device routing, and user/workspace ownership checks. The alternative was a Web-to-Runtime direct channel, but that would bypass account scoping and make Web/iOS parity harder.

2. Runtime commands stay pull-based for MVP.

   Desktop Runtime will poll `/runtime/commands` or use the existing command stream wrapper when available, then acknowledge progress by publishing provider events. Pulling is simple to verify locally and survives Control Plane restarts better than keeping command delivery dependent on one long-lived socket. SSE can still be used for client UI updates.

3. Provider adapters emit provider-neutral runtime events.

   Smoke and Claude Code adapters will both emit `run.status` and `message.delta` events. Control Plane translates those into AgentHub run status events and timeline messages. This keeps Claude Code process details out of Web/UI packages and keeps future Codex/OpenCode adapters compatible with the same contract.

4. Workbench state is rebuilt from Control Plane snapshot plus live SSE.

   The Web client will continue loading a snapshot for initial state, then apply run status and message delta events from `/events`. If the SSE stream disconnects, refreshing the snapshot must recover the latest known runs and messages.

5. Claude Code mode is explicit configuration.

   Local smoke mode remains the default verification path. Real Claude Code execution requires `AGENTHUB_PROVIDER_MODE=claude-code` and `AGENTHUB_CLAUDE_CODE_BIN` so failed local setup is visible and recoverable.

## Risks / Trade-offs

- Provider processes can hang or emit noisy output -> Runtime should preserve cancellation and terminal failure states, and tests should cover failed adapter exits.
- Pull-based command delivery can add latency -> Use a short local polling interval for MVP and keep the command contract compatible with future streaming.
- Message deltas may create too many timeline records -> Start with correctness and readable output, then batch/coalesce deltas if rendered performance becomes a problem.
- Claude Code CLI behavior can vary by installed version -> Verify the adapter boundary with a fake binary or controlled process in tests, and document real CLI setup separately.
- In-memory Control Plane state is not durable -> Accept this for local MVP and keep the event/snapshot contract suitable for later persistence.

## Migration Plan

This is a local MVP change with no data migration. Implementation can land behind existing local configuration:

1. Keep smoke provider mode as default.
2. Tighten contracts and tests for run commands and provider events.
3. Implement the closed loop in Control Plane, Runtime, and Web/UI.
4. Add local smoke verification.
5. Document Claude Code mode setup and failure recovery.

Rollback is to run with smoke mode disabled or avoid starting runs from the workbench; no persisted data needs migration.

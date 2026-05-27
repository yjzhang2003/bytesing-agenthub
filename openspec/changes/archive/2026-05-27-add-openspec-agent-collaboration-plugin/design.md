## Context

AgentHub already has group conversations, explicit conversation membership, direct agent runs, Claude Code session bindings, and project-bound run preparation. What is missing is a durable coordination layer that lets agents working in the same project directory discover each other, exchange directed messages, claim work, ask the user for decisions, and keep OpenSpec artifacts aligned with stable collaboration outcomes.

The closest external reference is the OMC team runtime: it uses project-local state, append-only events, worker task files, inbox/outbox channels, heartbeats, and optional git worktrees. AgentHub should reuse the durable-control-plane idea, but not the tmux-first execution model or the assumption that every collaboration is a leader-to-worker pipeline. AgentHub's collaboration layer must support IM-style group conversations, explicit `@agent` and `@user` mentions, and OpenSpec projection.

## Goals / Non-Goals

**Goals:**
- Add a project-scoped collaboration state root that is safe to read from Desktop Runtime and surface through Control Plane snapshots.
- Let agents in one conversation/project know which other agents participate, what they are doing, whether they are blocked, and how to message them.
- Define `@agent` semantics for discussion, task handoff, review, and status nudges.
- Define `@user` semantics for blocking questions, approvals, and clarification requests.
- Project durable decisions, task assignments, and verification outcomes into OpenSpec change artifacts when they are stable.
- Add a compact right-sidebar status surface for participating agent work state without redesigning the workbench.

**Non-Goals:**
- Replace OpenSpec with a chat log or store every agent utterance in OpenSpec.
- Build a general tmux worker manager in AgentHub.
- Add a new full-screen team dashboard.
- Automatically dispatch worker agents from unaddressed group messages without Orchestrator/user approval.
- Solve cross-machine concurrent editing beyond the current local Desktop Runtime boundary.

## Decisions

### Project collaboration state lives under an AgentHub-managed root

The Desktop Runtime should own a project-scoped state root such as `.agenthub/collaboration/<conversation-id>/`. The initial state model should include `agents.json`, `events.jsonl`, `tasks/*.json`, `inbox/<agent-id>.jsonl`, `outbox/<agent-id>.jsonl`, `questions/*.json`, and `openspec-links.json`.

Alternative considered: write directly into `openspec/changes/<change>/` for all collaboration messages. That would make state easy to inspect, but it would pollute OpenSpec with transient discussion and make specs/tasks noisy. OpenSpec should remain the durable requirements and decision record, with explicit projection from collaboration state.

### OpenSpec projection is deliberate and typed

The collaboration runtime should only project stable artifacts into OpenSpec: task creation/completion, approved design decisions, requirement deltas, verification evidence, and user-approved scope changes. Raw chat, temporary status, heartbeats, and failed attempts stay in AgentHub collaboration state.

Alternative considered: let agents edit OpenSpec files directly. That is simpler, but creates race conditions and makes it hard to distinguish draft discussion from accepted project contract.

### Mentions are routed through Control Plane semantics

`@agent` should resolve to a participating conversation agent and create either a discussion message or a task handoff depending on the mention mode. `@user` should create a blocking user question or approval request that is visible in the right sidebar and prevents dependent task completion until answered. Unaddressed group messages should route to Orchestrator as coordinator by default, but Orchestrator must not auto-dispatch workers unless the message explicitly requests coordination or policy allows dispatch.

Alternative considered: default unaddressed group messages to the last active worker. That is less predictable and makes group behavior depend on incidental timeline history.

### The right sidebar is the primary UI impact

The Context Inspector should gain an agent work status mode that shows participating agents, current task, run status, heartbeat/staleness, blocked question count, and linked OpenSpec change state. Existing chat information, plan, permission, diff, runtime, and run details remain intact.

Alternative considered: add a separate team dashboard. That would be useful later, but the current need is awareness and blocking status while staying in the conversation.

### Use file-safe state primitives first, database persistence second

The initial implementation should use contract-validated JSON/JSONL records, atomic writes, append-only events, and lock/lease metadata for task claims. Control Plane can expose this through snapshots and events. Long-term persistence can mirror selected state into Supabase later if needed.

Alternative considered: model all collaboration state only in Control Plane memory. That would be faster to build but would not meet the goal of same-project agents sharing durable state across sessions.

## Risks / Trade-offs

- [Risk] Collaboration state can drift from OpenSpec artifacts. -> Mitigation: keep OpenSpec projection typed and idempotent, store link records, and surface projection errors in the right sidebar.
- [Risk] Multiple agents may update the same task concurrently. -> Mitigation: use claim tokens, lease expiry, version numbers, and atomic writes before allowing terminal status transitions.
- [Risk] `@user` requests can become invisible blockers. -> Mitigation: store them as first-class blocking question records and show them in the right sidebar and pending-action surfaces.
- [Risk] The state root may expose sensitive prompts or paths. -> Mitigation: Desktop Runtime owns writes, schemas restrict fields, and UI avoids exposing raw internal files by default.
- [Risk] The UI sidebar can become too dense. -> Mitigation: show only agent identity, status, current task, blocked marker, and OpenSpec link summary; keep details behind existing inspector selection.

## Migration Plan

1. Add contract types and validation schemas for collaboration records without wiring them into runtime behavior.
2. Add a collaboration service that can initialize state for a conversation/project and expose a read-only status summary.
3. Add mention routing and task/question state transitions behind Control Plane APIs/events.
4. Add OpenSpec projection helpers for task and decision records.
5. Add the right-sidebar agent status mode and snapshot wiring.
6. Keep existing direct agent run behavior unchanged; route new collaboration behavior only when state is initialized for the active conversation.

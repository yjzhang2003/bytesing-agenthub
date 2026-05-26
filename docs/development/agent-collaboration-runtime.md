# Agent Collaboration Runtime

Agent collaboration state is scoped to one project-bound conversation. The runtime stores local coordination records under:

```text
<project-root>/.agenthub/collaboration/<conversation-id>/
```

The Control Plane owns the public snapshot contract. UI clients receive only the summarized `collaborationStatus` model for the active conversation; raw state paths are not exposed to clients.

## State Records

The conversation state root contains:

- `agents.json`: current and historical conversation agent roster entries.
- `events.jsonl`: append-only collaboration events.
- `tasks/*.json`: assignable collaboration tasks with versioned claim tokens and leases.
- `questions/*.json`: user questions created when an agent is blocked on user input.
- `heartbeats/*.json`: agent liveness and current work status.
- `openspec-links.json`: links between collaboration tasks or decisions and OpenSpec artifacts.
- `inbox/` and `outbox/`: reserved per-conversation queues for future provider-specific message handoff.

Every persisted record includes the owning user, workspace, project, and conversation where applicable. Removed agents remain in roster history with `removedAt` set so old events and tasks stay attributable.

## Task And Question Rules

Only the assigned agent can claim a task. Claims are version checked and lease bounded. Terminal tasks cannot be reclaimed, and only `in-progress` tasks may be completed or failed with an active claim token.

Blocking questions are stored separately from chat messages. A blocked task points at the pending question, and the summarized status reports both the blocked agent marker and the pending question prompt. When the user answers, the question is marked `answered`; dependent tasks can then be reclaimed and completed.

## OpenSpec Projection

Approved collaboration tasks and accepted design or scope decisions can be projected into `openspec/changes/<change>/` artifacts. Projection is idempotent and uses stable collaboration markers so repeated projection does not duplicate task or decision entries.

Transient discussion, draft messages, heartbeats, and ordinary status chatter stay in collaboration state by default and are not written into OpenSpec artifacts.

## Workbench UI Scope

The Desktop/Web workbench shows collaboration status in the right Context Inspector. The sidebar displays agent identity, availability, current task, blocked-question markers, pending user questions, and linked OpenSpec change summaries. Existing chat info, plan, permission, diff, runtime, artifact, and run inspector modes remain separate modes and keep their existing behavior.

## Why

AgentHub already supports group conversations and agent-specific runs, but agents in the same project directory do not yet share a durable collaboration protocol for discovering each other, mentioning each other, asking the user for decisions, or projecting important outcomes into OpenSpec. Introducing an OpenSpec-backed collaboration plugin creates a repeatable coordination model while keeping OpenSpec focused on durable decisions, tasks, and requirements rather than raw chat noise.

## What Changes

- Add a project-directory collaboration runtime that stores agent roster, mention events, task claims, heartbeats, and inbox/outbox messages under a project-scoped AgentHub state root.
- Add an OpenSpec projection layer that links collaboration tasks, decisions, and verification outcomes to `openspec/changes/<change>/` artifacts.
- Define `@agent` and `@user` semantics for discussion, task handoff, review, and blocking user questions inside a group conversation.
- Route unaddressed group messages to Orchestrator as the default coordinator without automatically dispatching worker agents.
- Add a compact right sidebar status panel showing participating agents, current task state, blocked user questions, and OpenSpec change progress.
- Keep the UI impact narrow: no new full-screen collaboration workspace, no large chat redesign, and no requirement to expose raw internal state files.

## Capabilities

### New Capabilities
- `project-agent-collaboration-runtime`: Defines project-scoped collaboration state, agent discovery, mention routing, task ownership, heartbeats, user questions, event logging, and OpenSpec projection behavior.

### Modified Capabilities
- `agent-collaboration`: Clarify unaddressed group-message routing and add mention-based agent/user collaboration semantics.
- `conversation-workbench`: Add the conversation-facing behavior for mention routing, blocking user questions, and collaboration state updates.
- `workbench-mvp-ui`: Add the narrow right-sidebar agent status panel and keep the rest of the workbench layout stable.

## Impact

- Contracts: new collaboration runtime types, events, and validation schemas for roster entries, mention messages, task records, heartbeats, user questions, and OpenSpec links.
- Control Plane: APIs or internal services for recording collaboration events, reading project-scoped status, and routing mention actions.
- Desktop Runtime: project-directory state root management, safe file writes, optional plugin/MCP tool surface, and OpenSpec projection helpers.
- Web/Desktop UI: Context Inspector/right sidebar updates for per-agent status, task ownership, blocked questions, and linked OpenSpec change state.
- Tests: contract validation, collaboration runtime state transitions, mention routing, OpenSpec projection, and right-sidebar rendering.

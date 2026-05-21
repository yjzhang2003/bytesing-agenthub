# AgentHub Information Architecture

## Navigation Principle

AgentHub is workspace-first. A workspace is the user's execution context: it determines the local path, owning Desktop Runtime, available agents, conversations, runs, and diffs. Every client should make the active workspace visible before presenting execution controls.

## Primary MVP Surfaces

### Workspaces

Purpose: select and inspect the current local project context.

Required content:

- Workspace display name.
- Owning Desktop Runtime device.
- Runtime state: online, offline, degraded, active-running.
- Optional repository metadata: branch, base commit, dirty state when available.
- Recent conversations and recent runs.

### Conversations

Purpose: IM-style collaboration surface for users, Orchestrator, and worker agents.

Required content:

- Conversation title.
- Participant agents.
- Active plan or run status.
- Timeline preview.
- Pending permission count when relevant.

### Agents

Purpose: manage agent identities in the active workspace.

Required content:

- Agent name, role, avatar or initials.
- Provider label such as Claude Code.
- Capability tags.
- Default policy summary.
- Whether the agent can be addressed directly or is Orchestrator-only.

### Runs

Purpose: inspect execution history and current work.

Required content:

- Run status.
- Triggering conversation.
- Assigned agent.
- Workspace.
- Started and completed timestamps.
- Related plan, permissions, artifacts, and diff summary.

### Settings

Purpose: configure workspace, runtime, account, providers, UI, and future integrations.

MVP settings include:

- Account session.
- Runtime device status.
- Workspace metadata.
- Agent/provider configuration.
- Diff caching preference.
- UI theme preference placeholder.

## Runtime Status Placement

Runtime status must appear in:

- Left navigation near active workspace.
- Conversation header when the conversation can trigger local execution.
- Context Inspector when viewing runtime-dependent plan, permission, diff, or artifact details.
- iOS workspace home and conversation header.

Runtime states:

- `online`: runtime can receive commands.
- `offline`: runtime cannot execute or provide full diffs.
- `degraded`: runtime is connected but missing a capability or has stale heartbeat.
- `active-running`: runtime is online and has one or more active runs.

Execution buttons must be disabled or explained when runtime is offline. Viewing history remains available.

## MVP Exclusions

Do not include primary navigation for:

- Team spaces or org roles.
- GitHub PR workflows.
- Cloud runtime execution.
- Deployment publishing.
- Web preview hosting.
- Public sharing.

If future placeholders appear in settings, they must be clearly labeled as future capabilities and must not block MVP workflows.

## Cross-client Routing Model

Desktop/Web:

- Workspace switcher in left navigation.
- Workspace-scoped conversations, agents, runs, and settings.
- Context Inspector preserves current conversation context.

iOS:

- Workspace list or active workspace home is the first meaningful screen after sign-in.
- Tab or top-level navigation exposes Conversations, Runs, Agents, and Settings inside the active workspace.
- Details push onto the navigation stack or appear as sheets while preserving a clear return path.

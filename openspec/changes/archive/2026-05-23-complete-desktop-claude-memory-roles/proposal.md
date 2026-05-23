## Why

AgentHub can already route local runs through Desktop Runtime and optionally invoke Claude Code, but the Desktop product still requires manual environment setup and does not clearly report whether local Claude Code is actually connected. Agent roles are also hard-coded defaults, so users cannot create a persistent Claude Code-backed character and continue talking to it over time.

This change turns the local run loop into a usable Desktop capability and introduces role-isolated long-term memory through `rohitg00/agentmemory`.

## What Changes

- Add Desktop Runtime provider preflight for the configured Claude Code binary and surface provider health through Control Plane snapshots and status routes.
- Add optional agentmemory health checks, context retrieval, and observation writes using the local HTTP API.
- Add local MVP agent role management APIs and replace hard-coded agents with registry-managed defaults plus user-created roles.
- Enrich `run.start` system prompts with role-specific memory context when agentmemory is available.
- Keep smoke provider mode and memory-off fallback deterministic for CI and local development.
- Update Web/Desktop workbench state and UI so users can see Claude Code and memory status, create roles, and send messages to those roles.
- Add smoke coverage for fake Claude Code execution and memory context/observation flow.

## Capabilities

### New Capabilities

- `agent-role-management`: Users can create, update, archive, list, and run Claude Code-backed agent roles.
- `long-term-agent-memory`: AgentHub can connect to agentmemory and scope memory by user, workspace, and agent role.

### Modified Capabilities

- `runtime-device-control`: Runtime registration and snapshots include provider and memory health.
- `conversation-workbench`: The workbench exposes role creation and connection status for Claude Code and memory.
- `local-runnable-topology`: Local verification covers fake Claude Code and agentmemory-backed runs in addition to smoke mode.

## Impact

- Affected code: `packages/contracts`, `services/control-plane`, `runtimes/desktop`, `apps/web`, `packages/ui`, smoke scripts, tests, and docs.
- API impact: Adds agent role and status routes while preserving existing run creation payloads.
- Runtime impact: Desktop Runtime performs cheap provider and memory preflights and publishes status during registration.
- Data impact: Local MVP remains in-memory; Supabase persistence is deferred.

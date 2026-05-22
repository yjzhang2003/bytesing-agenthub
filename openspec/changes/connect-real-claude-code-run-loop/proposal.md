## Why

AgentHub already has local run commands, Desktop Runtime provider adapters, Control Plane events, and workbench rendering, but the next functional gap is proving that a user-started run can execute through the real Claude Code adapter and appear back in the workbench as live run output.

Closing this loop now turns the MVP from a runnable smoke/demo topology into a usable local execution path while preserving the existing provider boundary.

## What Changes

- Let Desktop/Web start a direct local agent run against the active workspace when the Desktop Runtime is online.
- Dispatch the run from Control Plane to the bound Desktop Runtime as a `run.start` command.
- Execute `providerMode=claude-code` runs through the Desktop Runtime Claude Code provider adapter when configured.
- Normalize provider status and message output into AgentHub run events and conversation timeline messages.
- Keep smoke provider mode available for deterministic verification when Claude Code is unavailable.
- Surface run start, streaming output, completion, failure, and cancellation states in the workbench.
- Add verification that covers the local smoke path and the Claude Code provider boundary without requiring hosted Supabase.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `agent-collaboration`: Direct agent runs produce conversation-visible run output from provider events.
- `runtime-device-control`: Control Plane run commands, Desktop Runtime execution, provider event publication, and cancellation form a closed local run loop.
- `conversation-workbench`: Desktop/Web workbench actions and timeline state reflect live run progress and terminal states.
- `local-runnable-topology`: Local verification proves the run loop in smoke mode and documents how to enable real Claude Code mode.

## Impact

- Affected code: `packages/contracts`, `services/control-plane`, `runtimes/desktop`, `adapters/claude-code`, `apps/web`, `packages/ui`, local smoke/development scripts, and relevant tests.
- API impact: Uses the existing local Control Plane run, runtime command, runtime event, snapshot, and SSE surfaces; may tighten schemas or add fields required for live timeline rendering.
- Runtime impact: Desktop Runtime must poll or subscribe for run commands, execute the configured provider adapter, publish provider events, and report terminal states reliably.
- No database migration, hosted Supabase dependency, deployment flow, team workspace, or cloud runtime behavior is introduced by this change.

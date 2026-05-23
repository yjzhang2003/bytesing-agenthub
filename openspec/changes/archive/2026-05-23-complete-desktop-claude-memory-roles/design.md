## Context

The current local MVP already has the key execution pieces: Web creates runs, Control Plane queues runtime commands, Desktop Runtime polls commands, and provider adapters publish run status and message events. The missing product layer is reliable Desktop visibility into Claude Code readiness and a durable notion of user-created agent roles with role-specific memory.

The implementation should preserve the smoke provider as the default deterministic path. Claude Code and agentmemory are optional local capabilities that must fail visibly but not break smoke verification.

## Decisions

1. Control Plane owns agent role records for the local MVP.

   Agent roles will be stored in `ControlPlaneRegistry` alongside runs and messages. The registry seeds Orchestrator and Implementer when absent, then includes user-created, non-archived roles in snapshots. This matches current in-memory local development and keeps API shape ready for later Supabase persistence.

2. Desktop Runtime performs local preflight and reports health through registration.

   Runtime is the only process that can accurately inspect local binaries and localhost memory services. It will resolve `AGENTHUB_CLAUDE_CODE_BIN` or `claude`, run a cheap validation command, check agentmemory health when enabled, and include health in runtime registration metadata.

3. agentmemory integration uses HTTP first.

   `rohitg00/agentmemory` documents REST endpoints on port `3111`, including `/agentmemory/health`, `/agentmemory/context`, `/agentmemory/observe`, and `/agentmemory/remember`. AgentHub will use those endpoints instead of MCP for the MVP because Runtime and Control Plane already use HTTP-style service clients.

4. Memory is role-isolated.

   AgentHub will derive a namespace as `agenthub:{ownerUserId}:{workspaceId}:{agentId}` and pass it as the agentmemory project. Run prompts receive only memory for the selected role. User prompts and agent output are recorded as observations for the same namespace.

5. Memory failure is non-blocking.

   If agentmemory is disabled, offline, slow, or returns an unexpected response, run creation and provider execution continue without memory context. The status remains visible in snapshots and `/memory/status`.

## Risks / Trade-offs

- Claude Code CLI flags can vary by version, so preflight should use a conservative command such as `--version` and treat failures as status, not fatal startup errors.
- agentmemory response shapes may evolve. The client should tolerate common text/string fields and return empty context if parsing fails.
- In-memory agent roles disappear on Control Plane restart. This is acceptable for local MVP and should be documented as a known limitation until Supabase persistence lands.
- Automatic observation capture from raw provider output can create many memory writes. Start with user prompt and completed output observations; later revisions can batch or stream if needed.

## Rollback

Set `AGENTHUB_PROVIDER_MODE=smoke` and leave `AGENTMEMORY_ENABLED` unset or false. Existing smoke mode and run APIs continue working without new agentmemory behavior.

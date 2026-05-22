## 1. Contracts

- [x] 1.1 Add `ProviderHealth`, `MemoryHealth`, `AgentMemoryConfig`, `CreateAgentRequest`, and `UpdateAgentRequest` types.
- [x] 1.2 Add schemas and validation tests for provider health, memory health, create agent, update agent, and snapshots with optional health.
- [x] 1.3 Add API path constants for agents, runtime provider status, and memory status.

## 2. Control Plane

- [x] 2.1 Add registry-managed seeded agents and user-created role storage.
- [x] 2.2 Add create, list, update, and archive agent methods with ownership and workspace checks.
- [x] 2.3 Add HTTP routes for `/agents`, `/agents/:agentId`, `/agents/:agentId/archive`, `/runtime/provider-status`, and `/memory/status`.
- [x] 2.4 Enrich run command system prompts with selected agent prompts and role-isolated memory context.
- [x] 2.5 Record user prompt and provider output observations through the memory client without blocking runs.

## 3. Runtime and Memory

- [x] 3.1 Add Claude Code binary preflight with connected, missing, unavailable, and misconfigured statuses.
- [x] 3.2 Add agentmemory HTTP client for health, context, and observation writes.
- [x] 3.3 Include provider and memory health in runtime registration.
- [x] 3.4 Add fake Claude Code and memory stub tests for preflight, context fallback, and observations.

## 4. Web and UI

- [x] 4.1 Update client state and view model to expose provider and memory health.
- [x] 4.2 Add workbench controls for creating a role and showing connection status.
- [x] 4.3 Add UI tests for connected/missing/offline states and created role targets.

## 5. Verification

- [x] 5.1 Keep `pnpm smoke:local` green.
- [x] 5.2 Add fake Claude Code smoke verification.
- [x] 5.3 Add agentmemory stub smoke verification.
- [x] 5.4 Run `pnpm test`, `pnpm typecheck`, `pnpm lint`, and `openspec validate complete-desktop-claude-memory-roles --strict`.

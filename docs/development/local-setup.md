# Local Development Setup

## Prerequisites

- Node.js 24 or newer.
- pnpm 10.
- Supabase project or local Supabase stack for account-backed development.
- Claude Code installed and authenticated on the Desktop Runtime machine for normal local runs. Set `AGENTHUB_PROVIDER_MODE=smoke` only when you want deterministic smoke output.

## Install

```bash
pnpm install
cp .env.example .env.local
```

Local/demo mode does not require hosted Supabase credentials. Desktop Runtime defaults to the real Claude Code provider when `AGENTHUB_PROVIDER_MODE` is unset, so normal local runs require an installed and authenticated `claude` CLI. Deterministic verification scripts set `AGENTHUB_PROVIDER_MODE=smoke` themselves.

## Quick Start

Start each process in its own terminal:

```bash
pnpm dev:control-plane
pnpm dev:runtime
pnpm dev:web
pnpm dev:desktop
```

`pnpm dev:web` prints the actual Web URL. It is normally `http://127.0.0.1:5173/`, but Vite will choose the next port, such as `5174`, if `5173` is already in use. Desktop loads `AGENTHUB_WEB_URL`, which defaults to `http://127.0.0.1:5173`; if Web starts on a different port, start Desktop with the printed URL:

```bash
AGENTHUB_WEB_URL=http://127.0.0.1:5174 pnpm dev:desktop
```

Desktop is launched from `apps/desktop` and loads its package-local Electron entry at `apps/desktop/dist/main.js` after running `pnpm --filter @agenthub/desktop build`.

Or run the automated local smoke verification:

```bash
pnpm smoke:local
```

Additional local smoke checks:

```bash
pnpm smoke:claude-code:fake
pnpm smoke:memory
AGENTHUB_RUN_REAL_CLAUDE_CODE_SMOKE=1 pnpm smoke:claude-code:real
```

Expected local URLs:

- Control Plane: `http://127.0.0.1:5310`
- Web: `http://127.0.0.1:5173`
- Desktop: Electron shell loading `AGENTHUB_WEB_URL`

## Process Topology

AgentHub runs as separate processes during development:

1. Supabase provides Auth, Postgres, Realtime, and optional Storage.
2. `services/control-plane` validates client requests, routes runtime commands, and normalizes execution state.
3. `runtimes/desktop` registers the local device, owns workspace paths, launches providers, and computes git/diff data.
4. `adapters/claude-code` maps AgentHub runs to the local `claude` CLI.
5. `apps/web` and `apps/desktop` consume shared React UI and call Supabase plus the control plane.
6. `apps/ios` will consume the same API and event contracts from a native SwiftUI client.

## Environment Variables

Local/demo mode:

- `AGENTHUB_AUTH_MODE=local-demo`
- `AGENTHUB_LOCAL_AUTH_TOKEN=agenthub-local-demo-token`
- `AGENTHUB_CONTROL_PLANE_URL=http://127.0.0.1:5310`
- `AGENTHUB_PROVIDER_MODE` unset for real Claude Code, or `AGENTHUB_PROVIDER_MODE=smoke` for deterministic smoke verification
- `AGENTHUB_WORKSPACE_PATH=/absolute/path/to/agenthub`
- `AGENTHUB_WORKSPACE_NAME=AgentHub`

Supabase mode:

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_JWT_SECRET`

Control plane:

- `CONTROL_PLANE_PORT`
- `CONTROL_PLANE_PUBLIC_URL`
- `CONTROL_PLANE_WS_URL`

If the default `5310` port is already in use, run local verification with a matched URL and port override:

```bash
AGENTHUB_CONTROL_PLANE_URL=http://127.0.0.1:5311 CONTROL_PLANE_PORT=5311 pnpm smoke:local
```

Desktop Runtime:

- `AGENTHUB_RUNTIME_DEVICE_NAME`
- `AGENTHUB_WORKSPACE_PATH`
- `AGENTHUB_WORKSPACE_NAME`
- `AGENTHUB_CLAUDE_CODE_BIN`
- `AGENTHUB_RUNTIME_HEARTBEAT_SECONDS`
- `AGENTHUB_RUNTIME_POLL_SECONDS`

Claude Code provider mode:

- `AGENTHUB_PROVIDER_MODE` unset, or `AGENTHUB_PROVIDER_MODE=claude-code` when you want to be explicit
- `AGENTHUB_CLAUDE_CODE_BIN=claude` or an absolute path to the authenticated Claude Code CLI
- `AGENTHUB_CLAUDE_CODE_PROFILE_ROOT=/absolute/path` to override the default `~/.agenthub/claude-code`
- `AGENTHUB_CLAUDE_CODE_PLUGIN_DIRS=/path/to/pluginA:/path/to/pluginB` to expose additional local plugin directories on macOS/Linux

When the provider mode is unset or explicitly `claude-code`, new Control Plane run commands are executed by the Claude Code provider adapter. Desktop Runtime preflights the binary and reports provider health plus Claude Code discovery summaries in the workbench snapshot and Connections UI. Set `AGENTHUB_PROVIDER_MODE=smoke` only for deterministic verification or when you need to work without the CLI.

Managed Claude Code profile modes:

- `inherit` lets Claude Code load user, project, and local settings.
- `managed` passes AgentHub-managed settings, MCP config, and plugin directories while launching from the bound workspace. This is the composer default.
- `isolated` constrains Claude Code to AgentHub-selected local profile files and strict MCP config when available.

AgentHub stores generated profile files outside the workspace by default under `AGENTHUB_CLAUDE_CODE_PROFILE_ROOT` or `~/.agenthub/claude-code`. Workspace `.claude/settings*.json`, `.mcp.json`, `CLAUDE.md`, plugin files, hook commands, MCP secrets, and full `SKILL.md` contents stay local; clients receive only summaries such as names, counts, path labels, and status.

Long-term memory with `rohitg00/agentmemory`:

- `AGENTMEMORY_ENABLED=true`
- `AGENTMEMORY_URL=http://127.0.0.1:3111`
- `AGENTMEMORY_VIEWER_URL=http://127.0.0.1:3113`
- `AGENTMEMORY_TIMEOUT_MS=1000`
- `AGENTMEMORY_SECRET` when your local agentmemory server requires a bearer token

When enabled, Desktop Runtime checks `/agentmemory/health`, fetches role-scoped context from `/agentmemory/context`, and writes non-blocking observations to `/agentmemory/observe`. Memory namespaces are isolated per user, workspace, and agent role using `agenthub:{userId}:{workspaceId}:{agentId}`. If agentmemory is unavailable, runs continue without memory context and the workbench shows memory as unavailable.

Web/Desktop clients:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_CONTROL_PLANE_URL`
- `VITE_AGENTHUB_LOCAL_AUTH_TOKEN`

## Electron Recovery

If `pnpm dev:desktop` reports that Electron is unavailable, pnpm likely blocked Electron's install script. Use:

```bash
pnpm approve-builds
pnpm install
pnpm --filter @agenthub/desktop check:electron
```

If Electron was already approved, rebuild it:

```bash
pnpm --filter @agenthub/desktop rebuild electron
```

## Smoke Verification

`pnpm smoke:local` starts Control Plane and Desktop Runtime in local/demo mode with `AGENTHUB_PROVIDER_MODE=smoke`, waits for health and runtime registration, creates a minimal run, verifies command delivery through the Desktop Runtime, waits for smoke provider output to appear in the workbench snapshot, verifies the run reaches `completed`, then shuts the spawned processes down. It is CI-friendly because it does not require hosted Supabase credentials or a Claude Code binary.

`pnpm smoke:memory` starts a stub agentmemory HTTP server and also sets `AGENTHUB_PROVIDER_MODE=smoke` for deterministic output. `pnpm smoke:claude-code:fake` intentionally sets `AGENTHUB_PROVIDER_MODE=claude-code` with a temporary fake `claude` binary so the Claude Code adapter path can be verified without a real install.

`AGENTHUB_RUN_REAL_CLAUDE_CODE_SMOKE=1 pnpm smoke:claude-code:real` is optional and invokes the real local Claude Code CLI. It starts the same local topology, checks provider health, queues a minimal plan-only run with managed settings and hooks disabled, then waits for normalized output through Control Plane. If the binary is missing, unauthenticated, or a selected profile is invalid, the script fails with a setup-focused message.

Failure recovery:

- Missing or busy Control Plane: confirm `CONTROL_PLANE_PORT` matches `AGENTHUB_CONTROL_PLANE_URL`, or run with a different port pair such as `AGENTHUB_CONTROL_PLANE_URL=http://127.0.0.1:5311 CONTROL_PLANE_PORT=5311 pnpm smoke:local`.
- Offline Desktop Runtime: check the runtime terminal for registration or heartbeat failures, and confirm `AGENTHUB_LOCAL_AUTH_TOKEN`, `AGENTHUB_CONTROL_PLANE_URL`, and `AGENTHUB_WORKSPACE_PATH` match the Control Plane process.
- Provider failure in smoke mode: inspect the smoke output for the missing step named by the failure message, such as runtime registration, run completion, or provider output recording.
- Missing Claude Code binary: set `AGENTHUB_CLAUDE_CODE_BIN` to the installed CLI path or set `AGENTHUB_PROVIDER_MODE=smoke` for deterministic verification; Claude Code mode reports startup failures instead of silently falling back to smoke output.
- Unsupported Claude Code flag: update the local Claude Code CLI or choose fewer managed profile options. The adapter reports unsupported structured output, permission, settings, MCP, plugin, effort, or session flags as visible run/provider failures.
- Invalid MCP/plugin/profile setup: check `AGENTHUB_CLAUDE_CODE_PROFILE_ROOT`, `AGENTHUB_CLAUDE_CODE_PLUGIN_DIRS`, and local `.mcp.json`. Discovery redacts secrets, so inspect the local files on the Desktop Runtime machine for exact values.

## Known Limitations

- iOS is not part of this runnable change; the SwiftUI client remains a future native implementation target.
- Cloud execution is out of scope. All executable workspace access is through Desktop Runtime.
- Hosted Supabase auth is optional for this local runnable path.
- Deterministic smoke execution is explicit. Normal Desktop Runtime startup uses real Claude Code by default; smoke scripts opt into smoke where they need stable fake output.
- Web and Desktop currently share the same Web workbench surface; Desktop-specific native controls can be added after the process topology is stable.

## Source Privacy Boundary

The cloud stores workspace metadata, messages, run metadata, permission records, artifact metadata, and optional short-lived diff cache entries. Source files and durable full diffs stay local by default.

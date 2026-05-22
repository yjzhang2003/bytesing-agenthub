# Local Development Setup

## Prerequisites

- Node.js 24 or newer.
- pnpm 10.
- Supabase project or local Supabase stack for account-backed development.
- Claude Code installed and authenticated on the Desktop Runtime machine when using `AGENTHUB_PROVIDER_MODE=claude-code`.

## Install

```bash
pnpm install
cp .env.example .env.local
```

The default local/demo mode does not require hosted Supabase credentials or Claude Code. It uses a deterministic local user and a decoupled smoke provider so Web, Desktop, Control Plane, and Desktop Runtime can be verified first.

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
- `AGENTHUB_PROVIDER_MODE=smoke`
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

- `AGENTHUB_PROVIDER_MODE=claude-code`
- `AGENTHUB_CLAUDE_CODE_BIN=claude` or an absolute path to the authenticated Claude Code CLI

When these are set on the Desktop Runtime process, new Control Plane run commands are executed by the Claude Code provider adapter. Desktop Runtime preflights the binary and reports provider health in the workbench snapshot, `/runtime/provider-status`, and settings UI. Do not set `AGENTHUB_PROVIDER_MODE=claude-code` until the CLI is installed and authenticated on the same machine as the Desktop Runtime.

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

`pnpm smoke:local` starts Control Plane and Desktop Runtime in local/demo mode, waits for health and runtime registration, creates a minimal run, verifies command delivery through the Desktop Runtime, waits for smoke provider output to appear in the workbench snapshot, verifies the run reaches `completed`, then shuts the spawned processes down. It is CI-friendly because it does not require hosted Supabase credentials or a Claude Code binary.

`pnpm smoke:claude-code:fake` creates a temporary fake `claude` binary, verifies provider preflight, and completes a Claude Code-mode run without requiring a real Claude Code install. `pnpm smoke:memory` starts a stub agentmemory HTTP server and verifies health, role-scoped context lookup, and user/agent observation writes.

Failure recovery:

- Missing or busy Control Plane: confirm `CONTROL_PLANE_PORT` matches `AGENTHUB_CONTROL_PLANE_URL`, or run with a different port pair such as `AGENTHUB_CONTROL_PLANE_URL=http://127.0.0.1:5311 CONTROL_PLANE_PORT=5311 pnpm smoke:local`.
- Offline Desktop Runtime: check the runtime terminal for registration or heartbeat failures, and confirm `AGENTHUB_LOCAL_AUTH_TOKEN`, `AGENTHUB_CONTROL_PLANE_URL`, and `AGENTHUB_WORKSPACE_PATH` match the Control Plane process.
- Provider failure in smoke mode: inspect the smoke output for the missing step named by the failure message, such as runtime registration, run completion, or provider output recording.
- Missing Claude Code binary: set `AGENTHUB_CLAUDE_CODE_BIN` to the installed CLI path or return to `AGENTHUB_PROVIDER_MODE=smoke`; Claude Code mode reports startup failures instead of silently falling back to smoke output.

## Known Limitations

- iOS is not part of this runnable change; the SwiftUI client remains a future native implementation target.
- Cloud execution is out of scope. All executable workspace access is through Desktop Runtime.
- Hosted Supabase auth is optional for this local runnable path.
- Claude Code real execution is optional. The default smoke provider verifies the same runtime/provider event boundary without invoking the CLI.
- Web and Desktop currently share the same Web workbench surface; Desktop-specific native controls can be added after the process topology is stable.

## Source Privacy Boundary

The cloud stores workspace metadata, messages, run metadata, permission records, artifact metadata, and optional short-lived diff cache entries. Source files and durable full diffs stay local by default.

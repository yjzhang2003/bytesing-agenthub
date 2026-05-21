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

Or run the automated local smoke verification:

```bash
pnpm smoke:local
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

`pnpm smoke:local` starts Control Plane and Desktop Runtime in local/demo mode, waits for health and runtime registration, creates a minimal run, waits for the smoke provider to complete it, then shuts the spawned processes down. It is CI-friendly because it does not require hosted Supabase credentials or a Claude Code binary.

## Known Limitations

- iOS is not part of this runnable change; the SwiftUI client remains a future native implementation target.
- Cloud execution is out of scope. All executable workspace access is through Desktop Runtime.
- Hosted Supabase auth is optional for this local runnable path.
- Claude Code real execution is optional. The default smoke provider verifies the same runtime/provider event boundary without invoking the CLI.
- Web and Desktop currently share the same Web workbench surface; Desktop-specific native controls can be added after the process topology is stable.

## Source Privacy Boundary

The cloud stores workspace metadata, messages, run metadata, permission records, artifact metadata, and optional short-lived diff cache entries. Source files and durable full diffs stay local by default.

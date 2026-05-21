# Local Development Setup

## Prerequisites

- Node.js 24 or newer.
- pnpm 10.
- Supabase project or local Supabase stack.
- Claude Code installed and authenticated on the Desktop Runtime machine.

## Install

```bash
pnpm install
cp .env.example .env
```

Fill the Supabase and control-plane values in `.env`.

## Process Topology

AgentHub runs as separate processes during development:

1. Supabase provides Auth, Postgres, Realtime, and optional Storage.
2. `services/control-plane` validates client requests, routes runtime commands, and normalizes execution state.
3. `runtimes/desktop` registers the local device, owns workspace paths, launches providers, and computes git/diff data.
4. `adapters/claude-code` maps AgentHub runs to the local `claude` CLI.
5. `apps/web` and `apps/desktop` consume shared React UI and call Supabase plus the control plane.
6. `apps/ios` will consume the same API and event contracts from a native SwiftUI client.

## Environment Variables

Supabase:

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_JWT_SECRET`

Control plane:

- `CONTROL_PLANE_PORT`
- `CONTROL_PLANE_PUBLIC_URL`
- `CONTROL_PLANE_WS_URL`

Desktop Runtime:

- `AGENTHUB_RUNTIME_DEVICE_NAME`
- `AGENTHUB_RUNTIME_WORKSPACE_ROOT`
- `AGENTHUB_CLAUDE_CODE_BIN`
- `AGENTHUB_RUNTIME_HEARTBEAT_SECONDS`

Web/Desktop clients:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_CONTROL_PLANE_URL`

## Source Privacy Boundary

The cloud stores workspace metadata, messages, run metadata, permission records, artifact metadata, and optional short-lived diff cache entries. Source files and durable full diffs stay local by default.


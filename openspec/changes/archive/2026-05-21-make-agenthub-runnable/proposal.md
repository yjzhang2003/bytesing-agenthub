## Why

AgentHub currently has a complete architectural and UI foundation, but it is still mostly a scaffold: Web can render, Desktop can typecheck, and backend/runtime packages exist, yet there is no reliable local topology that proves the product can run as one system. This change turns the foundation into a runnable local demo so subsequent work can build against real process boundaries instead of static demo state.

## What Changes

- Add a first-class local development runtime that starts Control Plane API, Desktop Runtime, Web, and Desktop with predictable commands.
- Make the Control Plane expose health, runtime registration, conversation snapshot, event stream, and minimal command endpoints needed by the clients.
- Make Desktop Runtime register with Control Plane, report online/offline state, expose workspace/git metadata, and provide a Claude Code adapter boundary that can run in a safe local demo mode.
- Replace hardcoded Web/Desktop demo state with control-plane-backed state while preserving clear fallback/error states.
- Add smoke verification that proves the local topology starts and the clients can observe runtime availability.
- Document the local setup, environment variables, known limitations, and how to recover from common Electron install/start failures.
- Keep Supabase account integration configured but allow local development to run with a documented local/demo auth mode until real hosted Supabase credentials are provided.

## Capabilities

### New Capabilities
- `local-runnable-topology`: Defines the required local process topology, startup commands, health checks, and smoke verification for a runnable AgentHub development environment.

### Modified Capabilities
- `runtime-device-control`: Runtime registration and device state must be observable by Control Plane and clients during local development.
- `conversation-workbench`: Desktop/Web workbench must read its primary session and runtime state from Control Plane rather than relying only on static demo data.
- `agent-collaboration`: The local demo must support a minimal agent/run lifecycle path that can be driven through Control Plane commands and surfaced in the conversation workbench.

## Impact

- Affected packages: `services/control-plane`, `runtimes/desktop`, `adapters/claude-code`, `packages/contracts`, `packages/ui`, `apps/web`, and `apps/desktop`.
- Affected developer tooling: root `package.json` scripts, local setup docs, smoke test scripts, and environment templates.
- External systems: Electron binary installation, optional Claude Code CLI availability, and optional Supabase credentials.
- No breaking product API is expected; existing contracts may be extended with runnable-state events and local-demo commands.

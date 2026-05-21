## 1. Contracts And Configuration

- [x] 1.1 Add shared schemas and types for local development mode, service health, runtime registration, runtime heartbeat, workspace metadata, workbench snapshot, and normalized run events.
- [x] 1.2 Add shared constants for default local ports, endpoint paths, service names, and development user/device identifiers.
- [x] 1.3 Add contract validators and unit tests for health responses, runtime registration payloads, workspace metadata, and workbench snapshots.
- [x] 1.4 Add local environment template documentation covering Control Plane URL, Web URL, auth mode, workspace path, provider mode, and Electron setup.

## 2. Control Plane Runtime API

- [x] 2.1 Implement a local development configuration loader for the Control Plane with explicit local/demo auth mode.
- [x] 2.2 Add Control Plane health endpoint returning service name, version, mode, and timestamp.
- [x] 2.3 Add in-memory development store for user, workspace, conversation, runtime device, run, and timeline state.
- [x] 2.4 Add runtime registration and heartbeat endpoints that update device online/offline state and capabilities.
- [x] 2.5 Add workspace metadata endpoint or snapshot field sourced from registered runtime metadata.
- [x] 2.6 Add workbench snapshot endpoint returning workspace, conversation timeline, runtime status, and available actions.
- [x] 2.7 Add SSE or equivalent event stream for runtime state, run state, and timeline updates.
- [x] 2.8 Add minimal run command endpoint that creates a run and routes it to the registered Desktop Runtime.
- [x] 2.9 Add Control Plane unit/integration tests for health, registration, heartbeat expiry, snapshot, event publishing, and run lifecycle state.

## 3. Desktop Runtime Process

- [x] 3.1 Implement Desktop Runtime configuration loader with Control Plane URL, workspace path, provider mode, device identity, and heartbeat interval.
- [x] 3.2 Register Desktop Runtime with Control Plane on startup, including device metadata, workspace metadata, git metadata, and provider capabilities.
- [x] 3.3 Send recurring heartbeat updates and mark shutdown/offline when the process exits cleanly.
- [x] 3.4 Implement a runtime command polling or event-consumption loop for minimal local run requests.
- [x] 3.5 Implement a decoupled smoke provider adapter that emits valid normalized run events through the same provider interface used by Claude Code.
- [x] 3.6 Wire Claude Code provider mode to the existing adapter boundary when the CLI is available and configured.
- [x] 3.7 Add Desktop Runtime tests for registration payloads, heartbeat behavior, workspace metadata publication, smoke provider output, and command handling.

## 4. Web And Desktop Client Wiring

- [x] 4.1 Add a shared Control Plane client module for snapshot fetching, event stream subscription, retry behavior, and run command submission.
- [x] 4.2 Replace static Web demo state with Control Plane-backed workbench state while preserving loading, offline, and retry states.
- [x] 4.3 Connect runtime online/offline events to the workbench runtime status display and action enablement.
- [x] 4.4 Connect minimal run submission from the composer or a development action to the Control Plane run command endpoint.
- [x] 4.5 Update Desktop Electron shell configuration so it can load the Web workbench from the configured local URL or local build.
- [x] 4.6 Add Desktop startup diagnostics for missing Electron binary, missing Control Plane URL, or unreachable Web URL.
- [x] 4.7 Add Web/Desktop tests for snapshot loading, offline fallback, runtime status updates, and run event rendering.

## 5. Development Scripts And Smoke Verification

- [x] 5.1 Add root scripts for starting Control Plane, Desktop Runtime, Web, Desktop, and the full local topology.
- [x] 5.2 Add a smoke verification script that checks Control Plane health, starts or validates Desktop Runtime registration, fetches the workbench snapshot, and verifies a minimal run lifecycle.
- [x] 5.3 Add a setup/check script or documented command for Electron binary availability under pnpm.
- [x] 5.4 Ensure `pnpm check` continues to run typecheck, lint, and unit tests across the workspace.
- [x] 5.5 Add CI-friendly behavior for smoke verification that does not require hosted Supabase credentials or real Claude Code availability.

## 6. Documentation And Acceptance

- [x] 6.1 Update root README with runnable local commands, service URLs, expected startup order, and troubleshooting links.
- [x] 6.2 Update `docs/development/local-setup.md` with environment setup, Electron install recovery, local/demo auth behavior, and smoke verification.
- [x] 6.3 Document known limitations: iOS not part of this runnable change, cloud execution out of scope, Supabase hosted auth optional, and Claude Code real execution optional for first smoke path.
- [x] 6.4 Verify Web dev server starts and returns HTTP 200.
- [x] 6.5 Verify Desktop TypeScript build passes and Desktop launch path reaches the workbench when Electron is available.
- [x] 6.6 Verify Control Plane and Desktop Runtime can run together and show runtime online in Web/Desktop state.
- [x] 6.7 Commit the completed runnable-change implementation after verification checkpoints.

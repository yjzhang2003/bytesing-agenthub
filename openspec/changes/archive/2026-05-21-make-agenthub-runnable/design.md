## Context

AgentHub now has archived specifications for the control plane, UI workbench, runtime device model, permissions, artifacts, and iOS experience. The repository also has package scaffolding for the Control Plane service, Desktop Runtime, Claude Code adapter, Web app, Electron Desktop app, shared contracts, and shared UI.

The current gap is operational: the system does not yet provide one reliable local path that starts all important processes and proves that Web/Desktop clients are observing real Control Plane and Runtime state. Web can render a demo screen, Desktop can typecheck, and service packages can build, but developers still need a runnable topology before implementing deeper product flows.

## Goals / Non-Goals

**Goals:**

- Provide predictable root-level commands for local development and smoke verification.
- Start Control Plane, Desktop Runtime, Web, and Desktop from documented commands.
- Make Control Plane expose enough HTTP/SSE endpoints for clients to load a real snapshot and observe runtime/device events.
- Make Desktop Runtime register with Control Plane and publish health, workspace, and provider capability state.
- Make Web/Desktop display Control Plane-backed runtime/session state instead of only static demo data.
- Keep Supabase integration available while allowing local development to run without hosted credentials.
- Make Electron startup reliable or fail with actionable diagnostics when the binary is not installed.

**Non-Goals:**

- Do not implement cloud execution, team workspaces, GitHub integration, deployment publishing, or mobile build completion.
- Do not require a hosted Supabase project for the local runnable demo.
- Do not implement a complete Claude Code production adapter if Claude Code is unavailable; preserve the adapter boundary and provide a decoupled local adapter mode for smoke tests.
- Do not change the approved UI information architecture or product positioning.

## Decisions

### Decision: Use a local development topology before production hosting

The runnable target SHALL be a local topology with separate processes: Control Plane API, Desktop Runtime, Web dev server, and Electron Desktop shell. This matches the product architecture while keeping the first verification loop small.

Alternative considered: collapse everything into the Web app for speed. Rejected because it would hide the Desktop Runtime boundary, which is the core architectural risk for AgentHub.

### Decision: Add local/demo auth as a development mode

Control Plane SHALL support a clearly named local/demo auth mode for development. This mode provides a deterministic user/session identity and bypasses hosted Supabase requirements, while production Supabase auth remains the intended account model.

Alternative considered: require Supabase credentials immediately. Rejected because it would make basic development and CI smoke checks dependent on external setup before the local runtime contract is proven.

### Decision: Keep mocks outside the product runtime boundary

The smoke/demo path SHALL use a decoupled provider mode or adapter implementation, not hardcoded UI mock state. Web/Desktop may render empty/error/offline states, but runtime and conversation state must flow through Control Plane APIs.

Alternative considered: keep UI-only mock fixtures. Rejected because the user explicitly wants mocks decoupled from the product body and wants to connect Claude Code first where possible.

### Decision: Make the Control Plane the observable source of truth

Clients SHALL read session snapshot, runtime status, and timeline events from Control Plane. Desktop Runtime SHALL push registration and runtime events to Control Plane. This keeps Web and Desktop consistent and prepares iOS to reuse the same API schema.

Alternative considered: Desktop shell talks directly to Desktop Runtime and Web uses Control Plane. Rejected because it would create divergent client behavior and make the Web experience second-class.

### Decision: Verify through smoke scripts, not only unit tests

The change SHALL add a smoke command that verifies service health and minimal registration/event flow. Existing typecheck/lint/unit tests remain necessary, but they are insufficient for proving runnable behavior.

Alternative considered: manual startup documentation only. Rejected because this change exists specifically to remove ambiguity around whether the system can run.

### Decision: Treat Electron install as a first-class local setup concern

Desktop startup SHALL detect missing Electron binary or blocked install scripts and provide a documented fix path. The implementation may include a setup/check command rather than relying on a silent `electron` failure.

Alternative considered: leave Electron failure as package-manager behavior. Rejected because Desktop is a required client for the MVP runtime loop.

## Risks / Trade-offs

- [Risk] Local/demo auth can accidentally look like production auth. -> Mitigation: require explicit environment naming and visible development banners/logs.
- [Risk] A decoupled provider mode can drift from Claude Code behavior. -> Mitigation: keep provider interfaces shared, keep the Claude Code adapter package in the loop, and mark demo mode as a smoke/development provider only.
- [Risk] Starting multiple processes is fragile across machines. -> Mitigation: provide root scripts, fixed default ports, health checks, and a single smoke command with clear failure output.
- [Risk] SSE/event ordering bugs may appear once clients use real state. -> Mitigation: start with a small event set and add deterministic tests around snapshot plus event replay.
- [Risk] Electron binary installation may fail because pnpm blocks lifecycle scripts. -> Mitigation: document and automate the supported install path, and fail before launching with actionable guidance.

## Migration Plan

1. Extend contracts with local runtime/session health events and request/response schemas.
2. Implement Control Plane local endpoints and in-memory development store.
3. Implement Desktop Runtime registration, heartbeat, and workspace/provider status publishing.
4. Connect Web and Desktop to the Control Plane snapshot and event stream.
5. Add root-level dev and smoke scripts.
6. Update documentation and environment templates.
7. Verify with `pnpm check`, Web build, Desktop build, and the new smoke command.

Rollback is straightforward before release: remove the new scripts/endpoints and return clients to static demo state. No persistent production migration is introduced by this change.

## Open Questions

- Should the first smoke provider execute the real Claude Code CLI when available, or should that be a separate optional smoke profile after the topology is stable?
- Should Desktop launch Web UI from a local bundled build or always point to the Web dev server during this phase?
- Which local ports should be reserved as defaults for Control Plane, Web, and future Runtime HTTP endpoints?

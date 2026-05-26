## Why

Desktop-only actions such as choosing a local project directory currently depend on a renderer global that can fail to inject silently. This makes the Desktop client indistinguishable from Web at runtime and leaves users without the local-directory creation path required by the new conversation project flow.

## What Changes

- Introduce a versioned Desktop capability bridge between the Electron shell and the shared React workbench.
- Make local Desktop capabilities explicit through capability discovery rather than implicit `window` existence checks.
- Ensure the Desktop preload/build path is executable under Electron and validated before Desktop-only UI is shown.
- Add diagnostics for preload, IPC, and renderer capability failures so Desktop degradation is visible during development.
- Wire native directory selection and AgentHub default-project creation through the bridge with typed request/response validation.
- Keep Web and future iOS clients limited to existing project selection and prevent them from exposing unusable local filesystem actions.
- Add automated verification that a running Desktop renderer exposes the capability bridge and that the workbench renders Desktop-only project actions only when the bridge is available.

## Capabilities

### New Capabilities
- `desktop-capability-bridge`: Versioned Electron-to-workbench capability bridge for Desktop-only native actions, capability discovery, IPC validation, and diagnostics.

### Modified Capabilities
- `workbench-mvp-ui`: Gate Desktop-only project creation actions on discovered Desktop capabilities and preserve Web/iOS existing-project-only behavior.
- `local-runnable-topology`: Extend local Desktop startup and smoke verification to prove preload bridge availability, IPC readiness, and actionable diagnostics.

## Impact

- Affected code: `apps/desktop` Electron main/preload/build configuration, Desktop IPC handlers, `apps/web` bridge detection, shared `packages/ui` project-picker capability gating, and relevant contract types if bridge payloads are centralized.
- Affected behavior: Desktop can create project registrations from native directory/default-directory actions; Web/iOS cannot expose those actions.
- Affected verification: Electron/Desktop smoke tests, UI behavior tests for bridge-present and bridge-absent states, and local development diagnostics for preload failure.

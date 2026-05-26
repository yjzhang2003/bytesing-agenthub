## Context

AgentHub Desktop is an Electron shell that loads the shared Web workbench from the configured local Web URL. The current project-creation flow expects Desktop-only actions to appear when the renderer sees a bridge object, but the bridge is not a durable platform contract: preload failures can be silent, the renderer has no capability-discovery handshake, and tests do not prove that a real Electron renderer receives the bridge.

The immediate failure mode found during exploration is concrete: the Desktop preload output is emitted as ESM, Electron loads it as a preload script, and the renderer logs `SyntaxError: Cannot use import statement outside a module`. Because no diagnostic is surfaced into the app or startup checks, Desktop behaves like Web and hides native project actions.

## Goals / Non-Goals

**Goals:**
- Make Desktop native capabilities an explicit, versioned contract between Electron and the shared workbench.
- Ensure the preload artifact is executable in Electron and fails loudly during local development if it cannot load.
- Provide capability discovery so UI decisions are based on specific supported actions, not only on a global object's existence.
- Route directory selection and default-project creation through typed IPC handlers with safe payload validation.
- Preserve the Web/iOS boundary: remote clients can select existing registered projects but cannot open local directory pickers or create local directories.
- Add verification that exercises a real Desktop renderer, not only static React tests.

**Non-Goals:**
- Replace the shared React workbench with a separate Desktop UI.
- Add cloud access to local source contents.
- Implement sandboxing, provider isolation, or run-environment inheritance.
- Build a general plugin system for arbitrary native Desktop actions.

## Decisions

### Desktop bridge is a versioned capability API

The preload bridge should expose a small API such as `getCapabilities()`, `chooseProjectDirectory()`, and `createDefaultProject()`. The workbench should first ask for capabilities and then pass only available actions into shared UI. This makes the Desktop/Web difference explicit and lets future clients branch on individual capabilities rather than assuming every Desktop build supports every native action.

Alternative considered: keep using `window.agentHubDesktop` truthiness. That is too coarse: it cannot distinguish preload absence, partial IPC readiness, unsupported platform actions, or future Desktop builds with different capabilities.

### Preload build output must match Electron preload execution

The preload file should be built or authored in a format Electron can execute reliably in this repository's current Desktop package. A separate preload TypeScript config, CommonJS output, or small wrapper entry is acceptable, but the implementation must not depend on an unverified ESM preload assumption.

Alternative considered: enable Electron ESM preload behavior directly. That may be viable, but it should still be proven by a real renderer verification test. The immediate requirement is executable preload output, not a specific module format.

### Native actions stay in the Electron main process

Directory picking, default-directory creation, and project metadata generation should be owned by Desktop main-process IPC handlers. The renderer should receive safe project-registration metadata and never gain raw Node or filesystem access.

Alternative considered: let the renderer construct project registrations from path strings. That weakens the platform boundary and repeats the Web problem because browser contexts cannot validate local filesystem availability.

### Diagnostics are part of the capability bridge

Desktop should log preload and renderer-console failures in startup output and expose an app-visible or test-visible degraded state when native capabilities are unavailable. A user-facing workbench does not need to show developer stack traces, but local development must make "Desktop loaded Web without bridge" obvious.

Alternative considered: rely on DevTools console inspection. That already failed the workflow because the Desktop app appeared to load correctly while native actions were unavailable.

### Verification includes real Electron renderer probing

Unit tests are necessary for IPC handlers and React gating, but they are insufficient for preload behavior. This change should add a Desktop smoke path that launches Electron with a local Web target and verifies, through Electron APIs or the DevTools Protocol, that the renderer exposes the expected bridge version and capabilities.

Alternative considered: test only compiled file contents. Static checks can catch obvious output mistakes, but they do not prove the renderer receives the bridge after Electron security settings, preload loading, and Web URL navigation.

## Risks / Trade-offs

- [Risk] Electron preload/build details can vary by Electron version. -> Mitigation: pin behavior with a renderer-level smoke test and keep preload output deliberately small.
- [Risk] Capability discovery could add UI startup latency. -> Mitigation: keep discovery local to the renderer bridge and resolve synchronously or with a short initial promise before enabling native actions.
- [Risk] Duplicating project-registration logic between Desktop Runtime and Desktop shell can drift. -> Mitigation: centralize shared metadata helpers or define a typed contract and test equivalence for directory/default-project registration payloads.
- [Risk] Developer diagnostics may leak too much implementation detail to end users. -> Mitigation: keep detailed logs in Desktop startup output and show only concise unavailable-state copy in product UI.

## Migration Plan

1. Replace the current preload output path with an Electron-compatible bridge entry.
2. Add capability discovery and renderer-side bridge detection.
3. Move UI gating from bridge truthiness to explicit capabilities.
4. Add Desktop IPC validation and diagnostics.
5. Add automated Desktop renderer verification.
6. Re-run the project creation flow in Desktop and confirm Web remains existing-project-only.

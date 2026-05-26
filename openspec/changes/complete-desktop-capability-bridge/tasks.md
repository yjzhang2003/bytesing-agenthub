## 1. Bridge Contract and Build Path

- [x] 1.1 Define the Desktop capability bridge contract, including version, capability ids, project-action responses, cancellation, and error shapes.
- [x] 1.2 Make the Desktop preload artifact executable under the repository's Electron runtime without relying on an unverified ESM preload path.
- [x] 1.3 Expose the bridge through context isolation without enabling Node integration or giving the renderer raw filesystem access.
- [x] 1.4 Add renderer-side bridge detection that returns an explicit no-capabilities result for normal Web browsers.

## 2. Desktop Native Project Actions

- [x] 2.1 Implement typed IPC handlers for native directory selection and AgentHub default-project creation.
- [x] 2.2 Validate Desktop project registration payloads before returning them to the renderer.
- [x] 2.3 Preserve cancellation semantics so closing the native picker does not mutate project selection or create a conversation.
- [x] 2.4 Keep project metadata limited to safe labels, runtime device id, source type, and repository metadata without exposing file contents.

## 3. Workbench Capability Gating

- [x] 3.1 Replace UI gating based on bridge truthiness with capability-based gating for local-directory and default-project actions.
- [x] 3.2 Render New from folder and New default project actions in the new conversation project picker only when Desktop capabilities are present.
- [x] 3.3 Preserve Web and future iOS behavior so remote clients can select existing projects but cannot create local directories.
- [x] 3.4 Surface localized errors for bridge/IPC failures without creating partial conversations or clearing the current creation flow.

## 4. Diagnostics and Developer Feedback

- [x] 4.1 Capture preload execution failures and renderer console errors in Desktop startup diagnostics.
- [x] 4.2 Add an actionable degraded-state diagnostic when Desktop loads the Web workbench without the expected bridge.
- [x] 4.3 Document how developers can distinguish Web loading failures, Control Plane failures, Runtime failures, and Desktop bridge failures.

## 5. Tests and Verification

- [x] 5.1 Add unit coverage for bridge detection in bridge-present and bridge-absent environments.
- [x] 5.2 Add UI behavior coverage for Desktop capability-present, Desktop capability-degraded, and Web existing-project-only project picker states.
- [x] 5.3 Add IPC or main-process tests for successful project registration, invalid payload rejection, and picker cancellation.
- [x] 5.4 Add a Desktop smoke or integration check that launches/probes a real Electron renderer and verifies bridge version plus project capabilities.
- [x] 5.5 Run OpenSpec validation and the relevant Desktop, Web, UI, and smoke verification commands.

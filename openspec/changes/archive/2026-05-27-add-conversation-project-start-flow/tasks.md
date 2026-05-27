## 1. Contracts and Data Model

- [x] 1.1 Add project metadata and conversation project-binding types to contracts, including project id, display name, path label, runtime device id, repository metadata, availability, and default-project flag.
- [x] 1.2 Extend conversation creation request validation to accept selected agent ids plus a required existing project id for cross-client creation and Desktop-only project-registration result for local project creation.
- [x] 1.3 Extend conversation snapshot models so active conversations expose their project binding and clients can render project context.
- [x] 1.4 Add validation tests for project records, project-bound conversation creation, unauthorized project rejection, and missing-project run guards.

## 2. Control Plane and Runtime

- [x] 2.1 Add Control Plane storage/update paths for user-owned project metadata without source content.
- [x] 2.2 Implement project-bound conversation creation for one or more selected agents, including membership creation and existing Claude session binding behavior.
- [x] 2.3 Reject conversation creation when selected agents or selected project are missing, archived, or not owned by the signed-in user.
- [x] 2.4 Resolve local run commands from the conversation's project binding and include project id plus resolved workspace path in `run.start`.
- [x] 2.5 Reject local run requests for unbound conversations or offline/unavailable project runtimes before queueing provider commands.
- [x] 2.6 Add Desktop Runtime support for registering an existing local directory and creating/reusing an AgentHub-managed default project directory.

## 3. Chat Creation UI

- [x] 3.1 Add a compact new-conversation icon button next to the Chat sidebar search field with localized accessible labels.
- [x] 3.2 Build a reusable agent-selection picker from the existing add-agent picker pattern for new conversation creation.
- [x] 3.3 Add a project picker step that lists existing projects with path/runtime/branch metadata.
- [x] 3.4 Add Desktop-only project picker actions for choosing a local directory through Desktop Runtime and selecting the AgentHub-managed default directory; keep Web/iOS limited to existing projects.
- [x] 3.5 Wire creation confirmation to create direct conversations for one selected agent and group conversations for multiple selected agents.
- [x] 3.6 Preserve current Chat selection, inspector state, and composer draft when the creation flow is cancelled or fails.

## 4. Project Context Visibility

- [x] 4.1 Render the active conversation's project context in the center header or adjacent context area without crowding the title.
- [x] 4.2 Add full project binding details to conversation detail, including project name, path label, runtime availability, branch, and default-directory status.
- [x] 4.3 Show unbound project state for historical conversations and block local execution until a project is selected.
- [x] 4.4 Ensure run detail or runtime metadata surfaces expose the project id/path used by a local run.

## 5. Localization and Visual Fit

- [x] 5.1 Add English and Simplified Chinese labels for new conversation, agent selection, project selection, existing projects, choose folder, default project, unbound project, offline runtime, and creation errors.
- [x] 5.2 Align the new sidebar button, creation modal, agent picker, and project picker with existing AgentHub density, spacing, focus, and dark/light theme tokens.
- [x] 5.3 Verify long project names, long path labels, and offline status copy do not overlap in desktop or narrow layouts.

## 6. Tests and Verification

- [x] 6.1 Add component tests for the Chat sidebar new-conversation button and creation modal opening without leaving Chat.
- [x] 6.2 Add behavior tests for selecting one agent, selecting multiple agents, choosing existing/default/directory projects on Desktop, remote-client existing-project-only behavior, cancelling, and surfacing creation failures.
- [x] 6.3 Add Control Plane tests for project-bound conversation creation, project ownership validation, and project-bound run command path resolution.
- [x] 6.4 Add Desktop Runtime tests for default project directory creation/reuse and directory registration failure handling.
- [x] 6.5 Run relevant contract, Control Plane/runtime, UI, and localization tests plus a browser verification pass covering the full new conversation creation flow.

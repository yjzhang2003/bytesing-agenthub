## Why

Creating a conversation from Chat currently lacks an explicit project selection step, so users can miss which local directory a new agent conversation will execute against. This makes agent behavior feel surprising when a run immediately explores the current repository.

## What Changes

- Add a new-conversation entry point next to the Chat sidebar search field.
- Reuse the existing add-agent picker pattern so users select one or more agents before creating the conversation.
- Add a project selection dialog to the creation flow where users can select an existing project; Desktop users can also create a project from a chosen local directory or use a safe default project directory created by AgentHub.
- Persist the selected project binding on the new conversation and expose it in conversation metadata, runtime commands, and visible UI context.
- Ensure first-run behavior uses the selected conversation project binding rather than an implicit process working directory.
- Localize the new Chat creation and project-selection labels in English and Simplified Chinese.

## Capabilities

### New Capabilities
- `conversation-project-binding`: Conversation-level project binding, including cross-client existing project selection, Desktop-only local-directory/default project creation, and run-context visibility.

### Modified Capabilities
- `workbench-mvp-ui`: Add the Chat sidebar new-conversation action, agent selection reuse, project picker dialog, and visible project binding in conversation UI.
- `conversation-workbench`: Add conversation creation from Chat with agent and project selection while preserving workspace and composer context.
- `runtime-device-control`: Ensure run commands use the conversation's selected project binding and do not fall back to an implicit runtime working directory.
- `account-sync`: Store and expose project metadata needed for conversation creation without uploading source content.

## Impact

- Affected UI: Chat sidebar header/search area, add-agent picker reuse, new project selection dialog, conversation detail, composer/run context indicators, and localized labels.
- Affected data contracts: conversation creation payloads, conversation snapshot metadata, project/workspace metadata, and runtime `run.start` workspace path resolution.
- Affected services: Control Plane conversation creation, Desktop-only project registration, Desktop Runtime directory selection/default-directory provisioning, and run command preparation.
- Affected tests: UI creation flow tests, project selection edge cases, Control Plane validation for conversation-project binding, and runtime command path resolution tests.

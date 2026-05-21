## ADDED Requirements

### Requirement: Workspace-first navigation
The system SHALL make workspace selection the primary entry point for Desktop, Web, and iOS clients.

#### Scenario: User opens the app with existing workspaces
- **WHEN** the user opens AgentHub after signing in
- **THEN** the client presents the active workspace context before showing workspace-scoped conversations, agents, runs, artifacts, or settings

#### Scenario: User switches workspace
- **WHEN** the user selects a different workspace
- **THEN** the conversation list, agent list, runtime status, run history, and artifact surfaces update to that workspace

### Requirement: Runtime status visibility
The system SHALL keep runtime device availability visible anywhere execution actions are available.

#### Scenario: Workspace runtime is offline
- **WHEN** the selected workspace requires an offline Desktop Runtime
- **THEN** execution controls show an offline state and explain that the runtime must be online

### Requirement: Primary app surfaces
The system SHALL organize MVP navigation around Workspaces, Conversations, Agents, Runs, and Settings.

#### Scenario: User opens workspace navigation
- **WHEN** the user views the primary navigation
- **THEN** the user can reach conversations, agents, run history, and workspace settings for the active workspace

### Requirement: Context continuity
The system SHALL preserve the active workspace and conversation context when opening Plan, Permission, Diff, Runtime, or Artifact details.

#### Scenario: User opens a diff from a message
- **WHEN** the user opens a diff artifact from the conversation timeline
- **THEN** the client keeps the conversation visible or easily returnable while showing the diff detail

### Requirement: MVP scope boundaries
The UI SHALL exclude team spaces, GitHub pull request workflows, cloud runtime execution, deployment publishing, and web preview hosting from MVP navigation.

#### Scenario: User looks for integration features
- **WHEN** the user opens MVP settings or navigation
- **THEN** GitHub, deployment, team, and cloud runtime surfaces are absent or clearly marked as future capabilities

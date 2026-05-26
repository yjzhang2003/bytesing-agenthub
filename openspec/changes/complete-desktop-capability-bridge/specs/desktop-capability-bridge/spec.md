## ADDED Requirements

### Requirement: Versioned Desktop capability bridge
The Desktop client SHALL expose a versioned capability bridge from Electron preload to the shared workbench renderer.

#### Scenario: Desktop renderer loads bridge
- **WHEN** the Desktop app loads the shared workbench renderer
- **THEN** the renderer can query a bridge version and a list of supported Desktop capabilities without enabling Node integration

#### Scenario: Web renderer loads without bridge
- **WHEN** the same Web workbench is loaded in a normal browser
- **THEN** Desktop capability discovery reports no native Desktop capabilities and does not throw

### Requirement: Desktop native project capabilities
The Desktop capability bridge SHALL provide native project actions only when the Desktop shell can service them.

#### Scenario: Directory selection capability is available
- **WHEN** the Desktop shell supports choosing a local project directory
- **THEN** capability discovery includes a local-directory project capability and the renderer can request a native directory picker through the bridge

#### Scenario: Default project capability is available
- **WHEN** the Desktop shell supports creating or reusing the AgentHub default project directory
- **THEN** capability discovery includes a default-project capability and the renderer can request a typed project registration through the bridge

#### Scenario: Native project action is cancelled
- **WHEN** the user cancels the native directory picker
- **THEN** the bridge returns a cancellation result and the workbench keeps the project selection flow open without creating a partial conversation

### Requirement: Desktop bridge IPC validation
The Desktop capability bridge SHALL validate IPC request and response payloads for native project actions.

#### Scenario: Project registration succeeds
- **WHEN** Desktop creates a project registration from a chosen directory or default directory
- **THEN** the bridge returns project id, display name, runtime device id, path label, source type, and repository metadata without exposing source file contents

#### Scenario: Project registration payload is invalid
- **WHEN** an IPC handler produces an invalid project registration payload
- **THEN** the bridge rejects the action with an actionable error instead of passing malformed data to conversation creation

### Requirement: Desktop bridge failure diagnostics
The Desktop client SHALL surface bridge, preload, and IPC failures during local development.

#### Scenario: Preload fails to load
- **WHEN** Electron cannot execute the preload bridge
- **THEN** Desktop startup or renderer diagnostics identify the preload failure instead of silently loading as a Web-only client

#### Scenario: IPC handler is unavailable
- **WHEN** the renderer requests a supported Desktop capability but the main-process handler is missing or fails
- **THEN** the bridge reports the failure and the workbench displays a localized project-action error without creating a conversation

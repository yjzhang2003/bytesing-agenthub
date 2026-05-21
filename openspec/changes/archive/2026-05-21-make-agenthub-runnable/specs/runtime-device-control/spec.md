## ADDED Requirements

### Requirement: Local runtime registration visibility
The system SHALL make Desktop Runtime registration observable through Control Plane during local development.

#### Scenario: Runtime starts in local mode
- **WHEN** Desktop Runtime starts with local development configuration
- **THEN** it registers with Control Plane using a deterministic development user, device id, device name, platform, version, capabilities, and online status

#### Scenario: Runtime stops in local mode
- **WHEN** Desktop Runtime stops or misses the heartbeat timeout
- **THEN** Control Plane marks the runtime offline and publishes the offline state to connected clients

### Requirement: Runtime workspace metadata publication
The Desktop Runtime SHALL publish local workspace metadata needed by the workbench.

#### Scenario: Workspace metadata is available
- **WHEN** Desktop Runtime registers a configured workspace
- **THEN** Control Plane exposes workspace id, display name, local path label, git branch, dirty state, and provider capabilities to clients without uploading source content

### Requirement: Decoupled provider smoke mode
The Desktop Runtime SHALL support a decoupled local provider mode for smoke verification when Claude Code is unavailable.

#### Scenario: Claude Code is unavailable
- **WHEN** the smoke verifier runs without a Claude Code CLI available
- **THEN** Desktop Runtime can use the configured smoke provider mode to emit valid AgentHub run and message events through the same adapter interface

#### Scenario: Claude Code provider is configured
- **WHEN** Claude Code provider mode is configured and the CLI is available
- **THEN** Desktop Runtime uses the Claude Code adapter boundary rather than UI mock data for provider execution

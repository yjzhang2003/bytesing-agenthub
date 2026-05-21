## ADDED Requirements

### Requirement: Desktop Runtime registration
The system SHALL allow a signed-in Desktop Runtime to register itself as an executable device for the owning user.

#### Scenario: Runtime starts successfully
- **WHEN** the Desktop Runtime starts with a valid user session
- **THEN** it registers or updates a device record with name, platform, version, capabilities, and online status

### Requirement: Runtime heartbeat
The system SHALL track runtime liveness through heartbeat updates.

#### Scenario: Heartbeat expires
- **WHEN** a Desktop Runtime stops sending heartbeat updates within the configured timeout
- **THEN** the system marks that runtime device offline and prevents new runs from being routed to it

### Requirement: Local workspace binding
The system SHALL bind executable workspaces to the Desktop Runtime device that can access their local path.

#### Scenario: Run requested for local workspace
- **WHEN** a user starts an agent run for a local workspace
- **THEN** the system routes the run only to the Desktop Runtime device bound to that workspace

### Requirement: Claude Code local process adapter
The system SHALL provide a Claude Code adapter that launches Claude Code as a local process from Desktop Runtime.

#### Scenario: Agent run starts
- **WHEN** a run is assigned to a Claude Code-backed agent on an online Desktop Runtime
- **THEN** the runtime starts Claude Code with the agent role, prompt context, workspace path, and run configuration

#### Scenario: Claude Code process emits output
- **WHEN** the Claude Code process emits structured or textual output
- **THEN** the runtime normalizes it into AgentHub run and message events

### Requirement: Runtime event normalization
The system SHALL expose stable AgentHub events independent of provider-specific output formats.

#### Scenario: Provider output changes format
- **WHEN** the Claude Code adapter parses provider output
- **THEN** downstream clients receive AgentHub event types such as run started, message delta, permission requested, artifact updated, run completed, and run failed

### Requirement: Run cancellation
The system SHALL allow a user to cancel an active run through any signed-in client.

#### Scenario: User cancels active run from iOS
- **WHEN** a user cancels a running task from iOS
- **THEN** the command is routed to the owning Desktop Runtime and the run transitions to cancelling or cancelled

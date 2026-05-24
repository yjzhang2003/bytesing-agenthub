## Purpose
Define Desktop Runtime registration, heartbeat, workspace binding, Claude Code execution, event normalization, cancellation, and local smoke provider behavior.
## Requirements
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

#### Scenario: Runtime reports Claude Code preflight status
- **WHEN** Desktop Runtime starts in Claude Code provider mode
- **THEN** it resolves the configured Claude Code binary, performs a cheap executable check, and reports provider health as connected, missing, unavailable, or misconfigured

#### Scenario: Workbench displays provider health
- **WHEN** Control Plane has provider health from Desktop Runtime
- **THEN** the workbench snapshot includes that health so Desktop/Web can show whether local Claude Code is connected or why it is unavailable

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

### Requirement: Local runtime registration visibility
The system SHALL let Desktop Runtime register local device and workspace metadata with Control Plane.

#### Scenario: Runtime registers provider and memory health
- **WHEN** Desktop Runtime registers a device
- **THEN** Control Plane stores provider health and memory health alongside workspace metadata for snapshot and status route consumers

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

### Requirement: Closed local run command loop
The system SHALL route user-started local runs from Control Plane to the Desktop Runtime bound to the requested workspace.

#### Scenario: Control Plane queues a run command
- **WHEN** an authenticated user starts a run for a workspace bound to an online Desktop Runtime
- **THEN** Control Plane creates a queued run and makes a `run.start` command available to that runtime with run id, workspace id, conversation id, agent id, workspace path, prompt, system prompt, and provider mode

#### Scenario: Runtime executes a run command
- **WHEN** Desktop Runtime receives a `run.start` command
- **THEN** it invokes the configured provider adapter with the command payload and publishes provider runtime events back to Control Plane

#### Scenario: Workspace runtime is unavailable
- **WHEN** an authenticated user starts a run for a workspace with no online bound Desktop Runtime
- **THEN** Control Plane rejects the request without creating an executable provider command

### Requirement: Provider event status normalization
The system SHALL translate provider runtime events into stable AgentHub run status and message events.

#### Scenario: Provider reports running or streaming
- **WHEN** Control Plane receives a provider status event for an owned run
- **THEN** it updates the run status and publishes an AgentHub run status event for the same run

#### Scenario: Provider emits message delta
- **WHEN** Control Plane receives a provider message delta for an owned run
- **THEN** it records conversation-visible message content and publishes an AgentHub message delta event for the same conversation, run, and agent

#### Scenario: Provider reports completion or failure
- **WHEN** Control Plane receives a provider terminal status for an owned run
- **THEN** it records the run completion or failure timestamp and publishes the corresponding terminal run event

### Requirement: Runtime run cancellation loop
The system SHALL deliver user cancellation requests to the Desktop Runtime and reflect cancellation state in Control Plane.

#### Scenario: User cancels active run
- **WHEN** an authenticated user cancels an active local run
- **THEN** Control Plane marks the run as cancelling and makes a `run.cancel` command available to the bound Desktop Runtime

#### Scenario: Runtime cancels provider process
- **WHEN** Desktop Runtime receives a `run.cancel` command for an active provider run
- **THEN** it asks the provider adapter to cancel the run and publishes the resulting terminal status

### Requirement: Runtime connection check commands
The Desktop Runtime SHALL handle connection check commands from Control Plane without creating agent runs.

#### Scenario: Runtime receives provider check command
- **WHEN** Desktop Runtime receives a connection check command for the configured Claude Code provider
- **THEN** it runs the provider preflight and publishes a provider health result for the owning user

#### Scenario: Runtime receives memory check command
- **WHEN** Desktop Runtime receives a connection check command for agentmemory
- **THEN** it runs the memory health check and publishes a memory health result for the owning user

#### Scenario: Runtime receives unsupported check command
- **WHEN** Desktop Runtime receives a connection check command for an unsupported or disabled provider
- **THEN** it reports a disabled or misconfigured result without starting an agent run

### Requirement: Control Plane connection check routing
The Control Plane SHALL route user-triggered local connection checks to the Desktop Runtime bound to the active workspace.

#### Scenario: Control Plane queues provider check
- **WHEN** an authenticated user requests a provider connection check for a workspace with an online bound Desktop Runtime
- **THEN** Control Plane queues a connection check command for that runtime

#### Scenario: Control Plane stores provider check result
- **WHEN** Control Plane receives a provider health result from Desktop Runtime
- **THEN** it stores the result so snapshot and provider status consumers see the fresh status and checked time

#### Scenario: Control Plane stores memory check result
- **WHEN** Control Plane receives a memory health result from Desktop Runtime
- **THEN** it stores the result so snapshot and memory status consumers see the fresh status and checked time

#### Scenario: Runtime is offline for local check
- **WHEN** an authenticated user requests a local connection check for a workspace with no online bound Desktop Runtime
- **THEN** Control Plane rejects the check request without queueing a command and returns an actionable offline explanation


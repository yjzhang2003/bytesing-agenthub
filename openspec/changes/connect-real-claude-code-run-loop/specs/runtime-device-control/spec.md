## ADDED Requirements

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

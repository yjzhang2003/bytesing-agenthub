## ADDED Requirements

### Requirement: Runtime project directory registration
The Desktop Runtime SHALL support registering local project directories for conversation binding.

#### Scenario: User selects local directory
- **WHEN** a signed-in Desktop user selects a local directory for a new project
- **THEN** Desktop Runtime validates path access and publishes project metadata to Control Plane without uploading source content

#### Scenario: User selects default project
- **WHEN** the user chooses the AgentHub-managed default project option
- **THEN** Desktop Runtime creates or reuses the configured default directory and registers it as a project available for conversation binding

#### Scenario: Directory is inaccessible
- **WHEN** Desktop Runtime cannot access or create the selected directory
- **THEN** it returns a project-registration error and no executable project binding is created

### Requirement: Conversation-bound runtime path resolution
The system SHALL resolve local run working directories from the conversation's project binding.

#### Scenario: Conversation has project binding
- **WHEN** Control Plane queues a local run for a project-bound conversation
- **THEN** the `run.start` command uses the selected project's workspace path and includes project id, workspace id, conversation id, agent id, prompt, system prompt, and provider mode

#### Scenario: Conversation lacks project binding
- **WHEN** Control Plane receives a local run request for a conversation without a required project binding
- **THEN** it rejects the run before queueing a provider command and returns an explanation that project selection is required

#### Scenario: Runtime receives project-bound run command
- **WHEN** Desktop Runtime receives a `run.start` command with a project id and workspace path
- **THEN** it launches the provider adapter from that resolved directory rather than the runtime process working directory

## MODIFIED Requirements

### Requirement: Closed local run command loop
The system SHALL route user-started local runs from Control Plane to the Desktop Runtime bound to the requested workspace or conversation project.

#### Scenario: Control Plane queues a run command
- **WHEN** an authenticated user starts a run for a conversation whose selected project is bound to an online Desktop Runtime
- **THEN** Control Plane creates a queued run and makes a `run.start` command available to that runtime with run id, workspace id, project id, conversation id, agent id, workspace path, prompt, system prompt, and provider mode

#### Scenario: Runtime executes a run command
- **WHEN** Desktop Runtime receives a `run.start` command
- **THEN** it invokes the configured provider adapter with the command payload and publishes provider runtime events back to Control Plane

#### Scenario: Workspace runtime is unavailable
- **WHEN** an authenticated user starts a run while the selected conversation project has no online bound Desktop Runtime
- **THEN** Control Plane rejects the request without creating an executable provider command

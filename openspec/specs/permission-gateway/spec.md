## Purpose
Define permission request events, user authorization decisions, risk gates, audit logging, and timeout handling for risky agent actions.
## Requirements
### Requirement: Permission request events
The system SHALL represent risky agent actions as explicit permission request events before execution.

#### Scenario: Agent wants to modify files
- **WHEN** an agent attempts to write, patch, delete, or rename files in a workspace
- **THEN** the system creates a permission request before allowing the action

#### Scenario: Agent wants to run a command
- **WHEN** an agent attempts to run a shell command
- **THEN** the system creates a permission request that includes command text, working directory, agent, run, and risk classification

### Requirement: User authorization decisions
The system SHALL allow the user to allow or deny permission requests from any signed-in client.

#### Scenario: User allows once from Web
- **WHEN** the user selects allow once on a permission request from Web
- **THEN** the system authorizes only that specific requested action and records the decision

#### Scenario: User denies from iOS
- **WHEN** the user denies a permission request from iOS
- **THEN** the runtime receives the denial and the blocked agent action does not execute

### Requirement: Risk gates apply in every mode
The system SHALL require permission gates for high-risk actions regardless of whether the conversation is in normal chat mode or Plan Mode.

#### Scenario: Auto-dispatched task requests file write
- **WHEN** an auto-dispatched agent task attempts to write files
- **THEN** the system pauses that action until the user grants permission

### Requirement: Permission audit log
The system SHALL record permission requests and user decisions in an audit log.

#### Scenario: Permission decision is completed
- **WHEN** a permission request is allowed or denied
- **THEN** the audit log records user, device, workspace, conversation, run, agent, requested action, decision, and timestamp

### Requirement: Permission timeout handling
The system SHALL handle permission requests that are not answered within a configured timeout.

#### Scenario: Permission request expires
- **WHEN** a permission request times out without user action
- **THEN** the system denies or blocks the action according to policy and marks the run as blocked or failed with an explanation

### Requirement: Composer permission mode feedback
The system SHALL make composer-selected Claude Code permission mode and effort settings visible as effective settings on the resulting run.

#### Scenario: User selects Ask first and Medium
- **WHEN** the user submits a Claude Code-backed run with Ask first permission mode and Medium effort selected in the composer
- **THEN** the run records and displays Ask first and Medium as effective run settings

#### Scenario: User selects Full access
- **WHEN** the user submits a Claude Code-backed run with Full access selected and confirmed
- **THEN** the run records and displays Full access as an effective high-risk run setting

#### Scenario: Runtime cannot honor a setting
- **WHEN** a selected Claude Code run setting cannot be honored by the active runtime or provider
- **THEN** the workbench prevents submission or shows a run failure explanation that identifies the unsupported setting

### Requirement: Claude Code permission preset audit
The system SHALL record the Claude Code permission preset selected for each Claude Code-backed run.

#### Scenario: Run starts with permission preset
- **WHEN** a Claude Code-backed run is queued with Plan only, Ask first, Auto edits, Full access, or another supported preset
- **THEN** the run metadata or audit trail records the selected preset, source of the selection, and effective risk level

#### Scenario: Composer override changes permission preset
- **WHEN** a user overrides an agent's default permission preset from the composer
- **THEN** the audit trail records that the run used a run-level override

### Requirement: High-risk permission confirmation
The system SHALL visibly gate high-risk Claude Code permission presets before execution.

#### Scenario: User selects full access
- **WHEN** a user selects Full access or an equivalent bypass-style permission preset for a run
- **THEN** the system requires explicit confirmation before queuing the run

#### Scenario: High-risk default is inherited from agent
- **WHEN** an agent has a high-risk default permission preset
- **THEN** the composer shows the high-risk state before the user starts a run

### Requirement: Permission preset and action requests coexist
The system SHALL preserve action-level permission request behavior even when a run-level Claude Code permission preset is selected.

#### Scenario: Run uses ask-first preset
- **WHEN** Claude Code or AgentHub surfaces a risky action during an Ask first run
- **THEN** the existing permission request flow can present the action to the user for allow or deny

#### Scenario: Run uses plan-only preset
- **WHEN** a plan-only run attempts to execute a modifying action
- **THEN** the system blocks or fails the action according to the effective Claude Code profile policy


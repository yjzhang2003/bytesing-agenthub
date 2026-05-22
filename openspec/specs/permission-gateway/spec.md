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

## ADDED Requirements

### Requirement: Collaboration-aware conversation snapshot
The Desktop and Web conversation workbench SHALL include collaboration status for the active project-bound conversation when collaboration state exists.

#### Scenario: Snapshot includes collaboration status
- **WHEN** Control Plane returns a workbench snapshot for a collaboration-enabled conversation
- **THEN** the snapshot includes participating agent work states, current task labels, blocked question counts, heartbeat freshness, and linked OpenSpec change summaries

#### Scenario: Collaboration state is unavailable
- **WHEN** collaboration state cannot be read for the active conversation
- **THEN** the workbench remains usable for ordinary conversation and run history while showing an unavailable collaboration status

### Requirement: Workbench mention routing
The Desktop and Web conversation workbench SHALL preserve explicit `@agent` and `@user` mention intent when submitting group conversation messages.

#### Scenario: User sends agent mention
- **WHEN** the user sends a group message containing a valid participating agent mention
- **THEN** the workbench submits the message with the resolved target agent and mention purpose for Control Plane routing

#### Scenario: User sends user mention from agent workflow
- **WHEN** an agent workflow creates a user-directed question
- **THEN** the workbench displays the question as pending user input linked to the originating conversation and task

#### Scenario: User answers blocking question
- **WHEN** the user answers a pending collaboration question in the workbench
- **THEN** the answer is recorded in collaboration state and dependent tasks can continue according to their stored links

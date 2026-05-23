## ADDED Requirements

### Requirement: Workbench starts local agent runs
Desktop and Web workbenches SHALL let the user start a direct local agent run when the active workspace has an online Desktop Runtime.

#### Scenario: Runtime is online
- **WHEN** the user sends a prompt to a worker agent in a workspace with an online bound Desktop Runtime
- **THEN** the workbench submits a run request to Control Plane and shows the resulting run in the active conversation context

#### Scenario: Runtime is offline
- **WHEN** the user attempts to start a run while the active workspace runtime is offline or unavailable
- **THEN** the workbench prevents execution and keeps the prompt available for retry when runtime availability returns

### Requirement: Workbench reflects live run events
Desktop and Web workbenches SHALL merge Control Plane snapshots and live AgentHub events into the conversation timeline.

#### Scenario: Run status event arrives
- **WHEN** the workbench receives a run status event for the active conversation
- **THEN** the timeline and inspector update the matching run state without requiring a page reload

#### Scenario: Message delta event arrives
- **WHEN** the workbench receives a provider-backed message delta for the active conversation
- **THEN** the timeline displays the agent output in chronological context with the associated run and agent identity

#### Scenario: Live event stream disconnects
- **WHEN** the workbench loses the Control Plane event stream
- **THEN** it can reload the workbench snapshot to recover the latest known runs and messages

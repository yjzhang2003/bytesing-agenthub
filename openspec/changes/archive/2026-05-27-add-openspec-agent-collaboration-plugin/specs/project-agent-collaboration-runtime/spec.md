## ADDED Requirements

### Requirement: Project-scoped collaboration state
The system SHALL maintain project-scoped collaboration state for each conversation that enables participating agents to share roster, task, message, heartbeat, question, event, and OpenSpec link records.

#### Scenario: Collaboration state is initialized
- **WHEN** a project-bound conversation enables agent collaboration
- **THEN** the system creates or loads a conversation-specific collaboration state root containing validated records for agents, events, tasks, inboxes, outboxes, questions, and OpenSpec links

#### Scenario: Collaboration state is read for status
- **WHEN** Control Plane builds a workbench snapshot for a collaboration-enabled conversation
- **THEN** the snapshot includes a summarized collaboration status without exposing raw internal file paths as primary UI content

### Requirement: Agent roster discovery
The system SHALL expose the active conversation's participating agents as a collaboration roster with identity, role, capabilities, backend, availability, and current work state.

#### Scenario: Agent joins collaboration roster
- **WHEN** an agent is added to a collaboration-enabled conversation
- **THEN** the collaboration roster includes that agent for future mention routing and status display

#### Scenario: Agent is removed from future collaboration
- **WHEN** an agent is removed from the conversation
- **THEN** the collaboration roster excludes that agent from future mention targets while preserving historical task, message, and event records

### Requirement: Mention routing
The system SHALL support directed `@agent` and `@user` collaboration messages with explicit mention purpose.

#### Scenario: Agent discussion mention is recorded
- **WHEN** an agent or user mentions a participating agent for discussion
- **THEN** the system records a directed collaboration message for that agent without creating an executable task

#### Scenario: Agent task mention creates assignable work
- **WHEN** an agent or user mentions a participating agent with task handoff intent
- **THEN** the system creates a collaboration task assigned to that agent and links the task to the originating conversation message

#### Scenario: User mention creates blocking question
- **WHEN** an agent mentions the user for clarification, approval, or a decision
- **THEN** the system creates a blocking user question record visible to the user and linked to the dependent task or discussion thread

### Requirement: Task claim and status lifecycle
The system SHALL prevent concurrent task ownership conflicts through claim tokens, version checks, and terminal status rules.

#### Scenario: Agent claims pending task
- **WHEN** a participating agent claims a pending collaboration task with the expected version
- **THEN** the system records the agent as task owner, sets the task status to in progress, issues a claim token, and updates the task version

#### Scenario: Agent completes claimed task
- **WHEN** the claiming agent reports completion with a valid claim token before lease expiry
- **THEN** the system marks the task completed, records the result summary, clears the claim, and appends a task completion event

#### Scenario: Conflicting task completion is rejected
- **WHEN** an agent attempts to complete a task without the active claim token
- **THEN** the system rejects the transition and preserves the existing task state

### Requirement: Heartbeats and blocked state
The system SHALL track agent activity through heartbeat and blocked-state records.

#### Scenario: Agent heartbeat is current
- **WHEN** an agent has reported a heartbeat within the configured freshness window
- **THEN** the collaboration status marks the agent as active or idle according to its latest work state

#### Scenario: Agent is blocked on user input
- **WHEN** an agent has an unresolved blocking user question for its current task
- **THEN** the collaboration status marks that agent as blocked and links to the question record

### Requirement: Append-only collaboration events
The system SHALL append significant collaboration state changes to an ordered event log.

#### Scenario: Task status changes
- **WHEN** a collaboration task is assigned, claimed, completed, failed, or blocked
- **THEN** the system appends a structured event containing the conversation, agent, task, status, and timestamp

#### Scenario: User question is answered
- **WHEN** the user answers a blocking collaboration question
- **THEN** the system appends a structured event and unblocks dependent tasks according to the stored dependency links

### Requirement: OpenSpec projection
The system SHALL project stable collaboration outcomes into OpenSpec artifacts without writing raw transient chat into OpenSpec.

#### Scenario: Task is linked to OpenSpec
- **WHEN** a collaboration task represents durable implementation work for an OpenSpec change
- **THEN** the system records a link between the collaboration task and the matching OpenSpec change task or creates a proposed task entry for user/Orchestrator approval

#### Scenario: Decision is accepted
- **WHEN** a collaboration discussion produces a user-approved design or scope decision
- **THEN** the system can project that decision into the appropriate OpenSpec proposal, design, or spec artifact

#### Scenario: Transient messages remain outside OpenSpec
- **WHEN** agents exchange status updates, draft thoughts, heartbeats, or temporary discussion messages
- **THEN** the system keeps those records in collaboration state and does not write them to OpenSpec artifacts by default

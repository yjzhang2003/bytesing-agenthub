## ADDED Requirements

### Requirement: Agent identity model
The system SHALL model agents as product identities separate from their execution provider.

#### Scenario: Multiple agents share Claude Code provider
- **WHEN** the user creates Orchestrator, Architect, Implementer, and Reviewer agents backed by Claude Code
- **THEN** each agent retains its own name, role, prompt, capabilities, and policy while using the same provider adapter

### Requirement: IM-style conversations
The system SHALL support single-agent and group conversations with ordered messages and typed participants.

#### Scenario: User opens a group conversation
- **WHEN** a user opens a group conversation
- **THEN** the client displays user messages, agent messages, Orchestrator messages, run events, plans, permissions, and artifacts in chronological context

### Requirement: Explicit Orchestrator invocation
The system SHALL start orchestrated dispatch only when the user explicitly mentions Orchestrator or chooses an Orchestrator coordination action.

#### Scenario: User mentions a worker agent
- **WHEN** a user sends a message to a specific non-Orchestrator agent in a group conversation
- **THEN** the system routes the message to that agent without automatically invoking Orchestrator

#### Scenario: User mentions Orchestrator
- **WHEN** a user mentions Orchestrator for a task
- **THEN** the system starts Orchestrator planning for that conversation

### Requirement: Plan Mode
The system SHALL require Orchestrator to produce a dispatch plan before executing coordinated work in Plan Mode.

#### Scenario: Orchestrator creates plan
- **WHEN** Orchestrator receives a coordinated task in Plan Mode
- **THEN** it produces a plan containing goal, assumptions, assigned agents, task steps, dependencies, expected artifacts, and risk notes

#### Scenario: User approves plan
- **WHEN** the user approves a dispatch plan
- **THEN** the system dispatches the approved tasks to the assigned agents

#### Scenario: User requests plan revision
- **WHEN** the user asks Orchestrator to revise a dispatch plan
- **THEN** the system does not dispatch worker tasks until a revised plan is approved

### Requirement: Orchestrator output validation
The system SHALL validate Orchestrator planning and dispatch outputs against the AgentHub event schema.

#### Scenario: Orchestrator emits invalid dispatch plan
- **WHEN** Orchestrator output cannot be parsed as a valid dispatch plan
- **THEN** the system marks the plan invalid and requests regeneration or user intervention without dispatching worker agents

### Requirement: Result aggregation
The system SHALL allow Orchestrator to aggregate worker outputs into a final summary after assigned tasks complete.

#### Scenario: Worker agents complete tasks
- **WHEN** all assigned worker tasks finish or report terminal failure
- **THEN** Orchestrator can produce a final summary referencing completed work, blocked work, artifacts, and recommended next actions

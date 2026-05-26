## MODIFIED Requirements

### Requirement: Explicit Orchestrator invocation
The system SHALL start orchestrated dispatch only when the user explicitly mentions Orchestrator, chooses an Orchestrator coordination action, or sends an unaddressed group message that Orchestrator classifies as requiring coordination and policy permits dispatch.

#### Scenario: User mentions a worker agent
- **WHEN** a user sends a message to a specific non-Orchestrator agent in a group conversation
- **THEN** the system routes the message to that agent without automatically invoking Orchestrator

#### Scenario: User mentions Orchestrator
- **WHEN** a user mentions Orchestrator for a task
- **THEN** the system starts Orchestrator planning for that conversation

#### Scenario: User sends unaddressed group message
- **WHEN** a user sends a group conversation message without mentioning an agent
- **THEN** the system routes the message to Orchestrator as the conversation coordinator without automatically dispatching worker agents

#### Scenario: Orchestrator needs worker dispatch from unaddressed message
- **WHEN** Orchestrator classifies an unaddressed group message as coordinated work
- **THEN** the system requires Plan Mode or an allowed auto-dispatch policy before worker tasks are created

## ADDED Requirements

### Requirement: Mention-based collaboration
The system SHALL support mention-based collaboration among conversation participants and the user.

#### Scenario: Agent mentions another agent
- **WHEN** a participating agent mentions another participating agent in the group conversation
- **THEN** the system records the directed collaboration message and makes it available to the mentioned agent's collaboration inbox

#### Scenario: Agent assigns work to another agent
- **WHEN** a participating agent mentions another participating agent with task handoff intent
- **THEN** the system creates an assignable collaboration task for the mentioned agent and links it to the group conversation

#### Scenario: Agent mentions user
- **WHEN** a participating agent mentions the user for clarification, approval, or a decision
- **THEN** the system records a blocking user question and surfaces it as pending user input in the conversation context

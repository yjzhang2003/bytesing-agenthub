## ADDED Requirements

### Requirement: Agent new conversation creation
The system SHALL support creating a new independent workspace-scoped single-agent conversation for a specific agent identity.

#### Scenario: New conversation is requested for an agent
- **WHEN** a client requests "新对话" for an eligible agent in a workspace
- **THEN** Control Plane creates a conversation with single-agent kind, explicit membership containing that agent, and no synthetic run output

#### Scenario: New conversation is requested for same agent
- **WHEN** a client requests "新对话" for an eligible agent that already has one or more single-agent conversations
- **THEN** Control Plane creates a distinct conversation with single-agent kind, explicit membership containing that agent, and no synthetic run output

#### Scenario: New conversation membership is loaded
- **WHEN** Control Plane returns a workbench snapshot for a newly created single-agent conversation
- **THEN** the snapshot identifies the single participating agent separately from all other workspace agents

### Requirement: Single-agent conversation routing
The system SHALL route messages sent in a single-agent conversation to the participating agent without requiring an explicit mention.

#### Scenario: User sends from single-agent conversation
- **WHEN** the user sends a prompt in a direct single-agent conversation
- **THEN** the run request targets the participating agent by agent id and appends resulting messages and run events to that conversation

#### Scenario: Single-agent conversation targets non-Orchestrator agent
- **WHEN** the participating agent is a non-Orchestrator worker agent
- **THEN** the system routes the prompt directly to that agent without automatically invoking Orchestrator

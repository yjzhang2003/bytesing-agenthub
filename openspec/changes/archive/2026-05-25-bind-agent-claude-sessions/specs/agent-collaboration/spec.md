## ADDED Requirements

### Requirement: Conversation membership creates Claude session bindings
The system SHALL create hidden Claude Code session bindings as part of conversation membership lifecycle for Claude Code-backed agents.

#### Scenario: Single-agent conversation is created
- **WHEN** Control Plane creates a single-agent conversation for a Claude Code-backed agent
- **THEN** it creates an empty Claude Code session binding for that conversation and agent

#### Scenario: Group conversation includes Claude Code agents
- **WHEN** Control Plane creates a group conversation with Claude Code-backed participants
- **THEN** it creates one empty Claude Code session binding per Claude Code-backed participant

#### Scenario: Agent is added to group conversation
- **WHEN** a Claude Code-backed agent is added to a group conversation
- **THEN** that agent receives its own hidden Claude Code session binding for the conversation

### Requirement: Agent runs use conversation-agent session bindings
The system SHALL route direct and orchestrated local runs through the target agent's conversation-agent Claude session binding when the target agent is backed by Claude Code.

#### Scenario: Direct run targets participating Claude Code agent
- **WHEN** a user sends a direct prompt to a Claude Code-backed participant
- **THEN** Control Plane creates the run against that participant's hidden conversation-agent Claude session binding

#### Scenario: Orchestrator dispatches worker task
- **WHEN** Orchestrator dispatches a task to a Claude Code-backed worker in the same conversation
- **THEN** the worker run uses that worker's own hidden conversation-agent Claude session binding

#### Scenario: Historical conversation lacks binding
- **WHEN** a run is requested for a valid Claude Code-backed participant in a historical conversation without a binding record
- **THEN** Control Plane lazily creates the missing binding before queueing the run

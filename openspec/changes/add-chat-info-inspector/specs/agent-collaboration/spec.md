## MODIFIED Requirements

### Requirement: IM-style conversations
The system SHALL support single-agent and group conversations with ordered messages, typed participants, and explicit agent membership.

#### Scenario: User opens a group conversation
- **WHEN** a user opens a group conversation
- **THEN** the client displays user messages, agent messages, Orchestrator messages, run events, plans, permissions, and artifacts in chronological context

#### Scenario: User views group participants
- **WHEN** a user opens chat information for a group conversation
- **THEN** the system exposes the participating agents for that conversation separately from all workspace agents

#### Scenario: User adds an agent to a group conversation
- **WHEN** a user adds an eligible workspace agent to the active group conversation
- **THEN** the agent becomes available for future targeting in that conversation without changing historical messages or completed run records

#### Scenario: User removes an agent from a group conversation
- **WHEN** a user removes an agent from the active group conversation
- **THEN** the agent is removed from future participant and targeting lists for that conversation while historical messages and run records remain visible

#### Scenario: Conversation membership is missing in a legacy snapshot
- **WHEN** a client receives a conversation snapshot without explicit membership data
- **THEN** the client falls back to the existing compatible participant behavior and remains usable

## ADDED Requirements

### Requirement: Conversation membership persistence
The system SHALL persist agent membership for each conversation so Desktop, Web, and future clients can render the same participants.

#### Scenario: Membership snapshot is loaded
- **WHEN** Control Plane returns a workbench snapshot for a conversation with explicit agent membership
- **THEN** the snapshot includes enough membership data for clients to distinguish participating agents from other workspace agents

#### Scenario: Membership changes are synchronized
- **WHEN** an agent is added to or removed from a conversation
- **THEN** connected clients receive updated conversation membership through snapshot refresh or event stream updates

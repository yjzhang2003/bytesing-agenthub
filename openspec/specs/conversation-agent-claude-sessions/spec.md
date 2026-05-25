## Purpose
Define hidden Claude Code session bindings for conversation-agent pairs, including lifecycle, resume behavior, configuration stability, and session id visibility.

## Requirements
### Requirement: Conversation-agent Claude session binding
The system SHALL maintain one hidden Claude Code session binding for each Claude Code-backed agent participating in a conversation.

#### Scenario: Conversation is created with a Claude Code agent
- **WHEN** Control Plane creates a conversation with a Claude Code-backed participating agent
- **THEN** it creates a conversation-agent Claude session binding for that conversation and agent with no provider session id yet

#### Scenario: Claude Code agent is added to a conversation
- **WHEN** a Claude Code-backed agent is added to an existing conversation
- **THEN** Control Plane creates a conversation-agent Claude session binding for that conversation and agent without changing historical messages or runs

#### Scenario: Non-Claude provider agent participates
- **WHEN** a participating agent is not backed by Claude Code
- **THEN** Control Plane does not create a Claude Code session binding for that agent

### Requirement: Lazy Claude session materialization
The system SHALL defer provider Claude Code session id assignment until the first run for the conversation-agent binding reports a provider session id.

#### Scenario: First run has no provider session id
- **WHEN** a user starts the first Claude Code run for a conversation-agent binding whose provider session id is unknown
- **THEN** Control Plane queues the run without a `--resume` session id while preserving the hidden binding record

#### Scenario: Runtime reports provider session id
- **WHEN** Desktop Runtime reports a Claude Code session id for a run associated with a conversation-agent binding
- **THEN** Control Plane stores that provider session id on the matching binding

#### Scenario: Runtime does not report provider session id
- **WHEN** a run completes without a parseable Claude Code session id
- **THEN** Control Plane leaves the binding provider session id empty and does not expose an error solely for missing session capture

### Requirement: Bound session resume
The system SHALL resume the stored Claude Code session for subsequent runs by the same agent in the same conversation.

#### Scenario: Subsequent run has stored session id
- **WHEN** a user starts another run for a conversation-agent binding with a stored provider session id
- **THEN** Control Plane queues the runtime command with Claude Code session behavior that resumes the stored provider session id

#### Scenario: Different agent in same conversation runs
- **WHEN** a different Claude Code-backed agent runs in the same conversation
- **THEN** Control Plane uses that agent's own conversation-agent binding and does not reuse another agent's provider session id

#### Scenario: Same agent runs in different conversation
- **WHEN** the same Claude Code-backed agent runs in another conversation
- **THEN** Control Plane uses the binding for that other conversation and does not reuse the first conversation's provider session id

### Requirement: Session-defining configuration snapshot
The system SHALL keep session-defining Claude Code configuration consistent for a materialized conversation-agent Claude session.

#### Scenario: Binding is created
- **WHEN** Control Plane creates a conversation-agent Claude session binding
- **THEN** it records the effective session-defining Claude Code configuration for that binding

#### Scenario: Provider session already exists
- **WHEN** a later run targets a binding with a stored provider session id
- **THEN** Control Plane uses the binding's session-defining configuration snapshot for the resumed provider session

#### Scenario: User needs changed session-defining configuration
- **WHEN** a user needs to change session-defining configuration after a provider session exists
- **THEN** the system requires an explicit future reset or fork action rather than silently changing the existing hidden binding during ordinary send

### Requirement: Session id non-disclosure
The system SHALL keep Claude Code provider session ids hidden from ordinary conversation UI and timeline content.

#### Scenario: Workbench snapshot is rendered
- **WHEN** Desktop or Web renders the normal conversation workbench snapshot
- **THEN** raw Claude Code session ids are not displayed in the timeline, composer, or normal run detail rows

#### Scenario: Diagnostics need provider metadata
- **WHEN** a diagnostic surface includes provider session metadata
- **THEN** the surface treats the session id as diagnostic-only data and does not make it part of normal run controls

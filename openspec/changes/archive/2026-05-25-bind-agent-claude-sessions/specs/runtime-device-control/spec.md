## ADDED Requirements

### Requirement: Runtime commands carry hidden Claude session resume metadata
The system SHALL include hidden Claude Code session resume metadata in runtime run commands when Control Plane has a stored provider session id for the target conversation-agent binding.

#### Scenario: Stored provider session id exists
- **WHEN** Control Plane queues a `run.start` command for a Claude Code-backed conversation-agent binding with a stored provider session id
- **THEN** the command includes Claude Code options that cause Desktop Runtime to invoke Claude Code with `--resume <claudeSessionId>`

#### Scenario: Stored provider session id is absent
- **WHEN** Control Plane queues the first run for a Claude Code-backed conversation-agent binding without a stored provider session id
- **THEN** the command omits `--resume <claudeSessionId>` and allows Claude Code to create a provider session

#### Scenario: Runtime command is inspected by normal clients
- **WHEN** normal workbench clients inspect run state or timeline content
- **THEN** the raw provider session id from the runtime command is not exposed as ordinary UI copy

### Requirement: Desktop Runtime captures Claude provider session ids
The Desktop Runtime SHALL parse Claude Code provider output for session id metadata and report the captured session id through normalized AgentHub provider events.

#### Scenario: Claude Code stream includes session id
- **WHEN** the Claude Code adapter receives stream-json output containing a provider session id for a run
- **THEN** Desktop Runtime publishes normalized session metadata associated with the AgentHub run id

#### Scenario: Claude Code stream omits session id
- **WHEN** the Claude Code adapter does not observe a provider session id in stream output
- **THEN** Desktop Runtime continues normal run status and message normalization without failing the run solely for missing session metadata

#### Scenario: Provider session id changes after fork or reset
- **WHEN** a future explicit fork or reset action produces a different Claude Code provider session id
- **THEN** Desktop Runtime reports the new provider session id for Control Plane to associate with the intended binding action

### Requirement: Control Plane persists captured Claude session ids
The Control Plane SHALL persist captured Claude Code provider session ids only for the conversation-agent binding associated with the reporting run.

#### Scenario: Provider event reports session id
- **WHEN** Control Plane receives normalized session metadata for an owned run
- **THEN** it updates the hidden binding matching that run's conversation id and agent id

#### Scenario: Provider event references unknown run
- **WHEN** Control Plane receives session metadata for a run it does not own or cannot find
- **THEN** it ignores the session metadata and does not update any binding

#### Scenario: Run fails after reporting session id
- **WHEN** a run reports a session id and later fails
- **THEN** Control Plane may keep the captured session id only if it can safely associate it with the intended binding and does not expose it in normal UI

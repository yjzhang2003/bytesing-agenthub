## ADDED Requirements

### Requirement: Composer hides routine Claude session controls
The Desktop and Web composer SHALL hide routine Claude Code session behavior and raw session id controls from the normal send flow.

#### Scenario: User composes a message to Claude Code-backed agent
- **WHEN** the active target is a Claude Code-backed agent
- **THEN** the composer does not require or display manual `new`, `continue`, `fork`, or raw session id controls for ordinary sending

#### Scenario: User sends a follow-up message
- **WHEN** the user sends another prompt to the same Claude Code-backed agent in the same conversation
- **THEN** the workbench submits the prompt without asking the user to choose a Claude Code session mode

#### Scenario: Advanced session recovery is unavailable in composer
- **WHEN** a user needs to reset or fork a provider session
- **THEN** the normal composer does not expose raw session id entry as the recovery mechanism

### Requirement: Workbench preserves stable per-agent conversation continuity
The Desktop and Web workbenches SHALL present conversation continuity as an AgentHub behavior rather than a provider session selection task.

#### Scenario: Same agent responds multiple times
- **WHEN** the same Claude Code-backed agent responds multiple times in one conversation
- **THEN** the timeline presents the responses as one continuous agent participation history without showing Claude Code session ids

#### Scenario: Multiple agents respond in same conversation
- **WHEN** multiple Claude Code-backed agents respond in the same conversation
- **THEN** the workbench preserves each agent's visible identity without suggesting they share one Claude Code provider session

#### Scenario: Run detail opens
- **WHEN** the user opens normal run detail for a Claude Code-backed run
- **THEN** the detail can show user-relevant execution settings and status while keeping the raw provider session id hidden

### Requirement: Session binding state does not pollute timeline content
The conversation timeline SHALL avoid exposing hidden Claude session binding implementation details.

#### Scenario: Run is resumed with provider session id
- **WHEN** a run uses a stored Claude Code provider session id
- **THEN** the timeline does not render the provider session id, resume argument, or internal binding key

#### Scenario: First run creates provider session
- **WHEN** the first run for a conversation-agent binding captures a provider session id
- **THEN** the timeline remains focused on user and agent messages rather than showing session binding bookkeeping

## ADDED Requirements

### Requirement: Agentmemory-backed role memory
The system SHALL integrate with agentmemory as an optional long-term memory backend.

#### Scenario: Runtime checks memory health
- **WHEN** agentmemory is enabled
- **THEN** Desktop Runtime checks the configured agentmemory health endpoint and reports enabled, status, URL, viewer URL, checked time, and any failure reason

#### Scenario: Run receives role memory context
- **WHEN** a user starts a run for an agent role and agentmemory returns context for that role namespace
- **THEN** the `run.start` command system prompt includes the agent system prompt plus a long-term memory section scoped to that agent role

#### Scenario: Memory service is unavailable
- **WHEN** agentmemory is disabled, offline, slow, or returns invalid context
- **THEN** run creation and provider execution continue without memory context and the memory health reports the unavailable state

#### Scenario: Conversation observations are recorded
- **WHEN** a user prompt or provider output is available for a run
- **THEN** AgentHub records a non-blocking observation to agentmemory using the role namespace, workspace id, conversation id, run id, agent id, and source type

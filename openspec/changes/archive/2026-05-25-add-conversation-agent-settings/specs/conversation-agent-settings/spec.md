## ADDED Requirements

### Requirement: Conversation-scoped agent settings
The system SHALL store agent settings that apply only to a specific conversation membership and SHALL NOT mutate the agent's global configuration when those settings change.

#### Scenario: User edits an agent for one group chat
- **WHEN** a user updates a participating agent's display name, responsibility, participation behavior, context scope, or scoped instructions from a conversation
- **THEN** the system persists those values for that conversation-agent membership only

#### Scenario: Same agent appears in another chat
- **WHEN** the same global agent participates in another conversation
- **THEN** the other conversation uses its own scoped settings or falls back to the global agent defaults without inheriting unrelated conversation overrides

#### Scenario: Historical conversation content exists
- **WHEN** scoped settings are changed after messages or runs already exist
- **THEN** historical messages and completed run records remain visible with their original authorship and are not rewritten

### Requirement: Agent-in-chat detail surface
The Desktop and Web workbench SHALL show a participating agent's conversation-scoped settings in the right Context Inspector.

#### Scenario: User opens agent settings from the timeline
- **WHEN** the user activates an agent avatar or name in the active conversation timeline
- **THEN** the Context Inspector opens the selected agent's settings for the active conversation without navigating away from the conversation timeline

#### Scenario: User opens agent settings from chat participants
- **WHEN** the user activates a participant tile in the conversation detail participant area
- **THEN** the Context Inspector opens the same agent-in-chat settings surface for that conversation-agent membership

#### Scenario: Selected membership is unavailable
- **WHEN** the selected agent is no longer a participant in the active conversation
- **THEN** the inspector displays an unavailable state instead of opening the global Agents page or crashing

### Requirement: Scoped identity and role controls
The agent-in-chat settings surface SHALL let users configure only conversation-scoped identity and role fields.

#### Scenario: User changes scoped identity
- **WHEN** the user edits the conversation display name or conversation responsibility for a participating agent
- **THEN** future participant labels, targeting labels, and orchestration context for that conversation use the scoped values where applicable

#### Scenario: User adds notes
- **WHEN** the user edits notes for the participating agent
- **THEN** the notes are stored for user reference in that conversation and are not injected into provider prompts

#### Scenario: User edits scoped instructions
- **WHEN** the user edits scoped instructions for the participating agent
- **THEN** future runs for that agent in the conversation can include those instructions without changing the global system prompt

### Requirement: Scoped participation controls
The agent-in-chat settings surface SHALL let users configure how a participating agent is eligible to respond or be dispatched in the current conversation.

#### Scenario: User disables a participant
- **WHEN** the user disables a participating agent for the current conversation
- **THEN** the agent remains visible in membership history but is excluded from future targeting, mention suggestions, and orchestration candidate lists for that conversation

#### Scenario: User changes participation mode
- **WHEN** the user selects manual, orchestrated, or proactive participation for a participating agent
- **THEN** the system stores the selected participation mode for that conversation and exposes it to routing and orchestration logic

#### Scenario: User changes dispatch priority
- **WHEN** the user sets low, normal, or high priority for a participating agent
- **THEN** orchestration and candidate ranking can use that scoped priority without changing the global agent role

#### Scenario: User enables quiet mode
- **WHEN** quiet mode is enabled for a participating agent
- **THEN** future conversation behavior can reduce routine chatter from that agent while still allowing results, blockers, and confirmation requests

### Requirement: Scoped context controls
The agent-in-chat settings surface SHALL let users configure the context boundary used by the participating agent in the current conversation.

#### Scenario: User changes context scope
- **WHEN** the user selects conversation-only, workspace-summary, or conversation-artifacts context scope
- **THEN** future run preparation for that agent in the conversation uses the selected scoped context boundary where supported

#### Scenario: User toggles history summary
- **WHEN** the user enables or disables history summary for a participating agent
- **THEN** future run preparation honors that scoped history-summary preference for the conversation

### Requirement: Scoped run policy controls
The agent-in-chat settings surface SHALL expose only lightweight run policy controls that are meaningful in a conversation context.

#### Scenario: User requires run confirmation
- **WHEN** run confirmation is required for a participating agent in the current conversation
- **THEN** future local execution for that agent in the conversation requires confirmation before starting where the runtime supports confirmation gating

#### Scenario: User changes auto-dispatch eligibility
- **WHEN** the user enables or disables auto-dispatch eligibility for a participating agent
- **THEN** Orchestrator dispatch for that conversation includes or excludes that agent accordingly without changing global agent configuration

#### Scenario: User needs global runtime settings
- **WHEN** the user needs to change provider, runtime, MCP, plugin, hooks, tool ACL, or base system prompt settings
- **THEN** the agent-in-chat surface presents those values as read-only global defaults and provides a clear entry point to the global Agents settings surface

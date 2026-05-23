## ADDED Requirements

### Requirement: Agent detail new conversation entry
The Desktop and Web Agents center view SHALL provide a primary "新对话" entry point for existing runnable agents that creates a new single-agent conversation in the Chat view.

#### Scenario: User creates a new conversation from an agent detail
- **WHEN** the user activates "新对话" on an existing runnable agent detail
- **THEN** the workbench creates a new workspace-scoped single-agent conversation for that agent and switches the center view to Chat with the new conversation selected

#### Scenario: Existing agent conversations are not reused from Agent detail
- **WHEN** the user activates "新对话" for an agent that already has one or more single-agent conversations in the active workspace
- **THEN** the workbench creates a separate new conversation instead of selecting an existing conversation

#### Scenario: Agent is not eligible for conversation entry
- **WHEN** the selected agent is archived, unsaved, or otherwise unavailable for runtime participation
- **THEN** the Agents detail does not present "新对话" as the primary available action

### Requirement: Same-agent conversation continuation through Chat
The conversation workbench SHALL keep continuing previous same-agent conversations in the Chat surface rather than the Agent detail surface.

#### Scenario: User searches for prior same-agent conversation
- **WHEN** the user wants to continue an existing conversation with an agent
- **THEN** the Chat view allows the user to find and select prior same-agent conversations through search or the conversation list

#### Scenario: New same-agent conversation appears separately
- **WHEN** a new single-agent conversation is created for an agent that already has another conversation
- **THEN** the conversation list shows the new conversation as a separate thread while preserving the older conversation and its history

### Requirement: New conversation composer readiness
The conversation workbench SHALL prepare the composer for the selected agent after a single-agent conversation is newly created from Agent detail.

#### Scenario: New single-agent conversation opens successfully
- **WHEN** the new single-agent conversation becomes active
- **THEN** the composer targets the participating agent and is ready for the user to enter the first prompt without requiring manual agent selection

#### Scenario: Runtime is unavailable after new conversation opens
- **WHEN** the new single-agent conversation is active and the workspace runtime is offline or unavailable
- **THEN** the composer preserves the drafted prompt context and uses the existing runtime-disabled explanation instead of starting a run

## ADDED Requirements

### Requirement: MVP agent new conversation flow
The Desktop/Web MVP workbench SHALL verify that a user can create a new single-agent conversation from the Agents detail surface and continue in the Chat view.

#### Scenario: Agent detail creates new conversation
- **WHEN** the user opens an existing runnable agent in the Agents center view and activates "新对话"
- **THEN** the UI switches to Chat, selects a newly created single-agent conversation, and leaves any older conversations with the same agent available in the conversation list

#### Scenario: User continues previous agent conversation from Chat
- **WHEN** the user wants to continue an older conversation with the same agent
- **THEN** the UI keeps that selection path in Chat search or the conversation list rather than on the Agent detail surface

#### Scenario: New conversation first message is composed
- **WHEN** the new single-agent conversation is selected after creation from Agent detail
- **THEN** the composer displays localized product chrome, targets the selected agent, and allows the user to send a prompt when runtime state permits

#### Scenario: New conversation appears in chat information
- **WHEN** the user opens chat information for the direct single-agent conversation
- **THEN** the inspector shows the single participating agent and basic chat information without group-only participant copy

### Requirement: MVP agent conversation visual verification
The Desktop/Web MVP implementation SHALL include rendered verification for the agent conversation flow.

#### Scenario: Agent conversation flow is ready for review
- **WHEN** the agent conversation implementation is considered complete
- **THEN** verification covers the Agent detail "新对话" action, Chat view selection after activation, composer target state, same-agent new conversation creation, prior same-agent conversation discovery from Chat, runtime-offline disabled state, and Simplified Chinese rendering

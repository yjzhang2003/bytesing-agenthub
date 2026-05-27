## ADDED Requirements

### Requirement: Chat sidebar conversation creation
The Desktop/Web MVP workbench SHALL provide a compact new-conversation action next to the Chat sidebar search field.

#### Scenario: User scans chat sidebar controls
- **WHEN** the Chat sidebar renders the conversation search field
- **THEN** a localized new-conversation icon button appears adjacent to the search field using the same compact toolbar alignment language

#### Scenario: User starts new conversation from Chat
- **WHEN** the user activates the Chat sidebar new-conversation action
- **THEN** the workbench opens the conversation creation flow without leaving the Chat surface or clearing the current conversation selection until creation is confirmed

#### Scenario: Runtime cannot support new local project
- **WHEN** no Desktop Runtime is available for local directory selection
- **THEN** the new conversation flow keeps existing project selection available and disables Desktop-only local project creation with a localized explanation

### Requirement: Conversation creation agent picker
The Desktop/Web MVP workbench SHALL reuse the add-agent picker visual and interaction pattern when selecting agents for a new conversation.

#### Scenario: User selects agents for new conversation
- **WHEN** the new conversation flow asks for participants
- **THEN** it renders searchable selectable agent rows consistent with the existing add-agent picker and supports selecting one or more eligible agents

#### Scenario: User creates single-agent conversation
- **WHEN** the user confirms exactly one selected agent and a project
- **THEN** the workbench creates a direct single-agent conversation and targets that agent in the composer

#### Scenario: User creates group conversation
- **WHEN** the user confirms multiple selected agents and a project
- **THEN** the workbench creates a group conversation with those agents as participants

### Requirement: Conversation creation project picker
The Desktop/Web MVP workbench SHALL require a project selection step before confirming a new local-agent conversation.

#### Scenario: User selects existing project
- **WHEN** the project picker opens and existing projects are available
- **THEN** the picker lists recent and available projects with display name, path label, runtime availability, and repository branch where available

#### Scenario: User chooses local directory
- **WHEN** the user activates the local directory option
- **THEN** the Desktop client opens a directory picker and Web or iOS do not expose the action except as disabled guidance to open Desktop

#### Scenario: User chooses default project
- **WHEN** a Desktop user selects the AgentHub-managed default project option
- **THEN** the UI clearly labels the project as an AgentHub-created directory rather than silently inheriting the process working directory

#### Scenario: Remote user creates conversation
- **WHEN** Web or iOS opens the project picker
- **THEN** the picker lists existing Desktop-registered projects and does not allow creating a local directory or AgentHub default directory from the remote client

#### Scenario: User confirms project and agents
- **WHEN** the user confirms the creation flow with at least one agent and a valid project selection
- **THEN** the workbench creates the conversation, selects it in Chat, shows the project context, and prepares the composer without starting an agent run automatically

### Requirement: Conversation project context indicator
The Desktop/Web MVP workbench SHALL show the active conversation's project binding in the normal Chat context.

#### Scenario: Project-bound conversation is active
- **WHEN** the active conversation has a project binding
- **THEN** the center header or adjacent context area shows a compact project indicator with project name and repository branch when available

#### Scenario: User opens project context
- **WHEN** the user activates the project indicator
- **THEN** the workbench exposes the full path label, runtime availability, sandbox/profile label when available, and an entry point to conversation details

#### Scenario: Conversation has no project binding
- **WHEN** the active conversation lacks an explicit project binding
- **THEN** the UI shows a clear unbound state and prompts project selection before local execution can start

## MODIFIED Requirements

### Requirement: MVP agent new conversation flow

The Desktop/Web MVP workbench SHALL verify that a user can create a new single-agent conversation from the Agents detail surface and continue in the Chat view with an explicit project binding.

#### Scenario: Agent detail creates new conversation
- **WHEN** the user opens an existing runnable agent in the Agents center view and activates "新对话"
- **THEN** the UI asks for or reuses an explicit project binding, switches to Chat, selects a newly created single-agent conversation, and leaves any older conversations with the same agent available in the conversation list

#### Scenario: User continues previous agent conversation from Chat
- **WHEN** the user wants to continue an older conversation with the same agent
- **THEN** the UI keeps that selection path in Chat search or the conversation list rather than on the Agent detail surface

#### Scenario: New conversation first message is composed
- **WHEN** the new single-agent conversation is selected after creation from Agent detail
- **THEN** the composer displays localized product chrome, targets the selected agent, shows the selected project context, and allows the user to send a prompt when runtime state permits

#### Scenario: New conversation appears in chat information
- **WHEN** the user opens chat information for the direct single-agent conversation
- **THEN** the inspector shows the single participating agent, selected project binding, and basic chat information without group-only participant copy

### Requirement: MVP agent conversation visual verification

The Desktop/Web MVP implementation SHALL include rendered verification for the agent conversation and project-bound creation flow.

#### Scenario: Agent conversation flow is ready for review
- **WHEN** the agent conversation implementation is considered complete
- **THEN** verification covers the Agent detail "新对话" action, Chat sidebar new-conversation action, agent picker selection, project picker existing/default/directory states, Chat view selection after activation, composer target state, visible project context, same-agent new conversation creation, prior same-agent conversation discovery from Chat, runtime-offline disabled state, and Simplified Chinese rendering

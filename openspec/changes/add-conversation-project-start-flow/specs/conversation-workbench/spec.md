## ADDED Requirements

### Requirement: Chat-originated conversation creation
The conversation workbench SHALL let users create a new conversation from the Chat sidebar by selecting participants and a project binding.

#### Scenario: User creates conversation from Chat sidebar
- **WHEN** the user starts the new conversation flow from the Chat sidebar
- **THEN** the workbench collects agent participants and project binding before requesting conversation creation

#### Scenario: Creation is cancelled
- **WHEN** the user cancels the new conversation flow before confirmation
- **THEN** the active workspace, active conversation, inspector state, and composer draft remain unchanged

#### Scenario: Creation succeeds
- **WHEN** Control Plane creates the conversation with selected agents and project binding
- **THEN** the workbench selects the new conversation, updates the conversation list, and prepares the composer for the selected participant context

#### Scenario: Creation fails
- **WHEN** conversation creation fails due to validation, runtime, or project registration errors
- **THEN** the workbench keeps the creation flow open with an actionable localized error and does not add a partial conversation to the list

### Requirement: Conversation creation request shape
The conversation workbench SHALL send conversation creation requests with explicit agent ids and project binding information.

#### Scenario: Direct conversation request
- **WHEN** exactly one agent is selected during creation
- **THEN** the request identifies that agent as the single participant and includes the selected project id or pending project-registration result

#### Scenario: Group conversation request
- **WHEN** multiple agents are selected during creation
- **THEN** the request identifies all selected agents as participants and includes one shared project binding for the conversation

#### Scenario: No project selected
- **WHEN** the user attempts to confirm conversation creation without selecting or creating a project
- **THEN** the client blocks confirmation before sending the request

### Requirement: Project binding execution guard
The conversation workbench SHALL prevent local execution from conversations whose required project binding is absent or unavailable.

#### Scenario: Bound project is available
- **WHEN** the active conversation has a project binding backed by an online Desktop Runtime
- **THEN** local run controls follow the normal agent, permission, and provider availability rules

#### Scenario: Bound project is missing
- **WHEN** the active conversation has no project binding
- **THEN** the composer prevents local run creation and exposes a project-selection action

#### Scenario: Bound project runtime is offline
- **WHEN** the active conversation's project is bound to an offline Desktop Runtime
- **THEN** the composer preserves the draft and shows an offline project/runtime explanation instead of starting a run

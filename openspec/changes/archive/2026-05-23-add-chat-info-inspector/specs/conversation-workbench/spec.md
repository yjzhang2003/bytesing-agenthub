## MODIFIED Requirements

### Requirement: Context Inspector
The workbench SHALL use the right Context Inspector as the default detail surface for selected chats, plans, permissions, diffs, artifacts, and runtime details.

#### Scenario: User selects a plan card
- **WHEN** the user selects a plan card in the timeline
- **THEN** the Context Inspector displays the full plan, plan state, assigned agents, risk notes, and available actions

#### Scenario: User opens chat information from the title
- **WHEN** the user activates the active chat title or equivalent chat header affordance
- **THEN** the Context Inspector displays the active chat information surface without replacing the conversation timeline

#### Scenario: User returns from chat information to timeline context
- **WHEN** the chat information surface is open and the user selects a timeline item with detail
- **THEN** the Context Inspector switches to the selected item detail while preserving the active chat and composer state

## ADDED Requirements

### Requirement: Chat information inspector
The Desktop and Web workbench SHALL provide an IM-style chat information detail surface for the active conversation.

#### Scenario: User opens group chat details
- **WHEN** the active conversation is a group chat and the user opens chat information
- **THEN** the inspector shows participating agent avatars at the top, followed by chat name, chat kind, workspace context, runtime context, timestamps, and membership summary

#### Scenario: User opens single-agent chat details
- **WHEN** the active conversation is a single-agent chat and the user opens chat information
- **THEN** the inspector shows the single participating agent and the same basic chat information rows without rendering group-only copy as required content

#### Scenario: Chat metadata is unavailable
- **WHEN** optional chat announcement, note, or timestamp data is missing
- **THEN** the inspector omits or marks only those rows as unavailable without hiding required chat title, kind, workspace, runtime, or participants

### Requirement: Chat title activation
The active chat title SHALL be an accessible activation target for opening chat information.

#### Scenario: Mouse user clicks chat title
- **WHEN** the user clicks the active chat title in the center workbench header
- **THEN** the right Context Inspector opens the chat information surface for that conversation

#### Scenario: Keyboard user activates chat title
- **WHEN** keyboard focus is on the active chat title affordance and the user presses Enter or Space
- **THEN** the right Context Inspector opens the chat information surface for that conversation

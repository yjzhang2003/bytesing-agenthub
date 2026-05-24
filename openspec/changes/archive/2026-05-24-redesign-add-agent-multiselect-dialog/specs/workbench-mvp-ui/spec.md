## MODIFIED Requirements

### Requirement: IM-style chat participant management

The Desktop/Web MVP workbench SHALL expose compact participant management in the chat information inspector.

#### Scenario: Chat has participating agents

- **WHEN** the chat information inspector renders for a conversation with agent participants
- **THEN** the top area displays each participating agent with an avatar tile and display name without redundant microcopy, decorative borders, or unexplained secondary labels

#### Scenario: User adds agents to the chat

- **WHEN** eligible agents exist outside the active chat and the user activates Add agent from chat information
- **THEN** the workbench exposes a localized searchable multi-select agent picker with eligible agents only and invokes the add-agent membership action for each confirmed selected agent without losing active conversation, inspector, or composer state

#### Scenario: User removes an agent from the chat

- **WHEN** the user activates Remove for a participating agent
- **THEN** the workbench invokes the remove-agent membership action for future chat membership while preserving historical messages and run events

## ADDED Requirements

### Requirement: Add-agent picker search and selection

The Desktop/Web MVP workbench SHALL allow users to find and select multiple eligible agents before confirming chat membership changes.

#### Scenario: User searches eligible agents

- **WHEN** the add-agent picker is open and the user enters a search query
- **THEN** the picker filters eligible agents by display name while preserving any selected agents that still match the eligible set

#### Scenario: User selects multiple agents

- **WHEN** the add-agent picker is open and the user toggles more than one eligible agent row
- **THEN** each toggled row exposes a selected state and the confirmation action remains enabled for the selected set

#### Scenario: User confirms selected agents

- **WHEN** the user confirms the add-agent picker with one or more selected agents
- **THEN** the workbench requests membership additions for all selected agents and closes the picker only after the confirmation action has been invoked

#### Scenario: No eligible agents exist

- **WHEN** the add-agent picker opens with no eligible agents outside the active chat
- **THEN** the picker displays a localized empty state and disables confirmation

#### Scenario: Search has no matches

- **WHEN** the add-agent picker search query matches no eligible agents
- **THEN** the picker displays a localized no-results state without clearing the search query or existing selected state

#### Scenario: Keyboard user manages selection

- **WHEN** the add-agent picker has focus
- **THEN** keyboard navigation reaches search, each visible agent option, cancel, and confirm controls with visible focus and accessible selected state

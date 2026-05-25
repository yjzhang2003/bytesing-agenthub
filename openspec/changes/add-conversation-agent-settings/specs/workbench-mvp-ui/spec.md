## ADDED Requirements

### Requirement: Agent-in-chat inspector visual consistency
The Desktop/Web MVP Context Inspector SHALL render the agent-in-chat settings surface with the same layout language as the existing conversation detail surface.

#### Scenario: Agent-in-chat inspector renders
- **WHEN** the user opens a participating agent's settings from the active conversation
- **THEN** the inspector uses the same right-sidebar body, section spacing, compact rows, avatar treatment, input controls, switch controls, and action density as the conversation detail surface

#### Scenario: Agent-in-chat inspector shows editable scoped settings
- **WHEN** the selected conversation-agent membership is editable
- **THEN** editable scoped settings render as compact conversation-detail-style rows rather than as a separate full-page agent editor or nested card layout

#### Scenario: Agent-in-chat inspector shows global defaults
- **WHEN** global agent defaults are displayed inside the agent-in-chat inspector
- **THEN** they render as read-only summary rows with a clear global-settings entry point and do not appear editable in the conversation-scoped surface

### Requirement: Composer avoids routine effort controls
The Desktop/Web MVP composer SHALL keep routine chat input focused on message composition, targeting, and required execution gating rather than low-level runtime effort tuning.

#### Scenario: Claude Code-backed agent is selected
- **WHEN** the composer targets a Claude Code-backed agent
- **THEN** the normal composer does not render the Low, Medium, High, or XHigh effort selector

#### Scenario: Run uses configured effort defaults
- **WHEN** a run starts without a composer effort override
- **THEN** the system uses the applicable agent default, conversation-scoped policy, or provider default for effort where supported

#### Scenario: User needs technical run settings
- **WHEN** the user needs to inspect or tune technical runtime settings
- **THEN** the UI directs them to agent defaults, conversation-scoped settings where applicable, run detail, or advanced configuration rather than the normal chat input chrome

## MODIFIED Requirements

### Requirement: IM-style chat participant management

The Desktop/Web MVP workbench SHALL expose compact participant management and participant detail entry points in the chat information inspector.

#### Scenario: Chat has participating agents

- **WHEN** the chat information inspector renders for a conversation with agent participants
- **THEN** the top area displays each participating agent with an avatar tile and display name without redundant microcopy, decorative borders, or unexplained secondary labels

#### Scenario: User opens participant settings

- **WHEN** the user activates a participating agent tile in chat information
- **THEN** the right Context Inspector switches to that agent's settings for the current conversation using the same visual layout language as conversation detail

#### Scenario: User adds agents to the chat

- **WHEN** eligible agents exist outside the active chat and the user activates Add agent from chat information
- **THEN** the workbench exposes a localized searchable multi-select agent picker with eligible agents only and invokes the add-agent membership action for each confirmed selected agent without losing active conversation, inspector, or composer state

#### Scenario: User removes an agent from the chat

- **WHEN** the user activates Remove for a participating agent
- **THEN** the workbench invokes the remove-agent membership action for future chat membership while preserving historical messages and run events

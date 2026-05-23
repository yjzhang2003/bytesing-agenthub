## MODIFIED Requirements

### Requirement: MVP Context Inspector modes

The Desktop/Web MVP Context Inspector SHALL support empty, chat information, plan, permission, diff, runtime, artifact, and run detail modes with product-owned labels and actions rendered in the selected product language.

#### Scenario: No detail is selected

- **WHEN** no timeline item or navigation item is selected for inspection
- **THEN** the inspector displays an empty state summarizing active workspace, runtime, and selected conversation context

#### Scenario: User opens chat detail

- **WHEN** the user activates the active chat title or header affordance
- **THEN** the inspector displays chat participants, agent membership actions, and basic chat information using localized product labels while preserving chat title and technical context values

#### Scenario: User opens plan detail

- **WHEN** the user selects a plan card
- **THEN** the inspector displays goal, assumptions, assigned agents, steps, risks, progress, and available plan actions using localized product labels while preserving plan content text

#### Scenario: User opens permission detail

- **WHEN** the user selects a pending permission
- **THEN** the inspector displays requesting agent, action type, action summary, workspace, risk level, related run or plan, and Allow once and Deny actions using localized product labels while preserving technical values

#### Scenario: User opens diff detail

- **WHEN** the user selects a diff card
- **THEN** the inspector displays changed files, insertions, deletions, status, metadata, stale/offline warnings, and an action to open full-screen review using localized product labels while preserving file paths and diff metadata

#### Scenario: User opens runtime detail

- **WHEN** the user selects runtime status
- **THEN** the inspector displays device identity, online state, heartbeat, capabilities, workspace binding, active runs, and offline/degraded explanations when applicable using the selected product language for product chrome

## ADDED Requirements

### Requirement: IM-style chat participant management

The Desktop/Web MVP workbench SHALL expose compact participant management in the chat information inspector.

#### Scenario: Chat has participating agents

- **WHEN** the chat information inspector renders for a conversation with agent participants
- **THEN** the top area displays each participating agent with an avatar tile and display name without redundant microcopy, decorative borders, or unexplained secondary labels

#### Scenario: User adds an agent to the chat

- **WHEN** eligible agents exist outside the active chat and the user activates Add agent from chat information
- **THEN** the workbench exposes a localized agent picker and invokes the add-agent membership action without losing active conversation, inspector, or composer state

#### Scenario: User removes an agent from the chat

- **WHEN** the user activates Remove for a participating agent
- **THEN** the workbench invokes the remove-agent membership action for future chat membership while preserving historical messages and run events

### Requirement: Chat information responsive behavior

The chat information inspector SHALL remain readable in wide, standard, narrow, and mobile-web layouts.

#### Scenario: Wide layout shows chat info in right inspector

- **WHEN** the workbench is in wide layout and the user opens chat information
- **THEN** the chat information surface renders in the right Context Inspector alongside the active timeline

#### Scenario: Narrow layout shows chat info in inspector drawer

- **WHEN** the workbench is in narrow or mobile-web layout and the user opens chat information
- **THEN** the chat information surface renders in the existing inspector drawer or detail route without covering required navigation back to the timeline

#### Scenario: Inspector drawer animates into view

- **WHEN** the chat information drawer opens or closes in narrow or mobile-web layout
- **THEN** the drawer content keeps stable dimensions during the motion and does not continuously reflow to fit the visible portion of the drawer

### Requirement: Workbench chrome avoids redundant microcopy

The Desktop/Web MVP workbench SHALL avoid extra secondary labels, counts, helper text, or controls that do not directly support the current task.

#### Scenario: Chat information uses compact participant tiles

- **WHEN** the chat information inspector renders participating agents
- **THEN** each participant tile shows only the identity needed to recognize the agent, and omits role subtitles, participant-count captions, and remove controls unless the user explicitly enters a membership editing mode

#### Scenario: Chat information header renders

- **WHEN** the chat information inspector is selected
- **THEN** the inspector header omits a Clear action because the close/collapse affordance already exits the side panel context

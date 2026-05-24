## ADDED Requirements

### Requirement: IM-style add-agent picker visual pattern

The Desktop/Web visual system SHALL provide an AgentHub-owned compact add-agent picker pattern that matches an IM contact selection list while preserving AgentHub theme tokens.

#### Scenario: Add-agent picker renders

- **WHEN** the chat add-agent picker opens
- **THEN** it displays a prominent search field at the top, followed by vertically stacked agent rows with a circular selection control, avatar thumbnail, and display name aligned on one line

#### Scenario: Agent row selection changes

- **WHEN** an agent row is selected or unselected
- **THEN** the circular selection control, row state, and accessible selected state update without changing row height or shifting adjacent rows

#### Scenario: Picker uses compact workbench styling

- **WHEN** the add-agent picker renders in light or dark theme
- **THEN** it uses AgentHub semantic tokens for background, text, border, focus, hover, selected, and disabled states rather than unscoped vendor defaults

#### Scenario: Long agent names render

- **WHEN** an eligible agent has a long display name or Chinese product chrome is selected
- **THEN** row text remains readable through constrained wrapping or truncation without overlapping the selection control, avatar, or dialog actions

#### Scenario: Picker renders on narrow layout

- **WHEN** the workbench uses a narrow or mobile-web layout
- **THEN** the picker fits within the viewport, keeps search and actions reachable, and scrolls the agent list without horizontal overflow

# agenthub-component-system Specification

## Purpose
TBD - created by archiving change replace-antd-with-agenthub-components. Update Purpose after archive.
## Requirements
### Requirement: First-party component ownership
The Desktop/Web UI SHALL use AgentHub-owned components for common interactive controls rather than styled vendor component frameworks.

#### Scenario: Feature renders a common control
- **WHEN** a feature needs a button, icon button, input, text area, select, checkbox, switch, dialog, dropdown, tabs, badge, avatar, empty state, loading state, tooltip, or feedback message
- **THEN** it imports an AgentHub component whose public API is defined by AgentHub and not by a styled vendor framework

#### Scenario: Component implementation uses behavior primitives
- **WHEN** a component needs complex accessibility behavior such as focus trapping, menu positioning, select listbox navigation, or tooltip positioning
- **THEN** it MAY use unstyled behavior primitives while preserving AgentHub-owned markup classes, tokens, variants, and visual states

### Requirement: Component standard documentation
The Desktop/Web UI SHALL include a concise component standard that defines AgentHub component usage and visual behavior.

#### Scenario: Developer implements a new UI surface
- **WHEN** a developer adds a new Desktop/Web feature surface
- **THEN** the component standard documents which AgentHub component to use, its supported variants, density rules, accessibility requirements, and localization expectations

#### Scenario: Developer needs a missing component
- **WHEN** an existing AgentHub component does not cover a required interaction
- **THEN** the developer extends the component system or documents a local exception rather than importing a styled vendor component directly

### Requirement: Semantic variants and states
AgentHub components SHALL expose semantic variants and state attributes that map directly to AgentHub product behavior.

#### Scenario: Button variants render
- **WHEN** a button renders as primary, secondary, ghost, danger, or icon-only
- **THEN** its visual treatment uses AgentHub semantic tokens and compact density without inheriting third-party default colors, radius, typography, or shadows

#### Scenario: Disabled and focused controls render
- **WHEN** a component is disabled, selected, active, focused, invalid, loading, warning, or destructive
- **THEN** it exposes a stable AgentHub state contract through props, attributes, and classes that tests can verify without depending on vendor DOM internals

### Requirement: Overlay and portal discipline
AgentHub overlay components SHALL render within the AgentHub theme and layout context unless a documented exception is required.

#### Scenario: Dialog opens from the workbench
- **WHEN** a dialog, menu, popover, tooltip, or select overlay opens from a workbench surface
- **THEN** it inherits AgentHub theme variables, typography, focus treatment, z-index rules, and compact density without leaking browser-body or vendor default styling

#### Scenario: Overlay closes
- **WHEN** a user closes an overlay with Escape, outside click where appropriate, a close button, or completion action
- **THEN** focus returns to the initiating control or another documented workbench-safe target

### Requirement: Component dependency guard
The Desktop/Web UI SHALL prevent reintroduction of Ant Design runtime dependencies and direct imports.

#### Scenario: Dependency graph is checked
- **WHEN** the UI package dependencies are reviewed or tests run
- **THEN** `antd`, `@ant-design/icons`, and `@ant-design/x` are absent from the `@agenthub/ui` runtime dependency graph

#### Scenario: Source imports are checked
- **WHEN** the UI source is scanned
- **THEN** feature and component code do not import from `antd`, `@ant-design/icons`, `@ant-design/x`, or AntD subpaths

### Requirement: Component verification
AgentHub components SHALL have tests or rendered checks for representative states and critical workflows.

#### Scenario: Component system is ready for review
- **WHEN** the AntD replacement implementation is considered complete
- **THEN** verification covers component variants, disabled states, focus labels, overlay behavior, form field validation, theme switching, localization, and representative Agents, Settings, Composer, and Chat Info workflows


## ADDED Requirements

### Requirement: Ant Design token mapping
The Desktop/Web visual system SHALL map AgentHub semantic tokens into Ant Design theme tokens while retaining the AgentHub workbench visual language.

#### Scenario: Ant Design control renders in the workbench
- **WHEN** a migrated Ant Design-backed control renders in a workbench panel
- **THEN** it uses AgentHub semantic colors, compact spacing, focus styles, border treatment, typography, and status colors rather than unmodified Ant Design defaults

#### Scenario: Theme changes at runtime
- **WHEN** the user switches between light and dark themes
- **THEN** both custom AgentHub surfaces and Ant Design-backed controls update consistently from the same theme state

### Requirement: Ant Design density constraints
The Desktop/Web visual system SHALL constrain Ant Design-backed components to compact developer-workbench density.

#### Scenario: Form controls render in an editor panel
- **WHEN** Agent, Connections, or Settings forms render with Ant Design-backed controls
- **THEN** row height, labels, validation messages, spacing, and action placement remain compact enough for repeated desktop workflows

#### Scenario: List rows render in side panels
- **WHEN** conversation, agent, provider, or settings rows use Ant Design-backed list, avatar, badge, or empty-state primitives
- **THEN** rows remain dense, aligned with the existing sidebar width rules, and free of oversized card-grid styling

### Requirement: Vendor styling isolation
The Desktop/Web visual system SHALL isolate vendor component styling behind AgentHub wrappers and theme configuration.

#### Scenario: Feature component uses a common control
- **WHEN** a feature component needs an Ant Design-backed control
- **THEN** it applies AgentHub wrapper classes and props rather than patching Ant Design internals with feature-specific global selectors

#### Scenario: Ant Design component markup changes
- **WHEN** Ant Design updates internal DOM or class names
- **THEN** AgentHub feature components remain protected by wrapper-level tests and avoid relying on internal Ant Design selectors

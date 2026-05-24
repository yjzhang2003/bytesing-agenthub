## ADDED Requirements

### Requirement: First-party component token application
The Desktop/Web visual system SHALL apply AgentHub semantic tokens directly to AgentHub-owned components.

#### Scenario: AgentHub control renders in the workbench
- **WHEN** a button, input, select, dialog, badge, avatar, tooltip, or feedback control renders in a workbench panel
- **THEN** it uses AgentHub semantic colors, compact spacing, focus styles, border treatment, typography, and status colors without relying on vendor theme defaults

#### Scenario: Theme changes at runtime
- **WHEN** the user switches between light and dark themes
- **THEN** all AgentHub-owned components update consistently from the same semantic token set

### Requirement: Component density constraints
The Desktop/Web visual system SHALL constrain AgentHub-owned components to compact developer-workbench density.

#### Scenario: Form controls render in an editor panel
- **WHEN** Agent, Connections, or Settings forms render with AgentHub-owned controls
- **THEN** row height, labels, validation messages, spacing, and action placement remain compact enough for repeated desktop workflows

#### Scenario: List rows render in side panels
- **WHEN** conversation, agent, provider, or settings rows use AgentHub-owned list, avatar, badge, or empty-state components
- **THEN** rows remain dense, aligned with existing sidebar width rules, and free of oversized card-grid styling

### Requirement: Component styling isolation
The Desktop/Web visual system SHALL isolate component styling through AgentHub-owned classes, CSS variables, and state attributes.

#### Scenario: Feature component uses a common control
- **WHEN** a feature component needs a common control
- **THEN** it uses AgentHub component props and stable AgentHub classes rather than patching third-party internal selectors

#### Scenario: Component markup changes
- **WHEN** an AgentHub component changes its internal markup
- **THEN** feature surfaces remain protected by component-level tests and documented state contracts

### Requirement: Localized AgentHub components
AgentHub-owned controls SHALL support localized labels, placeholders, validation messages, and option text through AgentHub component props or feature-owned i18n.

#### Scenario: Settings language control renders
- **WHEN** Settings renders the language preference with AgentHub-owned controls
- **THEN** the control uses AgentHub semantic styling, compact density, localized option labels, and accessible names

#### Scenario: Form validation renders in Chinese
- **WHEN** a product-owned validation message appears while Simplified Chinese is selected
- **THEN** the message uses Simplified Chinese and retains the same compact spacing and error styling as English

## REMOVED Requirements

### Requirement: Ant Design token mapping
**Reason**: AgentHub will no longer map semantic tokens into Ant Design theme tokens.
**Migration**: Apply semantic tokens directly to AgentHub-owned components.

### Requirement: Ant Design density constraints
**Reason**: Density rules must apply to AgentHub-owned components rather than Ant Design-backed components.
**Migration**: Use `Component density constraints`.

### Requirement: Vendor styling isolation
**Reason**: The visual system should not depend on a styled vendor component framework whose internals need isolation.
**Migration**: Use `Component styling isolation` and disallow styled vendor direct imports.

### Requirement: Localized Ant Design wrappers
**Reason**: Localized component behavior must live in AgentHub-owned controls rather than AntD wrappers.
**Migration**: Use `Localized AgentHub components`.

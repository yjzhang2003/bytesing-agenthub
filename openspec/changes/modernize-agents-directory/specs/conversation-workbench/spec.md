## ADDED Requirements

### Requirement: Modern Agents directory surface
The Desktop/Web Agents center view SHALL present agents through a compact side-list and a contact-style configuration detail that prioritizes readable identity, role, responsibilities, and capabilities over raw technical configuration.

#### Scenario: User opens an existing agent
- **WHEN** the user selects an agent from the Agents side-list
- **THEN** the detail surface displays the agent name, role, provider, responsibility summary, capability tags, and configuration summary before any raw advanced fields

#### Scenario: User changes agent configuration
- **WHEN** the user edits agent configuration fields
- **THEN** the page provides one primary save action for committing the changes through the existing update workflow

#### Scenario: User views default agent status
- **WHEN** the selected agent is a default agent
- **THEN** the detail surface shows default-agent status without making destructive management actions the primary focus

### Requirement: Template-assisted single-interface agent creation
The Desktop/Web Agents center view SHALL support template-assisted agent creation inside one create interface, without navigating to a separate template selection page.

#### Scenario: User starts creating an agent
- **WHEN** the user activates the Agents sidebar create affordance
- **THEN** the detail surface switches to a single create interface that includes compact template presets and editable basic fields

#### Scenario: User chooses a template preset
- **WHEN** the user selects a template preset in the create interface
- **THEN** the interface populates friendly defaults for role, responsibility, capability tags, system prompt, and policy while keeping the user on the same screen

#### Scenario: User creates from customized defaults
- **WHEN** the user saves a new agent after selecting or modifying a template preset
- **THEN** the page creates the agent through the existing create workflow using the selected and edited values

### Requirement: Agents advanced configuration disclosure
The Desktop/Web Agents center view SHALL place raw system prompt and policy JSON controls in an advanced configuration section that is collapsed by default.

#### Scenario: User opens a standard agent configuration
- **WHEN** the Agents detail surface renders for an existing agent or create flow
- **THEN** raw system prompt and policy JSON controls are hidden behind a collapsed advanced configuration disclosure by default

#### Scenario: Advanced configuration has validation errors
- **WHEN** an advanced configuration field contains invalid data during save
- **THEN** the page shows the validation error and makes the affected advanced section discoverable

#### Scenario: Power user edits advanced configuration
- **WHEN** the user expands advanced configuration
- **THEN** the page exposes raw system prompt and policy JSON controls without replacing the basic configuration fields

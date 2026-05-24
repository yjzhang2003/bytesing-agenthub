## ADDED Requirements

### Requirement: MVP first-party component verification
The Desktop/Web MVP implementation SHALL verify that critical workbench surfaces use AgentHub-owned controls without AntD visual leakage.

#### Scenario: Component replacement is ready for review
- **WHEN** the AntD replacement implementation is considered complete
- **THEN** verification covers online workbench, chat information dialog, composer, Agents editor, Connections status, Settings preferences, narrow layout, Simplified Chinese rendering, and dark/light theme states using AgentHub-owned controls

#### Scenario: Vendor styling scan runs
- **WHEN** MVP verification runs
- **THEN** source and rendered output checks confirm there are no AntD runtime imports, `.ant-*` style dependencies, `agenthub-antd-*` classes, or Ant Design primary-color leakage

### Requirement: MVP component standard coverage
The Desktop/Web MVP implementation SHALL include a usable component standard for current workbench development.

#### Scenario: Developer reviews component rules
- **WHEN** a developer needs to add or modify a workbench control
- **THEN** the repository documents AgentHub component variants, sizes, states, token usage, overlay rules, localization expectations, and examples for current MVP surfaces

#### Scenario: Existing MVP surface uses a common control
- **WHEN** Composer, Agents, Connections, Settings, Context Inspector, or Chat Info uses a common control
- **THEN** it uses the documented AgentHub component API rather than local ad hoc markup or a styled vendor component

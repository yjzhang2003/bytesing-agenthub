# component-behavior-verification Specification

## Purpose
TBD - created by archiving change harden-agenthub-component-contracts. Update Purpose after archive.
## Requirements
### Requirement: Component behavior tests
AgentHub component-system verification SHALL cover runtime interaction behavior for behavior-heavy components.

#### Scenario: Dialog behavior is tested
- **WHEN** component behavior tests run
- **THEN** tests verify Dialog initial focus, focus trap, Escape close, close/cancel/confirm actions, focus return, title/description labelling, and themed overlay rendering

#### Scenario: Menu and tooltip behavior is tested
- **WHEN** component behavior tests run
- **THEN** tests verify DropdownMenu keyboard navigation, disabled item behavior, Escape close, focus return, and Tooltip accessible content rendering

#### Scenario: Form control behavior is tested
- **WHEN** component behavior tests run
- **THEN** tests verify Switch keyboard toggle and accessible name, Select value changes, SearchInput clear behavior, TextArea ref behavior, invalid state attributes, and disabled state behavior

#### Scenario: Feedback behavior is tested
- **WHEN** component behavior tests run
- **THEN** tests verify Toast live-region rendering, tone, dismiss behavior, duration behavior where deterministic, and localized LoadingState labels

### Requirement: Component-system root verification
AgentHub component-system verification SHALL prove canonical components render correctly outside the full workbench shell.

#### Scenario: ThemeRoot renders isolated components
- **WHEN** tests render canonical components under `ThemeRoot` without `AgentHubWorkbench`
- **THEN** the rendered output includes AgentHub component CSS, semantic theme variables, focus styles, and no dependency on workbench-only layout containers

#### Scenario: ThemeRoot changes theme
- **WHEN** tests change `ThemeRoot` mode from light to dark
- **THEN** component variables and state styling update without remounting child state unnecessarily

### Requirement: Vendor guardrail negative tests
AgentHub verification SHALL include intentional failure cases for vendor-boundary guardrails.

#### Scenario: Guardrail fixture includes forbidden import
- **WHEN** the guardrail runs against a fixture containing an AntD import
- **THEN** the guardrail fails and reports the forbidden import path

#### Scenario: Guardrail fixture includes forbidden class string
- **WHEN** the guardrail runs against a fixture containing `className` or string usage of an AntD class
- **THEN** the guardrail fails and reports the forbidden class usage

#### Scenario: Guardrail fixture includes forbidden dependency
- **WHEN** the guardrail runs against a fixture containing an AntD package dependency or lockfile entry
- **THEN** the guardrail fails and reports the forbidden dependency source

### Requirement: Localized component behavior verification
AgentHub component-system verification SHALL prove behavior-heavy components expose localized visible and accessible states in English and Simplified Chinese.

#### Scenario: Form controls expose localized state
- **WHEN** component behavior tests render Switch, Select, SearchInput, TextArea, and validation states in English and Simplified Chinese
- **THEN** the tests verify localized labels, placeholders, helper text, invalid-state descriptions, disabled-state descriptions, and accessible names without changing the control behavior

#### Scenario: Feedback components expose localized live regions
- **WHEN** component behavior tests render Toast, LoadingState, empty-state, and error-state primitives in English and Simplified Chinese
- **THEN** the tests verify localized visible text, live-region text, dismiss controls, and loading labels while preserving tone, duration, and dismiss behavior

#### Scenario: Overlay controls expose localized keyboard surfaces
- **WHEN** component behavior tests render Dialog, DropdownMenu, and Tooltip content in English and Simplified Chinese
- **THEN** the tests verify localized title, description, item text, tooltip text, accessible names, focus behavior, Escape handling, and focus return behavior


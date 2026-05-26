# agenthub-component-contract-hardening Specification

## Purpose
TBD - created by archiving change harden-agenthub-component-contracts. Update Purpose after archive.
## Requirements
### Requirement: Canonical component APIs
AgentHub component-system exports SHALL expose canonical product-owned APIs as the primary contract while legacy `AgentHub*` names remain compatibility adapters only where still needed.

#### Scenario: Developer imports a canonical component
- **WHEN** a developer imports `Button`, `Dialog`, `Tabs`, `Select`, `Switch`, `SearchInput`, `Tooltip`, `DropdownMenu`, `LoadingState`, or `Toast`
- **THEN** the component accepts the documented canonical props such as `variant`, `tone`, `size`, `density`, `ariaLabel`, `value`, `onValueChange`, `open`, `onOpenChange`, `description`, `footer`, and `initialFocusRef` where applicable

#### Scenario: Legacy alias remains during migration
- **WHEN** existing workbench code imports an `AgentHub*` compatibility alias
- **THEN** the alias adapts legacy prop names to the canonical implementation without reintroducing third-party prop passthroughs

### Requirement: Self-contained ThemeRoot
The AgentHub component system SHALL provide styling and semantic variables when components render outside the full workbench shell.

#### Scenario: Isolated component renders under ThemeRoot
- **WHEN** `ThemeRoot` renders a Button, Select, Dialog, Switch, SearchInput, Tabs, Badge, Avatar, LoadingState, or Toast outside `AgentHubWorkbench`
- **THEN** the component has AgentHub theme variables, typography, control dimensions, focus styles, and state styling without requiring `WorkbenchStyle`

#### Scenario: Theme changes in isolated component tree
- **WHEN** an isolated `ThemeRoot` switches between light and dark modes
- **THEN** AgentHub-owned controls update from the same semantic token names used by the workbench

### Requirement: Production overlay behavior
AgentHub overlay components SHALL provide production-grade accessibility behavior while keeping AgentHub-owned styling.

#### Scenario: Dialog opens
- **WHEN** a Dialog opens from a workbench surface
- **THEN** focus moves into the dialog, background content is unavailable to keyboard and assistive technology users, the dialog is labelled by title and optional description, and the overlay inherits AgentHub theme variables

#### Scenario: Dialog closes
- **WHEN** a user closes Dialog with Escape, close button, outside interaction where allowed, cancel action, or completion action
- **THEN** focus returns to the initiating control or a documented safe fallback

#### Scenario: Dropdown menu opens
- **WHEN** a DropdownMenu opens
- **THEN** menu items support keyboard navigation, Escape close, disabled items, destructive tones, and focus return to the trigger

#### Scenario: Tooltip appears
- **WHEN** Tooltip content appears for an icon-only control
- **THEN** it uses AgentHub-owned styling, timing, accessible relationships, and theme variables rather than relying only on a native `title` attribute

### Requirement: Feedback and loading behavior
AgentHub feedback and loading components SHALL provide localized accessible runtime behavior.

#### Scenario: Toast appears
- **WHEN** a feature emits success, error, warning, or info feedback
- **THEN** Toast renders in an AgentHub-owned live region with tone, duration, dismiss behavior, localized copy, and no vendor message dependency

#### Scenario: Loading state renders
- **WHEN** LoadingState renders as spinner or skeleton
- **THEN** it exposes a localized accessible label and respects AgentHub density, theme, and reduced-motion expectations

### Requirement: Vendor boundary enforcement
AgentHub SHALL prevent styled vendor component leakage through dependencies, imports, lockfiles, resolved dependency graphs, CSS selectors, and class strings.

#### Scenario: Guardrail scans source
- **WHEN** the UI boundary check runs
- **THEN** it fails on forbidden AntD package imports, AntD subpath imports, `.ant-*` selectors, `agenthub-antd-*` selectors, and string/className usages of forbidden vendor classes

#### Scenario: Guardrail scans dependencies
- **WHEN** the UI boundary check runs
- **THEN** it fails if `antd`, `@ant-design/icons`, or `@ant-design/x` appears in `@agenthub/ui` package dependencies, lockfile entries, or the resolved dependency graph


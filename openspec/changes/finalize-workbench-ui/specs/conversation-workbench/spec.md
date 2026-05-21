## ADDED Requirements

### Requirement: Runtime-aware workbench actions
Desktop and Web workbenches SHALL clearly distinguish actions that remain available offline from actions that require an online Desktop Runtime.

#### Scenario: Runtime is offline
- **WHEN** the active conversation can normally start local execution but the Desktop Runtime is offline
- **THEN** the composer and execution controls are disabled with an explanation while conversation history, run history, and available metadata remain viewable

#### Scenario: Runtime returns online
- **WHEN** Control Plane publishes or snapshots an online runtime state
- **THEN** runtime-dependent actions become available without requiring the user to reload the app

### Requirement: Inspector-linked timeline selection
Desktop and Web workbenches SHALL link selected timeline items to Context Inspector detail modes.

#### Scenario: User selects a timeline item with detail
- **WHEN** the user selects a plan, permission, diff, artifact, run, or runtime-related item
- **THEN** the workbench records the selected item and renders the corresponding detail in the Context Inspector

#### Scenario: Selected detail becomes unavailable
- **WHEN** the selected item is no longer available in the latest snapshot
- **THEN** the workbench returns the Context Inspector to an empty or unavailable state without crashing

## ADDED Requirements

### Requirement: Connections management page
The Desktop/Web MVP workbench SHALL present Connections as a compact management page consistent with the Chat and Agents page style.

#### Scenario: User opens Connections
- **WHEN** the user opens Connections from the left navigation
- **THEN** the center workbench shows a connection list and selected connection detail surface using the same density, typography, and compact management-page structure as Chat and Agents

#### Scenario: User selects a connection
- **WHEN** the user selects Claude Code or another provider-level connection row
- **THEN** the detail surface displays that connection's status, last checked time, configuration values, failure reason when present, and available actions without navigating away from Connections

#### Scenario: Lower-level dependencies are hidden
- **WHEN** the Connections list is rendered
- **THEN** Desktop Runtime and agentmemory are not shown as selectable connection rows because they are lower-level dependencies
- **AND** their state may still be used to disable provider checks or explain why a provider cannot be checked

#### Scenario: Future provider is visible
- **WHEN** a future provider slot is shown in the connection list
- **THEN** the row is visually disabled, omitted from active checks, and explains that the provider is not configured yet

#### Scenario: Connections page renders narrowly
- **WHEN** the viewport cannot comfortably display the connection list and detail surface side by side
- **THEN** the Connections page stacks or collapses predictably while preserving connection selection, status detail, check actions, and readable localized text

### Requirement: Connections check actions
The Desktop/Web MVP workbench SHALL expose localized connection check actions and state feedback.

#### Scenario: Check action is available
- **WHEN** a selected connection can be actively checked
- **THEN** the detail surface exposes a localized Check connection action with an accessible name

#### Scenario: Check all is available
- **WHEN** one or more enabled checkable connections exist
- **THEN** the Connections page exposes a localized Check all action that requests checks for those connections

#### Scenario: Check action is unavailable
- **WHEN** the selected connection is disabled or requires an offline Desktop Runtime
- **THEN** the check action is disabled and the detail surface explains why in the selected product language

#### Scenario: Check completes with issue
- **WHEN** a fresh connection check reports missing, unavailable, or misconfigured
- **THEN** the detail surface displays the issue near the status and keeps the connection row scannable from the list

### Requirement: Connections visual verification
The Desktop/Web MVP implementation SHALL include rendered verification for Connections page states in English and Simplified Chinese.

#### Scenario: Connections implementation is ready for review
- **WHEN** the Connections implementation is considered complete
- **THEN** verification covers connected provider state, provider failure state, hidden Desktop Runtime and agentmemory dependencies, Desktop Runtime offline gating, checking state, future provider disabled state, narrow layout, and Simplified Chinese rendering

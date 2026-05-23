## MODIFIED Requirements

### Requirement: Desktop/Web MVP workbench shell
The system SHALL present the Desktop/Web MVP as a workspace-scoped three-column workbench at desktop widths and SHALL render product-owned shell text in the selected product language.

#### Scenario: User opens the Desktop/Web app with Control Plane online
- **WHEN** the app loads a workbench snapshot from Control Plane
- **THEN** the UI displays workspace navigation on the left, the active conversation timeline and composer in the center, and the Context Inspector on the right

#### Scenario: User opens the Desktop/Web app while snapshot data is loading
- **WHEN** the workbench snapshot request is in progress
- **THEN** the UI displays a bounded loading state in the selected product language without showing stale static demo data

#### Scenario: User opens the Desktop/Web app with Control Plane unavailable
- **WHEN** the Control Plane snapshot cannot be loaded
- **THEN** the UI displays a retryable connection error state in the selected product language as the primary workbench content

### Requirement: MVP left navigation
The Desktop/Web MVP workbench SHALL expose workspace context, runtime state, conversations, agents, runs, settings, pending permission access, and language-aware navigation labels from the left navigation.

#### Scenario: User scans workspace context
- **WHEN** the user views the left navigation
- **THEN** the UI shows the active workspace name, runtime availability, recent conversations, and entry points for Agents, Runs, and Settings using the selected product language for product chrome

#### Scenario: Runtime is offline
- **WHEN** the active workspace runtime is offline
- **THEN** the left navigation shows the offline state near the active workspace and keeps history/navigation available

#### Scenario: Pending permissions exist
- **WHEN** one or more permissions require a user decision
- **THEN** the left navigation exposes a visible pending permission affordance independent of the Context Inspector

### Requirement: MVP composer targeting
The Desktop/Web MVP composer SHALL make agent targeting explicit for Orchestrator and worker agents and SHALL localize product-owned composer affordances.

#### Scenario: User targets Orchestrator
- **WHEN** the user selects Orchestrator or coordinated execution in the composer
- **THEN** the composer indicates the message will start Plan Mode using the selected product language for product chrome

#### Scenario: User targets a worker agent
- **WHEN** the user selects a non-Orchestrator agent in the composer
- **THEN** the composer indicates the message will be routed directly to that agent using the selected product language for product chrome

#### Scenario: Runtime-dependent send is unavailable
- **WHEN** the selected action requires a runtime that is offline
- **THEN** the composer disables send and explains in the selected product language that the Desktop Runtime must be online

### Requirement: MVP Context Inspector modes
The Desktop/Web MVP Context Inspector SHALL support empty, plan, permission, diff, runtime, artifact, and run detail modes with product-owned labels and actions rendered in the selected product language.

#### Scenario: No detail is selected
- **WHEN** no timeline item or navigation item is selected for inspection
- **THEN** the inspector displays an empty state summarizing active workspace, runtime, and selected conversation context

#### Scenario: User opens plan detail
- **WHEN** the user selects a plan card
- **THEN** the inspector displays goal, assumptions, assigned agents, steps, risks, progress, and available plan actions using localized product labels while preserving plan content text

#### Scenario: User opens permission detail
- **WHEN** the user selects a pending permission
- **THEN** the inspector displays requesting agent, action type, action summary, workspace, risk level, related run or plan, and Allow once and Deny actions using localized product labels while preserving technical values

#### Scenario: User opens diff detail
- **WHEN** the user selects a diff card
- **THEN** the inspector displays changed files, insertions, deletions, status, metadata, stale/offline warnings, and an action to open full-screen review using localized product labels while preserving file paths and diff metadata

#### Scenario: User opens runtime detail
- **WHEN** the user selects runtime status
- **THEN** the inspector displays device identity, online state, heartbeat, capabilities, workspace binding, active runs, and offline/degraded explanations when applicable using the selected product language for product chrome

### Requirement: MVP visual verification
The Desktop/Web MVP implementation SHALL include rendered verification for the critical workbench states in English and Simplified Chinese.

#### Scenario: UI implementation is ready for review
- **WHEN** the MVP workbench UI is considered complete
- **THEN** verification covers online workbench, offline runtime, active multi-agent conversation, draft plan review, pending permission queue, inline permission card, diff review, full-screen diff review, empty conversation, error state, narrow layout, and Simplified Chinese language rendering

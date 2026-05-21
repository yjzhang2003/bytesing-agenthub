## ADDED Requirements

### Requirement: Desktop/Web MVP workbench shell
The system SHALL present the Desktop/Web MVP as a workspace-scoped three-column workbench at desktop widths.

#### Scenario: User opens the Desktop/Web app with Control Plane online
- **WHEN** the app loads a workbench snapshot from Control Plane
- **THEN** the UI displays workspace navigation on the left, the active conversation timeline and composer in the center, and the Context Inspector on the right

#### Scenario: User opens the Desktop/Web app while snapshot data is loading
- **WHEN** the workbench snapshot request is in progress
- **THEN** the UI displays a bounded loading state in the workbench shell without showing stale static demo data

#### Scenario: User opens the Desktop/Web app with Control Plane unavailable
- **WHEN** the Control Plane snapshot cannot be loaded
- **THEN** the UI displays a retryable connection error state as the primary workbench content

### Requirement: MVP left navigation
The Desktop/Web MVP workbench SHALL expose workspace context, runtime state, conversations, agents, runs, settings, and pending permission access from the left navigation.

#### Scenario: User scans workspace context
- **WHEN** the user views the left navigation
- **THEN** the UI shows the active workspace name, runtime availability, recent conversations, and entry points for Agents, Runs, and Settings

#### Scenario: Runtime is offline
- **WHEN** the active workspace runtime is offline
- **THEN** the left navigation shows the offline state near the active workspace and keeps history/navigation available

#### Scenario: Pending permissions exist
- **WHEN** one or more permissions require a user decision
- **THEN** the left navigation exposes a visible pending permission affordance independent of the Context Inspector

### Requirement: MVP timeline composition
The Desktop/Web MVP timeline SHALL display user messages, agent messages, Orchestrator messages, run events, plan cards, permission cards, diff cards, artifact cards, and final summaries in chronological context.

#### Scenario: Multi-agent local run is visible
- **WHEN** Control Plane provides messages and run events for the active conversation
- **THEN** the timeline groups related content while preserving participant identity, run state, and chronological order

#### Scenario: Selectable timeline card is opened
- **WHEN** the user selects a plan, permission, diff, artifact, runtime, or run card from the timeline
- **THEN** the Context Inspector opens the matching detail mode without removing the conversation timeline

#### Scenario: Conversation has no timeline items
- **WHEN** the active conversation has no messages or events
- **THEN** the timeline displays an empty state with the active workspace and runtime context still visible

### Requirement: MVP composer targeting
The Desktop/Web MVP composer SHALL make agent targeting explicit for Orchestrator and worker agents.

#### Scenario: User targets Orchestrator
- **WHEN** the user selects Orchestrator or coordinated execution in the composer
- **THEN** the composer indicates the message will start Plan Mode

#### Scenario: User targets a worker agent
- **WHEN** the user selects a non-Orchestrator agent in the composer
- **THEN** the composer indicates the message will be routed directly to that agent

#### Scenario: Runtime-dependent send is unavailable
- **WHEN** the selected action requires a runtime that is offline
- **THEN** the composer disables send and explains that the Desktop Runtime must be online

### Requirement: MVP Context Inspector modes
The Desktop/Web MVP Context Inspector SHALL support empty, plan, permission, diff, runtime, artifact, and run detail modes.

#### Scenario: No detail is selected
- **WHEN** no timeline item or navigation item is selected for inspection
- **THEN** the inspector displays an empty state summarizing active workspace, runtime, and selected conversation context

#### Scenario: User opens plan detail
- **WHEN** the user selects a plan card
- **THEN** the inspector displays goal, assumptions, assigned agents, steps, risks, progress, and available plan actions

#### Scenario: User opens permission detail
- **WHEN** the user selects a pending permission
- **THEN** the inspector displays requesting agent, action type, action summary, workspace, risk level, related run or plan, and Allow once and Deny actions

#### Scenario: User opens diff detail
- **WHEN** the user selects a diff card
- **THEN** the inspector displays changed files, insertions, deletions, status, metadata, stale/offline warnings, and an action to open full-screen review

#### Scenario: User opens runtime detail
- **WHEN** the user selects runtime status
- **THEN** the inspector displays device identity, online state, heartbeat, capabilities, workspace binding, active runs, and offline/degraded explanations when applicable

### Requirement: MVP responsive workbench
The Desktop/Web MVP workbench SHALL degrade predictably when horizontal space is limited.

#### Scenario: Viewport cannot support three columns
- **WHEN** the viewport width cannot comfortably display left navigation, timeline, and Context Inspector
- **THEN** the Context Inspector collapses into a drawer or detail route before the timeline becomes unusable

#### Scenario: Viewport is narrow
- **WHEN** the viewport width cannot comfortably display the left navigation and timeline together
- **THEN** the left navigation collapses into a drawer while preserving access to pending permissions and runtime status

### Requirement: MVP visual verification
The Desktop/Web MVP implementation SHALL include rendered verification for the critical workbench states.

#### Scenario: UI implementation is ready for review
- **WHEN** the MVP workbench UI is considered complete
- **THEN** verification covers online workbench, offline runtime, active multi-agent conversation, draft plan review, pending permission queue, inline permission card, diff review, full-screen diff review, empty conversation, error state, and narrow layout

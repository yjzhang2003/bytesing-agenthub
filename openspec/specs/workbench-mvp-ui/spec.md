## Purpose
Define the Desktop/Web MVP workbench UI, including shell layout, left navigation, timeline composition, composer targeting, Context Inspector modes, responsive behavior, and visual verification.
## Requirements
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

The Desktop/Web MVP Context Inspector SHALL support empty, chat information, plan, permission, diff, runtime, artifact, and run detail modes with product-owned labels and actions rendered in the selected product language.

#### Scenario: No detail is selected

- **WHEN** no timeline item or navigation item is selected for inspection
- **THEN** the inspector displays an empty state summarizing active workspace, runtime, and selected conversation context

#### Scenario: User opens chat detail

- **WHEN** the user activates the active chat title or header affordance
- **THEN** the inspector displays chat participants, agent membership actions, and basic chat information using localized product labels while preserving chat title and technical context values

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

### Requirement: MVP responsive workbench
The Desktop/Web MVP workbench SHALL degrade predictably when horizontal space is limited.

#### Scenario: Viewport cannot support three columns
- **WHEN** the viewport width cannot comfortably display left navigation, timeline, and Context Inspector
- **THEN** the Context Inspector collapses into a drawer or detail route before the timeline becomes unusable

#### Scenario: Viewport is narrow
- **WHEN** the viewport width cannot comfortably display the left navigation and timeline together
- **THEN** the left navigation collapses into a drawer while preserving access to pending permissions and runtime status

### Requirement: MVP visual verification
The Desktop/Web MVP implementation SHALL include rendered verification for the critical workbench states in English and Simplified Chinese.

#### Scenario: UI implementation is ready for review
- **WHEN** the MVP workbench UI is considered complete
- **THEN** verification covers online workbench, offline runtime, active multi-agent conversation, draft plan review, pending permission queue, inline permission card, diff review, full-screen diff review, empty conversation, error state, narrow layout, and Simplified Chinese language rendering

### Requirement: Modernized Agents verification
The Desktop/Web MVP implementation SHALL verify the modernized Agents page states, shared search rendering, template-assisted creation, advanced configuration disclosure, and localization.

#### Scenario: UI implementation is ready for Agents review
- **WHEN** the modernized Agents page implementation is considered complete
- **THEN** verification covers existing-agent detail, create interface, shared Agents search field, template preset selection, collapsed advanced configuration, save validation, and Simplified Chinese rendering

#### Scenario: Chat and Agents search fields are compared
- **WHEN** rendered verification captures the conversation sidebar and Agents sidebar
- **THEN** both search fields share the same compact visual structure and neither field appears split, doubled, or malformed

#### Scenario: Agents page renders in narrow layout
- **WHEN** the viewport cannot comfortably display the full Agents side-list and detail surface
- **THEN** the page preserves access to agent selection, create flow, advanced configuration, and save action without text overlap

### Requirement: IM-style chat participant management

The Desktop/Web MVP workbench SHALL expose compact participant management in the chat information inspector.

#### Scenario: Chat has participating agents

- **WHEN** the chat information inspector renders for a conversation with agent participants
- **THEN** the top area displays each participating agent with an avatar tile and display name without redundant microcopy, decorative borders, or unexplained secondary labels

#### Scenario: User adds an agent to the chat

- **WHEN** eligible agents exist outside the active chat and the user activates Add agent from chat information
- **THEN** the workbench exposes a localized agent picker and invokes the add-agent membership action without losing active conversation, inspector, or composer state

#### Scenario: User removes an agent from the chat

- **WHEN** the user activates Remove for a participating agent
- **THEN** the workbench invokes the remove-agent membership action for future chat membership while preserving historical messages and run events

### Requirement: Chat information responsive behavior

The chat information inspector SHALL remain readable in wide, standard, narrow, and mobile-web layouts.

#### Scenario: Wide layout shows chat info in right inspector

- **WHEN** the workbench is in wide layout and the user opens chat information
- **THEN** the chat information surface renders in the right Context Inspector alongside the active timeline

#### Scenario: Narrow layout shows chat info in inspector drawer

- **WHEN** the workbench is in narrow or mobile-web layout and the user opens chat information
- **THEN** the chat information surface renders in the existing inspector drawer or detail route without covering required navigation back to the timeline

#### Scenario: Inspector drawer animates into view

- **WHEN** the chat information drawer opens or closes in narrow or mobile-web layout
- **THEN** the drawer content keeps stable dimensions during the motion and does not continuously reflow to fit the visible portion of the drawer

### Requirement: Workbench chrome avoids redundant microcopy

The Desktop/Web MVP workbench SHALL avoid extra secondary labels, counts, helper text, or controls that do not directly support the current task.

#### Scenario: Chat information uses compact participant tiles

- **WHEN** the chat information inspector renders participating agents
- **THEN** each participant tile shows only the identity needed to recognize the agent, and omits role subtitles, participant-count captions, and remove controls unless the user explicitly enters a membership editing mode

#### Scenario: Chat information header renders

- **WHEN** the chat information inspector is selected
- **THEN** the inspector header omits a Clear action because the close/collapse affordance already exits the side panel context


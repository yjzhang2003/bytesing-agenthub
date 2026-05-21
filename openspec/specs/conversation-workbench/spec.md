## Purpose
Define the Desktop and Web conversation workbench structure, runtime-backed snapshot behavior, timeline composition, composer targeting, and Context Inspector interaction model.

## Requirements

### Requirement: Desktop Web three-column workbench
Desktop and Web clients SHALL use a three-column workbench layout by default.

#### Scenario: User opens a conversation on desktop width
- **WHEN** the viewport has desktop-width space
- **THEN** the client displays workspace navigation on the left, conversation timeline in the center, and Context Inspector on the right

### Requirement: Left navigation content
The left navigation SHALL contain workspace switching, runtime status, conversation list, agent list entry point, run history entry point, and settings entry point.

#### Scenario: User scans the left navigation
- **WHEN** the user views the left navigation
- **THEN** the user can identify the active workspace, runtime availability, recent conversations, and where to manage agents or runs

### Requirement: Conversation timeline
The conversation timeline SHALL display user messages, agent messages, Orchestrator messages, run events, compact plan cards, compact permission cards, and compact artifact cards in chronological context.

#### Scenario: Multi-agent task runs
- **WHEN** Orchestrator dispatches tasks to worker agents
- **THEN** the timeline shows the plan summary, each agent's visible progress, relevant run events, artifacts, and final summary in order

### Requirement: Agent mention composer
The composer SHALL support addressing specific agents and Orchestrator through mentions or equivalent explicit target selection.

#### Scenario: User targets Orchestrator
- **WHEN** the user mentions Orchestrator or selects coordinated execution
- **THEN** the composer makes it clear the message will start Plan Mode instead of direct worker-agent chat

#### Scenario: User targets a worker agent
- **WHEN** the user mentions a non-Orchestrator agent
- **THEN** the composer makes it clear the message will route to that agent without implicit Orchestrator dispatch

### Requirement: Context Inspector
The workbench SHALL use the right Context Inspector as the default detail surface for selected plans, permissions, diffs, artifacts, and runtime details.

#### Scenario: User selects a plan card
- **WHEN** the user selects a plan card in the timeline
- **THEN** the Context Inspector displays the full plan, plan state, assigned agents, risk notes, and available actions

### Requirement: Responsive workbench behavior
The workbench SHALL degrade predictably when horizontal space is limited.

#### Scenario: Viewport becomes narrow
- **WHEN** Desktop or Web horizontal space cannot support three columns
- **THEN** the Context Inspector collapses into a drawer or detail route before the conversation timeline becomes unusable

### Requirement: Control Plane-backed workbench snapshot
Desktop and Web workbenches SHALL load their primary workspace, conversation, runtime status, and timeline snapshot from Control Plane in runnable local development.

#### Scenario: Client opens with Control Plane online
- **WHEN** Web or Desktop opens and Control Plane is reachable
- **THEN** the workbench displays the Control Plane-provided workspace, conversation timeline, runtime status, and available actions

#### Scenario: Client opens with Control Plane offline
- **WHEN** Web or Desktop opens and Control Plane is unreachable
- **THEN** the workbench displays a connection error state with retry affordance instead of silently showing stale static demo data

### Requirement: Workbench runtime state updates
Desktop and Web workbenches SHALL reflect runtime online, offline, and heartbeat changes from Control Plane.

#### Scenario: Runtime comes online
- **WHEN** Control Plane publishes a runtime online event
- **THEN** Web and Desktop update the runtime status area without requiring a full page reload

#### Scenario: Runtime goes offline
- **WHEN** Control Plane publishes a runtime offline event
- **THEN** Web and Desktop disable run-start actions that require that runtime and show the offline state in the workbench

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

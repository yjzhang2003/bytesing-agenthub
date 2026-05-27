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

The Desktop/Web MVP Context Inspector SHALL support empty, chat information, collaboration agent status, plan, permission, diff, runtime, artifact, and run detail modes with product-owned labels and actions rendered in the selected product language.

#### Scenario: No detail is selected

- **WHEN** no timeline item or navigation item is selected for inspection
- **THEN** the inspector displays an empty state summarizing active workspace, runtime, selected conversation context, and compact collaboration availability when present

#### Scenario: User opens chat detail

- **WHEN** the user activates the active chat title or header affordance
- **THEN** the inspector displays chat participants, agent membership actions, and basic chat information using localized product labels while preserving chat title and technical context values

#### Scenario: User opens collaboration agent status

- **WHEN** the active conversation has collaboration status and the user opens the agent status view
- **THEN** the inspector displays each participating agent's identity, availability, current task, blocked user question state, and linked OpenSpec change summary without replacing the conversation timeline

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
- **THEN** verification covers online workbench, offline runtime, active multi-agent conversation, draft plan review, pending permission queue, inline permission card, diff review, full-screen diff review, empty conversation, error state, Settings desktop and narrow layouts, and Simplified Chinese language rendering

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

The Desktop/Web MVP workbench SHALL expose compact participant management and participant detail entry points in the chat information inspector.

#### Scenario: Chat has participating agents

- **WHEN** the chat information inspector renders for a conversation with agent participants
- **THEN** the top area displays each participating agent with an avatar tile and display name without redundant microcopy, decorative borders, or unexplained secondary labels

#### Scenario: User opens participant settings

- **WHEN** the user activates a participating agent tile in chat information
- **THEN** the right Context Inspector switches to that agent's settings for the current conversation using the same visual layout language as conversation detail

#### Scenario: User adds agents to the chat

- **WHEN** eligible agents exist outside the active chat and the user activates Add agent from chat information
- **THEN** the workbench exposes a localized searchable multi-select agent picker with eligible agents only and invokes the add-agent membership action for each confirmed selected agent without losing active conversation, inspector, or composer state

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

### Requirement: MVP agent new conversation flow

The Desktop/Web MVP workbench SHALL verify that a user can create a new single-agent conversation from the Agents detail surface and continue in the Chat view with an explicit project binding.

#### Scenario: Agent detail creates new conversation
- **WHEN** the user opens an existing runnable agent in the Agents center view and activates "新对话"
- **THEN** the UI asks for or reuses an explicit project binding, switches to Chat, selects a newly created single-agent conversation, and leaves any older conversations with the same agent available in the conversation list

#### Scenario: User continues previous agent conversation from Chat
- **WHEN** the user wants to continue an older conversation with the same agent
- **THEN** the UI keeps that selection path in Chat search or the conversation list rather than on the Agent detail surface

#### Scenario: New conversation first message is composed
- **WHEN** the new single-agent conversation is selected after creation from Agent detail
- **THEN** the composer displays localized product chrome, targets the selected agent, shows the selected project context, and allows the user to send a prompt when runtime state permits

#### Scenario: New conversation appears in chat information
- **WHEN** the user opens chat information for the direct single-agent conversation
- **THEN** the inspector shows the single participating agent, selected project binding, and basic chat information without group-only participant copy

### Requirement: MVP agent conversation visual verification

The Desktop/Web MVP implementation SHALL include rendered verification for the agent conversation and project-bound creation flow.

#### Scenario: Agent conversation flow is ready for review
- **WHEN** the agent conversation implementation is considered complete
- **THEN** verification covers the Agent detail "新对话" action, Chat sidebar new-conversation action, agent picker selection, project picker existing/default/directory states, Chat view selection after activation, composer target state, visible project context, same-agent new conversation creation, prior same-agent conversation discovery from Chat, runtime-offline disabled state, and Simplified Chinese rendering

### Requirement: Add-agent picker search and selection

The Desktop/Web MVP workbench SHALL allow users to find and select multiple eligible agents before confirming chat membership changes.

#### Scenario: User searches eligible agents

- **WHEN** the add-agent picker is open and the user enters a search query
- **THEN** the picker filters eligible agents by display name while preserving any selected agents that still match the eligible set

#### Scenario: User selects multiple agents

- **WHEN** the add-agent picker is open and the user toggles more than one eligible agent row
- **THEN** each toggled row exposes a selected state and the confirmation action remains enabled for the selected set

#### Scenario: User confirms selected agents

- **WHEN** the user confirms the add-agent picker with one or more selected agents
- **THEN** the workbench requests membership additions for all selected agents and closes the picker only after the confirmation action has been invoked

#### Scenario: No eligible agents exist

- **WHEN** the add-agent picker opens with no eligible agents outside the active chat
- **THEN** the picker displays a localized empty state and disables confirmation

#### Scenario: Search has no matches

- **WHEN** the add-agent picker search query matches no eligible agents
- **THEN** the picker displays a localized no-results state without clearing the search query or existing selected state

#### Scenario: Keyboard user manages selection

- **WHEN** the add-agent picker has focus
- **THEN** keyboard navigation reaches search, each visible agent option, cancel, and confirm controls with visible focus and accessible selected state

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

### Requirement: Agent-in-chat inspector visual consistency
The Desktop/Web MVP Context Inspector SHALL render the agent-in-chat settings surface with the same layout language as the existing conversation detail surface.

#### Scenario: Agent-in-chat inspector renders
- **WHEN** the user opens a participating agent's settings from the active conversation
- **THEN** the inspector uses the same right-sidebar body, section spacing, compact rows, avatar treatment, input controls, switch controls, and action density as the conversation detail surface

#### Scenario: Agent-in-chat inspector shows editable scoped settings
- **WHEN** the selected conversation-agent membership is editable
- **THEN** editable scoped settings render as compact conversation-detail-style rows rather than as a separate full-page agent editor or nested card layout

#### Scenario: Agent-in-chat inspector shows global defaults
- **WHEN** global agent defaults are displayed inside the agent-in-chat inspector
- **THEN** they render as read-only summary rows with a clear global-settings entry point and do not appear editable in the conversation-scoped surface

### Requirement: Composer avoids routine effort controls
The Desktop/Web MVP composer SHALL keep routine chat input focused on message composition, targeting, and required execution gating rather than low-level runtime effort tuning.

#### Scenario: Claude Code-backed agent is selected
- **WHEN** the composer targets a Claude Code-backed agent
- **THEN** the normal composer does not render the Low, Medium, High, or XHigh effort selector

#### Scenario: Run uses configured effort defaults
- **WHEN** a run starts without a composer effort override
- **THEN** the system uses the applicable agent default, conversation-scoped policy, or provider default for effort where supported

#### Scenario: User needs technical run settings
- **WHEN** the user needs to inspect or tune technical runtime settings
- **THEN** the UI directs them to agent defaults, conversation-scoped settings where applicable, run detail, or advanced configuration rather than the normal chat input chrome

### Requirement: Desktop capability-gated project actions
The Desktop/Web MVP workbench SHALL show local project creation actions only when the active client reports matching Desktop capabilities.

#### Scenario: Desktop supports local project creation
- **WHEN** the new conversation project picker is opened in Desktop and capability discovery reports local-directory and default-project capabilities
- **THEN** the picker exposes the New from folder and New default project actions using the same compact modal layout as existing project selection

#### Scenario: Desktop bridge is unavailable
- **WHEN** the new conversation project picker is opened in Desktop but the capability bridge is unavailable or degraded
- **THEN** the picker does not expose broken native actions and provides a concise localized unavailable state or diagnostic affordance

#### Scenario: Web opens project picker
- **WHEN** the new conversation project picker is opened in a normal browser
- **THEN** the picker lists existing projects only and does not show local directory or default-directory actions

#### Scenario: Native project is selected
- **WHEN** a Desktop user completes New from folder or New default project during conversation creation
- **THEN** the selected project appears in the picker, can be confirmed for the conversation, and displays name, path label, runtime status, and repository branch when available

### Requirement: MVP component behavior verification
The Desktop/Web MVP implementation SHALL verify behavior for workbench surfaces that depend on AgentHub-owned component contracts.

#### Scenario: Chat information dialog behavior is ready for review
- **WHEN** the Chat Info add-agent dialog implementation is considered ready
- **THEN** verification covers opening the dialog from participant management, initial focus, focus containment, Escape close, cancel/confirm actions, focus return, localized labels, and no access to background workbench controls while the dialog is open

#### Scenario: Settings control behavior is ready for review
- **WHEN** Settings implementation is considered ready
- **THEN** verification covers localized accessible names and keyboard operation for theme and Enter-to-send switches

#### Scenario: Search control behavior is ready for review
- **WHEN** sidebar search controls are considered ready
- **THEN** verification covers localized accessible names, text entry, clear affordance behavior, disabled behavior where applicable, and compact visual consistency across Chat and Agents sidebars

#### Scenario: Component feedback behavior is ready for review
- **WHEN** workbench feedback or loading states are considered ready
- **THEN** verification covers localized loading labels, Toast live-region behavior, feedback tone rendering, and dark/light theme rendering

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

### Requirement: Collaboration status sidebar
The Desktop/Web MVP workbench SHALL show collaboration status in the right sidebar without introducing a new full-screen team dashboard.

#### Scenario: Agents are working in the active conversation
- **WHEN** collaboration status reports one or more participating agents with active, idle, blocked, completed, or failed work states
- **THEN** the right sidebar displays those states in a compact list that preserves the active conversation timeline and composer

#### Scenario: User input is blocking an agent
- **WHEN** collaboration status includes unresolved user questions
- **THEN** the right sidebar shows the affected agent and question status with an affordance to open or answer the question

#### Scenario: OpenSpec change is linked
- **WHEN** collaboration status includes an OpenSpec change link
- **THEN** the right sidebar shows the change name and summarized progress without rendering raw OpenSpec file contents by default

### Requirement: Chat sidebar conversation creation
The Desktop/Web MVP workbench SHALL provide a compact new-conversation action next to the Chat sidebar search field.

#### Scenario: User scans chat sidebar controls
- **WHEN** the Chat sidebar renders the conversation search field
- **THEN** a localized new-conversation icon button appears adjacent to the search field using the same compact toolbar alignment language

#### Scenario: User starts new conversation from Chat
- **WHEN** the user activates the Chat sidebar new-conversation action
- **THEN** the workbench opens the conversation creation flow without leaving the Chat surface or clearing the current conversation selection until creation is confirmed

#### Scenario: Runtime cannot support new local project
- **WHEN** no Desktop Runtime is available for local directory selection
- **THEN** the new conversation flow keeps existing project selection available and disables Desktop-only local project creation with a localized explanation

### Requirement: Conversation creation agent picker
The Desktop/Web MVP workbench SHALL reuse the add-agent picker visual and interaction pattern when selecting agents for a new conversation.

#### Scenario: User selects agents for new conversation
- **WHEN** the new conversation flow asks for participants
- **THEN** it renders searchable selectable agent rows consistent with the existing add-agent picker and supports selecting one or more eligible agents

#### Scenario: User creates single-agent conversation
- **WHEN** the user confirms exactly one selected agent and a project
- **THEN** the workbench creates a direct single-agent conversation and targets that agent in the composer

#### Scenario: User creates group conversation
- **WHEN** the user confirms multiple selected agents and a project
- **THEN** the workbench creates a group conversation with those agents as participants

### Requirement: Conversation creation project picker
The Desktop/Web MVP workbench SHALL require a project selection step before confirming a new local-agent conversation.

#### Scenario: User selects existing project
- **WHEN** the project picker opens and existing projects are available
- **THEN** the picker lists recent and available projects with display name, path label, runtime availability, and repository branch where available

#### Scenario: User chooses local directory
- **WHEN** the user activates the local directory option
- **THEN** the Desktop client opens a directory picker and Web or iOS do not expose the action except as disabled guidance to open Desktop

#### Scenario: User chooses default project
- **WHEN** a Desktop user selects the AgentHub-managed default project option
- **THEN** the UI clearly labels the project as an AgentHub-created directory rather than silently inheriting the process working directory

#### Scenario: Remote user creates conversation
- **WHEN** Web or iOS opens the project picker
- **THEN** the picker lists existing Desktop-registered projects and does not allow creating a local directory or AgentHub default directory from the remote client

#### Scenario: User confirms project and agents
- **WHEN** the user confirms the creation flow with at least one agent and a valid project selection
- **THEN** the workbench creates the conversation, selects it in Chat, shows the project context, and prepares the composer without starting an agent run automatically

### Requirement: Conversation project context indicator
The Desktop/Web MVP workbench SHALL show the active conversation's project binding in the normal Chat context.

#### Scenario: Project-bound conversation is active
- **WHEN** the active conversation has a project binding
- **THEN** the center header or adjacent context area shows a compact project indicator with project name and repository branch when available

#### Scenario: User opens project context
- **WHEN** the user activates the project indicator
- **THEN** the workbench exposes the full path label, runtime availability, sandbox/profile label when available, and an entry point to conversation details

#### Scenario: Conversation has no project binding
- **WHEN** the active conversation lacks an explicit project binding
- **THEN** the UI shows a clear unbound state and prompts project selection before local execution can start


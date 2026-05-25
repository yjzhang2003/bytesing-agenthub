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
The composer SHALL support targeted messages to runnable agent roles.

#### Scenario: User-created role appears as target
- **WHEN** the snapshot includes a user-created non-archived agent role
- **THEN** the composer can target that role and run creation uses that role id

### Requirement: Context Inspector
The workbench SHALL use the right Context Inspector as the default detail surface for selected chats, participating agents, plans, permissions, diffs, artifacts, and runtime details.

#### Scenario: User selects a plan card
- **WHEN** the user selects a plan card in the timeline
- **THEN** the Context Inspector displays the full plan, plan state, assigned agents, risk notes, and available actions

#### Scenario: User opens chat information from the title
- **WHEN** the user activates the active chat title
- **THEN** the Context Inspector displays the active chat information surface without replacing the conversation timeline

#### Scenario: User opens agent settings from an agent identity
- **WHEN** the user activates an agent avatar or name in the active conversation timeline or chat information participant area
- **THEN** the Context Inspector displays that agent's settings for the current conversation without navigating to the global Agents page

#### Scenario: User returns from chat information to timeline context
- **WHEN** the chat information surface is open and the user selects a timeline item with detail
- **THEN** the Context Inspector switches to the selected item detail while preserving the active chat and composer state

### Requirement: Responsive workbench behavior
The workbench SHALL degrade predictably when horizontal space is limited.

#### Scenario: Viewport becomes narrow
- **WHEN** Desktop or Web horizontal space cannot support three columns
- **THEN** the Context Inspector collapses into a drawer or detail route before the conversation timeline becomes unusable

### Requirement: Control Plane-backed workbench snapshot
Desktop and Web workbenches SHALL load their primary workspace, conversation, runtime status, and timeline snapshot from Control Plane in runnable local development.

#### Scenario: Snapshot includes connection and memory status
- **WHEN** the workbench loads a Control Plane snapshot
- **THEN** it can display local Claude Code provider health, agentmemory health, and available agent roles without a separate reload

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

### Requirement: Ant Design-backed workbench controls
The conversation workbench SHALL use Ant Design-backed AgentHub wrappers for common controls while preserving existing conversation, agent, runtime, and inspector behavior.

#### Scenario: User opens the migrated workbench
- **WHEN** Desktop or Web renders the migrated workbench
- **THEN** buttons, text inputs, selects, tooltips, dropdowns, badges, avatars, empty states, loading indicators, and feedback controls use shared AgentHub wrappers where suitable

#### Scenario: User navigates primary workbench surfaces
- **WHEN** the user switches between conversation, Agents, Connections, Settings, run history, or inspector detail surfaces
- **THEN** the existing center-view state model, active workspace context, active conversation context, and runtime state remain intact

### Requirement: Composer compatibility during migration
The composer SHALL preserve agent targeting and runtime-disabled behavior when migrated to Ant Design-backed controls.

#### Scenario: User targets an agent
- **WHEN** the user selects or mentions an agent in the migrated composer
- **THEN** the composer submits the same selected agent id, prompt text, and run creation callback behavior as before migration

#### Scenario: Runtime is unavailable
- **WHEN** the runtime is offline or provider status prevents execution
- **THEN** the migrated composer displays the disabled reason and prevents run creation through the same runtime-aware state as before migration

### Requirement: Timeline compatibility during chat component evaluation
The timeline SHALL preserve mixed operational content even if Ant Design X chat primitives are evaluated or adopted.

#### Scenario: Timeline contains mixed content
- **WHEN** the conversation timeline contains agent messages, user messages, run events, plan cards, permission cards, artifacts, or summaries
- **THEN** the migrated or retained timeline preserves chronological order, compact density, selection behavior, and Context Inspector linkage

#### Scenario: User clicks an agent message author
- **WHEN** the user activates an agent author or avatar in the timeline
- **THEN** the workbench opens that agent's conversation-scoped settings in the right Context Inspector while keeping the active conversation visible

### Requirement: Agent and connection pages use shared controls
The Agents and Connections center views SHALL use Ant Design-backed controls while retaining the IM-style side-list/detail layout.

#### Scenario: User edits an agent role
- **WHEN** the migrated Agents page renders the agent list and editor
- **THEN** list rows, avatars, badges, form fields, validation, and action buttons use shared controls while preserving create, update, and archive workflows

#### Scenario: User views provider status
- **WHEN** the migrated Connections page renders Claude Code, Codex placeholder, runtime status, or memory status
- **THEN** status badges, detail rows, refresh controls, empty states, and diagnostics use shared controls while preserving current provider and memory snapshot data

### Requirement: Modern Agents directory surface
The Desktop/Web Agents center view SHALL present agents through a compact side-list and a contact-style configuration detail that prioritizes readable identity, role, responsibilities, and capabilities over raw technical configuration.

#### Scenario: User opens an existing agent
- **WHEN** the user selects an agent from the Agents side-list
- **THEN** the detail surface displays the agent name, role, provider, responsibility summary, capability tags, and configuration summary before any raw advanced fields

#### Scenario: User changes agent configuration
- **WHEN** the user edits agent configuration fields
- **THEN** the page provides one primary save action for committing the changes through the existing update workflow

#### Scenario: User views default agent status
- **WHEN** the selected agent is a default agent
- **THEN** the detail surface shows default-agent status without making destructive management actions the primary focus

### Requirement: Template-assisted single-interface agent creation
The Desktop/Web Agents center view SHALL support template-assisted agent creation inside one create interface, without navigating to a separate template selection page.

#### Scenario: User starts creating an agent
- **WHEN** the user activates the Agents sidebar create affordance
- **THEN** the detail surface switches to a single create interface that includes compact template presets and editable basic fields

#### Scenario: User chooses a template preset
- **WHEN** the user selects a template preset in the create interface
- **THEN** the interface populates friendly defaults for role, responsibility, capability tags, system prompt, and policy while keeping the user on the same screen

#### Scenario: User creates from customized defaults
- **WHEN** the user saves a new agent after selecting or modifying a template preset
- **THEN** the page creates the agent through the existing create workflow using the selected and edited values

### Requirement: Agents advanced configuration disclosure
The Desktop/Web Agents center view SHALL place raw system prompt and policy JSON controls in an advanced configuration section that is collapsed by default.

#### Scenario: User opens a standard agent configuration
- **WHEN** the Agents detail surface renders for an existing agent or create flow
- **THEN** raw system prompt and policy JSON controls are hidden behind a collapsed advanced configuration disclosure by default

#### Scenario: Advanced configuration has validation errors
- **WHEN** an advanced configuration field contains invalid data during save
- **THEN** the page shows the validation error and makes the affected advanced section discoverable

#### Scenario: Power user edits advanced configuration
- **WHEN** the user expands advanced configuration
- **THEN** the page exposes raw system prompt and policy JSON controls without replacing the basic configuration fields

### Requirement: Workbench starts local agent runs
Desktop and Web workbenches SHALL let the user start a direct local agent run when the active workspace has an online Desktop Runtime.

#### Scenario: Runtime is online
- **WHEN** the user sends a prompt to a worker agent in a workspace with an online bound Desktop Runtime
- **THEN** the workbench submits a run request to Control Plane and shows the resulting run in the active conversation context

#### Scenario: Runtime is offline
- **WHEN** the user attempts to start a run while the active workspace runtime is offline or unavailable
- **THEN** the workbench prevents execution and keeps the prompt available for retry when runtime availability returns

### Requirement: Workbench reflects live run events
Desktop and Web workbenches SHALL merge Control Plane snapshots and live AgentHub events into the conversation timeline.

#### Scenario: Run status event arrives
- **WHEN** the workbench receives a run status event for the active conversation
- **THEN** the timeline and inspector update the matching run state without requiring a page reload

#### Scenario: Message delta event arrives
- **WHEN** the workbench receives a provider-backed message delta for the active conversation
- **THEN** the timeline displays the agent output in chronological context with the associated run and agent identity

#### Scenario: Live event stream disconnects
- **WHEN** the workbench loses the Control Plane event stream
- **THEN** it can reload the workbench snapshot to recover the latest known runs and messages

### Requirement: Chat information inspector
The Desktop and Web workbench SHALL provide an IM-style chat information detail surface for the active conversation.

#### Scenario: User opens group chat details
- **WHEN** the active conversation is a group chat and the user opens chat information
- **THEN** the inspector shows participating agent avatars at the top, followed by chat name, chat kind, workspace context, runtime context, timestamps, and membership summary

#### Scenario: User opens single-agent chat details
- **WHEN** the active conversation is a single-agent chat and the user opens chat information
- **THEN** the inspector shows the single participating agent and the same basic chat information rows without rendering group-only copy as required content

#### Scenario: Chat metadata is unavailable
- **WHEN** optional chat announcement, note, or timestamp data is missing
- **THEN** the inspector omits or marks only those rows as unavailable without hiding required chat title, kind, workspace, runtime, or participants

### Requirement: Chat title activation
The active chat title SHALL be an accessible activation target for opening chat information and SHALL be the primary conversation-detail entry point in the center header.

#### Scenario: Mouse user clicks chat title
- **WHEN** the user clicks the active chat title in the center workbench header
- **THEN** the right Context Inspector opens the chat information surface for that conversation

#### Scenario: Keyboard user activates chat title
- **WHEN** keyboard focus is on the active chat title affordance and the user presses Enter or Space
- **THEN** the right Context Inspector opens the chat information surface for that conversation

#### Scenario: User scans conversation header actions
- **WHEN** the center workbench header renders
- **THEN** it does not show a redundant `i` conversation-detail button as the primary detail entry point

### Requirement: Agent detail new conversation entry
The Desktop and Web Agents center view SHALL provide a primary "新对话" entry point for existing runnable agents that creates a new single-agent conversation in the Chat view.

#### Scenario: User creates a new conversation from an agent detail
- **WHEN** the user activates "新对话" on an existing runnable agent detail
- **THEN** the workbench creates a new workspace-scoped single-agent conversation for that agent and switches the center view to Chat with the new conversation selected

#### Scenario: Existing agent conversations are not reused from Agent detail
- **WHEN** the user activates "新对话" for an agent that already has one or more single-agent conversations in the active workspace
- **THEN** the workbench creates a separate new conversation instead of selecting an existing conversation

#### Scenario: Agent is not eligible for conversation entry
- **WHEN** the selected agent is archived, unsaved, or otherwise unavailable for runtime participation
- **THEN** the Agents detail does not present "新对话" as the primary available action

### Requirement: Same-agent conversation continuation through Chat
The conversation workbench SHALL keep continuing previous same-agent conversations in the Chat surface rather than the Agent detail surface.

#### Scenario: User searches for prior same-agent conversation
- **WHEN** the user wants to continue an existing conversation with an agent
- **THEN** the Chat view allows the user to find and select prior same-agent conversations through search or the conversation list

#### Scenario: New same-agent conversation appears separately
- **WHEN** a new single-agent conversation is created for an agent that already has another conversation
- **THEN** the conversation list shows the new conversation as a separate thread while preserving the older conversation and its history

### Requirement: New conversation composer readiness
The conversation workbench SHALL prepare the composer for the selected agent after a single-agent conversation is newly created from Agent detail.

#### Scenario: New single-agent conversation opens successfully
- **WHEN** the new single-agent conversation becomes active
- **THEN** the composer targets the participating agent and is ready for the user to enter the first prompt without requiring manual agent selection

#### Scenario: Runtime is unavailable after new conversation opens
- **WHEN** the new single-agent conversation is active and the workspace runtime is offline or unavailable
- **THEN** the composer preserves the drafted prompt context and uses the existing runtime-disabled explanation instead of starting a run

### Requirement: Composer hides routine Claude session controls
The Desktop and Web composer SHALL hide routine Claude Code session behavior and raw session id controls from the normal send flow.

#### Scenario: User composes a message to Claude Code-backed agent
- **WHEN** the active target is a Claude Code-backed agent
- **THEN** the composer does not require or display manual `new`, `continue`, `fork`, or raw session id controls for ordinary sending

#### Scenario: User sends a follow-up message
- **WHEN** the user sends another prompt to the same Claude Code-backed agent in the same conversation
- **THEN** the workbench submits the prompt without asking the user to choose a Claude Code session mode

#### Scenario: Advanced session recovery is unavailable in composer
- **WHEN** a user needs to reset or fork a provider session
- **THEN** the normal composer does not expose raw session id entry as the recovery mechanism

### Requirement: Workbench preserves stable per-agent conversation continuity
The Desktop and Web workbenches SHALL present conversation continuity as an AgentHub behavior rather than a provider session selection task.

#### Scenario: Same agent responds multiple times
- **WHEN** the same Claude Code-backed agent responds multiple times in one conversation
- **THEN** the timeline presents the responses as one continuous agent participation history without showing Claude Code session ids

#### Scenario: Multiple agents respond in same conversation
- **WHEN** multiple Claude Code-backed agents respond in the same conversation
- **THEN** the workbench preserves each agent's visible identity without suggesting they share one Claude Code provider session

#### Scenario: Run detail opens
- **WHEN** the user opens normal run detail for a Claude Code-backed run
- **THEN** the detail can show user-relevant execution settings and status while keeping the raw provider session id hidden

### Requirement: Session binding state does not pollute timeline content
The conversation timeline SHALL avoid exposing hidden Claude session binding implementation details.

#### Scenario: Run is resumed with provider session id
- **WHEN** a run uses a stored Claude Code provider session id
- **THEN** the timeline does not render the provider session id, resume argument, or internal binding key

#### Scenario: First run creates provider session
- **WHEN** the first run for a conversation-agent binding captures a provider session id
- **THEN** the timeline remains focused on user and agent messages rather than showing session binding bookkeeping


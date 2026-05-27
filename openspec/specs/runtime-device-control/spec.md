## Purpose
Define Desktop Runtime registration, heartbeat, workspace binding, Claude Code execution, event normalization, cancellation, and local smoke provider behavior.
## Requirements
### Requirement: Desktop Runtime registration
The system SHALL allow a signed-in Desktop Runtime to register itself as an executable device for the owning user.

#### Scenario: Runtime starts successfully
- **WHEN** the Desktop Runtime starts with a valid user session
- **THEN** it registers or updates a device record with name, platform, version, capabilities, and online status

### Requirement: Runtime heartbeat
The system SHALL track runtime liveness through heartbeat updates.

#### Scenario: Heartbeat expires
- **WHEN** a Desktop Runtime stops sending heartbeat updates within the configured timeout
- **THEN** the system marks that runtime device offline and prevents new runs from being routed to it

### Requirement: Local workspace binding
The system SHALL bind executable workspaces to the Desktop Runtime device that can access their local path.

#### Scenario: Run requested for local workspace
- **WHEN** a user starts an agent run for a local workspace
- **THEN** the system routes the run only to the Desktop Runtime device bound to that workspace

### Requirement: Claude Code local process adapter
The system SHALL provide a Claude Code adapter that launches Claude Code as a local process from Desktop Runtime.

#### Scenario: Runtime reports Claude Code preflight status
- **WHEN** Desktop Runtime starts in Claude Code provider mode
- **THEN** it resolves the configured Claude Code binary, performs a cheap executable check, and reports provider health as connected, missing, unavailable, or misconfigured

#### Scenario: Workbench displays provider health
- **WHEN** Control Plane has provider health from Desktop Runtime
- **THEN** the workbench snapshot includes that health so Desktop/Web can show whether local Claude Code is connected or why it is unavailable

### Requirement: Runtime event normalization
The system SHALL expose stable AgentHub events independent of provider-specific output formats.

#### Scenario: Provider output changes format
- **WHEN** the Claude Code adapter parses provider output
- **THEN** downstream clients receive AgentHub event types such as run started, message delta, permission requested, artifact updated, run completed, and run failed

### Requirement: Run cancellation
The system SHALL allow a user to cancel an active run through any signed-in client.

#### Scenario: User cancels active run from iOS
- **WHEN** a user cancels a running task from iOS
- **THEN** the command is routed to the owning Desktop Runtime and the run transitions to cancelling or cancelled

### Requirement: Local runtime registration visibility
The system SHALL let Desktop Runtime register local device and workspace metadata with Control Plane.

#### Scenario: Runtime registers provider and memory health
- **WHEN** Desktop Runtime registers a device
- **THEN** Control Plane stores provider health and memory health alongside workspace metadata for snapshot and status route consumers

### Requirement: Runtime workspace metadata publication
The Desktop Runtime SHALL publish local workspace metadata needed by the workbench.

#### Scenario: Workspace metadata is available
- **WHEN** Desktop Runtime registers a configured workspace
- **THEN** Control Plane exposes workspace id, display name, local path label, git branch, dirty state, and provider capabilities to clients without uploading source content

### Requirement: Decoupled provider smoke mode
The Desktop Runtime SHALL support a decoupled local provider mode for smoke verification when Claude Code is unavailable.

#### Scenario: Claude Code is unavailable
- **WHEN** the smoke verifier runs without a Claude Code CLI available
- **THEN** Desktop Runtime can use the configured smoke provider mode to emit valid AgentHub run and message events through the same adapter interface

#### Scenario: Claude Code provider is configured
- **WHEN** Claude Code provider mode is configured and the CLI is available
- **THEN** Desktop Runtime uses the Claude Code adapter boundary rather than UI mock data for provider execution

### Requirement: Closed local run command loop
The system SHALL route user-started local runs from Control Plane to the Desktop Runtime bound to the requested workspace or conversation project.

#### Scenario: Control Plane queues a run command
- **WHEN** an authenticated user starts a run for a conversation whose selected project is bound to an online Desktop Runtime
- **THEN** Control Plane creates a queued run and makes a `run.start` command available to that runtime with run id, workspace id, project id, conversation id, agent id, workspace path, prompt, system prompt, and provider mode

#### Scenario: Runtime executes a run command
- **WHEN** Desktop Runtime receives a `run.start` command
- **THEN** it invokes the configured provider adapter with the command payload and publishes provider runtime events back to Control Plane

#### Scenario: Workspace runtime is unavailable
- **WHEN** an authenticated user starts a run while the selected conversation project has no online bound Desktop Runtime
- **THEN** Control Plane rejects the request without creating an executable provider command

### Requirement: Provider event status normalization
The system SHALL translate provider runtime events into stable AgentHub run status and message events.

#### Scenario: Provider reports running or streaming
- **WHEN** Control Plane receives a provider status event for an owned run
- **THEN** it updates the run status and publishes an AgentHub run status event for the same run

#### Scenario: Provider emits message delta
- **WHEN** Control Plane receives a provider message delta for an owned run
- **THEN** it records conversation-visible message content and publishes an AgentHub message delta event for the same conversation, run, and agent

#### Scenario: Provider reports completion or failure
- **WHEN** Control Plane receives a provider terminal status for an owned run
- **THEN** it records the run completion or failure timestamp and publishes the corresponding terminal run event

### Requirement: Runtime run cancellation loop
The system SHALL deliver user cancellation requests to the Desktop Runtime and reflect cancellation state in Control Plane.

#### Scenario: User cancels active run
- **WHEN** an authenticated user cancels an active local run
- **THEN** Control Plane marks the run as cancelling and makes a `run.cancel` command available to the bound Desktop Runtime

#### Scenario: Runtime cancels provider process
- **WHEN** Desktop Runtime receives a `run.cancel` command for an active provider run
- **THEN** it asks the provider adapter to cancel the run and publishes the resulting terminal status

### Requirement: Runtime connection check commands
The Desktop Runtime SHALL handle connection check commands from Control Plane without creating agent runs.

#### Scenario: Runtime receives provider check command
- **WHEN** Desktop Runtime receives a connection check command for the configured Claude Code provider
- **THEN** it runs the provider preflight and publishes a provider health result for the owning user

#### Scenario: Runtime receives memory check command
- **WHEN** Desktop Runtime receives a connection check command for agentmemory
- **THEN** it runs the memory health check and publishes a memory health result for the owning user

#### Scenario: Runtime receives unsupported check command
- **WHEN** Desktop Runtime receives a connection check command for an unsupported or disabled provider
- **THEN** it reports a disabled or misconfigured result without starting an agent run

### Requirement: Control Plane connection check routing
The Control Plane SHALL route user-triggered local connection checks to the Desktop Runtime bound to the active workspace.

#### Scenario: Control Plane queues provider check
- **WHEN** an authenticated user requests a provider connection check for a workspace with an online bound Desktop Runtime
- **THEN** Control Plane queues a connection check command for that runtime

#### Scenario: Control Plane stores provider check result
- **WHEN** Control Plane receives a provider health result from Desktop Runtime
- **THEN** it stores the result so snapshot and provider status consumers see the fresh status and checked time

#### Scenario: Control Plane stores memory check result
- **WHEN** Control Plane receives a memory health result from Desktop Runtime
- **THEN** it stores the result so snapshot and memory status consumers see the fresh status and checked time

#### Scenario: Runtime is offline for local check
- **WHEN** an authenticated user requests a local connection check for a workspace with no online bound Desktop Runtime
- **THEN** Control Plane rejects the check request without queueing a command and returns an actionable offline explanation

### Requirement: Runtime commands carry hidden Claude session resume metadata
The system SHALL include hidden Claude Code session resume metadata in runtime run commands when Control Plane has a stored provider session id for the target conversation-agent binding.

#### Scenario: Stored provider session id exists
- **WHEN** Control Plane queues a `run.start` command for a Claude Code-backed conversation-agent binding with a stored provider session id
- **THEN** the command includes Claude Code options that cause Desktop Runtime to invoke Claude Code with `--resume <claudeSessionId>`

#### Scenario: Stored provider session id is absent
- **WHEN** Control Plane queues the first run for a Claude Code-backed conversation-agent binding without a stored provider session id
- **THEN** the command omits `--resume <claudeSessionId>` and allows Claude Code to create a provider session

#### Scenario: Runtime command is inspected by normal clients
- **WHEN** normal workbench clients inspect run state or timeline content
- **THEN** the raw provider session id from the runtime command is not exposed as ordinary UI copy

### Requirement: Desktop Runtime captures Claude provider session ids
The Desktop Runtime SHALL parse Claude Code provider output for session id metadata and report the captured session id through normalized AgentHub provider events.

#### Scenario: Claude Code stream includes session id
- **WHEN** the Claude Code adapter receives stream-json output containing a provider session id for a run
- **THEN** Desktop Runtime publishes normalized session metadata associated with the AgentHub run id

#### Scenario: Claude Code stream omits session id
- **WHEN** the Claude Code adapter does not observe a provider session id in stream output
- **THEN** Desktop Runtime continues normal run status and message normalization without failing the run solely for missing session metadata

#### Scenario: Provider session id changes after fork or reset
- **WHEN** a future explicit fork or reset action produces a different Claude Code provider session id
- **THEN** Desktop Runtime reports the new provider session id for Control Plane to associate with the intended binding action

### Requirement: Control Plane persists captured Claude session ids
The Control Plane SHALL persist captured Claude Code provider session ids only for the conversation-agent binding associated with the reporting run.

#### Scenario: Provider event reports session id
- **WHEN** Control Plane receives normalized session metadata for an owned run
- **THEN** it updates the hidden binding matching that run's conversation id and agent id

#### Scenario: Provider event references unknown run
- **WHEN** Control Plane receives session metadata for a run it does not own or cannot find
- **THEN** it ignores the session metadata and does not update any binding

#### Scenario: Run fails after reporting session id
- **WHEN** a run reports a session id and later fails
- **THEN** Control Plane may keep the captured session id only if it can safely associate it with the intended binding and does not expose it in normal UI

### Requirement: Claude Code default provider mode
The Desktop Runtime SHALL use real Claude Code provider mode by default unless smoke mode is explicitly configured.

#### Scenario: Provider mode is not configured
- **WHEN** Desktop Runtime starts without an explicit provider mode environment value
- **THEN** it selects Claude Code provider mode and runs Claude Code preflight for the configured binary

#### Scenario: Smoke mode is explicitly configured
- **WHEN** Desktop Runtime starts with provider mode set to smoke
- **THEN** it uses the smoke provider and does not silently invoke real Claude Code

### Requirement: Claude Code run options in runtime commands
The Control Plane SHALL include optional Claude Code run options when queueing run commands for Claude Code-backed agents.

#### Scenario: Run uses agent defaults
- **WHEN** a user starts a run without overriding Claude Code controls in the composer
- **THEN** the queued runtime command includes the agent's default Claude Code profile, permission preset, MCP profile, effort, hooks policy, and session behavior when configured

#### Scenario: Run uses composer overrides
- **WHEN** a user starts a run with composer-level Claude Code overrides
- **THEN** the queued runtime command includes those run-specific overrides without mutating the agent's saved defaults

### Requirement: Profile-aware Claude Code process launch
The Claude Code adapter SHALL launch the local CLI with profile-aware arguments while keeping the provider boundary stable for clients.

#### Scenario: Managed profile launch
- **WHEN** Desktop Runtime receives a Claude Code run command with managed profile options
- **THEN** it starts Claude Code from the bound workspace path with the selected settings, setting sources, MCP config, plugin directories, permission mode, effort, and session flags

#### Scenario: Unsupported local CLI option
- **WHEN** the configured Claude Code binary does not support a required selected option
- **THEN** Desktop Runtime reports a provider failure with an actionable message instead of falling back to a different runtime mode

### Requirement: Structured Claude Code output normalization
The Claude Code adapter SHALL parse structured CLI output when available and normalize it into AgentHub provider runtime events.

#### Scenario: Claude Code emits partial message output
- **WHEN** Claude Code emits partial message events in structured output mode
- **THEN** Desktop Runtime publishes AgentHub message delta events for the owning run and agent

#### Scenario: Claude Code emits terminal status
- **WHEN** Claude Code exits or emits terminal structured output
- **THEN** Desktop Runtime publishes a normalized completed or failed run status for Control Plane

#### Scenario: Structured output is unavailable
- **WHEN** the local Claude Code CLI cannot emit supported structured output
- **THEN** Desktop Runtime either uses a documented text fallback or reports the incompatibility as provider health or run failure

### Requirement: Local Claude Code capability discovery
The Desktop Runtime SHALL discover local Claude Code capability metadata required by AgentHub clients.

#### Scenario: Runtime discovers Claude Code capabilities
- **WHEN** Desktop Runtime performs Claude Code discovery
- **THEN** it reports binary path label, version, provider health, managed profile paths, settings source support, plugin summaries, skill summaries, MCP summaries, and workspace Claude file presence

#### Scenario: Discovery includes local-only content
- **WHEN** discovery encounters full plugin contents, full skill files, hooks commands, MCP secrets, or workspace source files
- **THEN** Desktop Runtime excludes those raw contents from Control Plane payloads

### Requirement: Runtime project directory registration
The Desktop Runtime SHALL support registering local project directories for conversation binding.

#### Scenario: User selects local directory
- **WHEN** a signed-in Desktop user selects a local directory for a new project
- **THEN** Desktop Runtime validates path access and publishes project metadata to Control Plane without uploading source content

#### Scenario: User selects default project
- **WHEN** the user chooses the AgentHub-managed default project option
- **THEN** Desktop Runtime creates or reuses the configured default directory and registers it as a project available for conversation binding

#### Scenario: Directory is inaccessible
- **WHEN** Desktop Runtime cannot access or create the selected directory
- **THEN** it returns a project-registration error and no executable project binding is created

### Requirement: Conversation-bound runtime path resolution
The system SHALL resolve local run working directories from the conversation's project binding.

#### Scenario: Conversation has project binding
- **WHEN** Control Plane queues a local run for a project-bound conversation
- **THEN** the `run.start` command uses the selected project's workspace path and includes project id, workspace id, conversation id, agent id, prompt, system prompt, and provider mode

#### Scenario: Conversation lacks project binding
- **WHEN** Control Plane receives a local run request for a conversation without a required project binding
- **THEN** it rejects the run before queueing a provider command and returns an explanation that project selection is required

#### Scenario: Runtime receives project-bound run command
- **WHEN** Desktop Runtime receives a `run.start` command with a project id and workspace path
- **THEN** it launches the provider adapter from that resolved directory rather than the runtime process working directory


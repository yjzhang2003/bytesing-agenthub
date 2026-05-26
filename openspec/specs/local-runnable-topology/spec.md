## Purpose
Define the local development topology, health checks, root commands, configuration, and Electron startup diagnostics for running AgentHub locally.
## Requirements
### Requirement: Local development process topology
The system SHALL provide a documented local development topology that starts Control Plane API, Desktop Runtime, Web client, and Desktop client as separate processes.

#### Scenario: Developer starts the runnable topology
- **WHEN** a developer runs the documented local development command
- **THEN** the system starts or instructs how to start Control Plane API, Desktop Runtime, Web client, and Desktop client with their configured local ports and environment variables

#### Scenario: Required process fails to start
- **WHEN** a required local process cannot start
- **THEN** the startup output identifies the failing process and provides an actionable next step

### Requirement: Local health checks
The system SHALL expose health checks that prove each required local process is reachable.

#### Scenario: Control Plane is healthy
- **WHEN** the smoke verifier checks the Control Plane health endpoint
- **THEN** the Control Plane returns a successful status including service name, version, mode, and timestamp

#### Scenario: Runtime registration is visible
- **WHEN** the Desktop Runtime has registered with Control Plane
- **THEN** the Control Plane health or runtime endpoint reports the runtime as online with capabilities and heartbeat time

### Requirement: Root development commands
The repository SHALL provide root-level commands for starting and verifying the runnable AgentHub environment.

#### Scenario: Developer discovers commands
- **WHEN** a developer reads the root README or local setup documentation
- **THEN** they can identify the commands for installing dependencies, starting Web, starting Desktop, starting Control Plane, starting Desktop Runtime, and running smoke verification

#### Scenario: Smoke command completes successfully
- **WHEN** the developer runs the documented smoke command in a correctly configured local environment
- **THEN** it verifies service health, runtime registration, and client-facing snapshot availability without requiring hosted Supabase credentials

### Requirement: Local development configuration
The system SHALL provide local environment configuration templates for runnable development.

#### Scenario: Developer configures local mode
- **WHEN** a developer copies or follows the local environment template
- **THEN** the required local URLs, ports, auth mode, workspace path, and provider mode are configured with safe development defaults

### Requirement: Electron startup diagnostics
The Desktop client SHALL detect common Electron startup failures and provide actionable diagnostics.

#### Scenario: Electron binary is missing
- **WHEN** a developer starts Desktop and the Electron binary is not installed or cannot be resolved
- **THEN** the startup command fails with guidance for installing or approving the Electron dependency scripts

#### Scenario: Desktop starts successfully
- **WHEN** Electron is available and the Control Plane URL is configured
- **THEN** the Desktop app launches and loads the AgentHub workbench shell connected to the configured Control Plane

### Requirement: Local run loop smoke verification
The repository SHALL provide local smoke verification for the runnable topology.

#### Scenario: Fake Claude Code smoke
- **WHEN** the fake Claude Code smoke verifier runs
- **THEN** it proves provider preflight, run command delivery, fake provider output, and terminal run state without requiring a real Claude Code installation

#### Scenario: Agentmemory smoke
- **WHEN** the memory smoke verifier runs with a stub agentmemory service
- **THEN** it proves memory context injection and observation writes while keeping provider execution deterministic

### Requirement: Claude Code mode configuration
The local development documentation SHALL explain how to enable real Claude Code provider execution.

#### Scenario: Developer enables Claude Code mode
- **WHEN** a developer sets `AGENTHUB_PROVIDER_MODE=claude-code` and configures `AGENTHUB_CLAUDE_CODE_BIN`
- **THEN** Desktop Runtime uses the Claude Code provider adapter for new run commands

#### Scenario: Claude Code binary is unavailable
- **WHEN** Claude Code mode is configured but the binary cannot be executed
- **THEN** the runtime or verification path reports the setup problem without silently falling back to smoke output

### Requirement: User-visible local connection checks
The local runnable topology SHALL support user-triggered health checks for local runtime dependencies and expose their results through the workbench snapshot or status routes.

#### Scenario: Provider status is checked from the workbench
- **WHEN** a user requests a Claude Code provider check from Connections in a local runnable environment
- **THEN** the system performs the same provider preflight used by Desktop Runtime startup and exposes the fresh provider health result to Desktop/Web

#### Scenario: Memory status is checked from the workbench
- **WHEN** a user requests an agentmemory check from Connections in a local runnable environment
- **THEN** the system performs an agentmemory health request and exposes the fresh memory health result to Desktop/Web

#### Scenario: Check result is visible after refresh
- **WHEN** a user-triggered provider or memory check completes
- **THEN** a subsequent workbench snapshot or status route response contains the fresh checked time, status, and failure reason when present

### Requirement: Local connection check verification
The repository SHALL verify the user-triggered connection check path without requiring hosted Supabase credentials.

#### Scenario: Local provider check succeeds
- **WHEN** local verification runs in local-demo auth mode with smoke provider mode
- **THEN** it requests a provider check and observes a connected provider health result with a fresh checked time

#### Scenario: Local memory check reports unavailable
- **WHEN** local verification runs with agentmemory enabled but the configured health endpoint is unavailable
- **THEN** it requests a memory check and observes an unavailable or misconfigured memory health result with an actionable failure reason

### Requirement: Desktop bridge startup verification
The local runnable topology SHALL verify that the Desktop client loads its native capability bridge when Desktop-only features are expected.

#### Scenario: Desktop startup includes bridge
- **WHEN** a developer starts the documented Desktop client in local development
- **THEN** startup verification can prove the renderer exposes the Desktop bridge version and project-related capabilities

#### Scenario: Desktop preload is incompatible
- **WHEN** the Desktop preload artifact cannot execute in Electron
- **THEN** the startup output or smoke verification reports the preload problem with enough detail to distinguish it from Web, Control Plane, or Runtime failures

### Requirement: Desktop bridge smoke coverage
The repository SHALL provide automated smoke or integration coverage for Desktop bridge availability.

#### Scenario: Smoke verifier probes Desktop renderer
- **WHEN** the Desktop bridge smoke verifier runs against a local Desktop app
- **THEN** it observes the renderer bridge and verifies expected project capabilities without requiring hosted Supabase credentials

#### Scenario: Smoke verifier detects missing bridge
- **WHEN** the Desktop renderer loads the workbench without the native bridge
- **THEN** the verifier fails with an actionable message instead of passing because the Web URL loaded successfully

### Requirement: Explicit smoke provider configuration
The local runnable topology SHALL require smoke verification paths to opt into smoke provider mode explicitly.

#### Scenario: Local smoke verifier starts runtime
- **WHEN** a local smoke verifier starts Desktop Runtime for deterministic smoke output
- **THEN** it sets smoke provider mode explicitly before creating runs

#### Scenario: Developer starts runtime without provider override
- **WHEN** a developer starts Desktop Runtime without a provider mode override
- **THEN** local setup documentation explains that real Claude Code is the default provider and must be installed and authenticated

### Requirement: Real Claude Code local verification
The repository SHALL provide a documented optional verification path for real Claude Code execution.

#### Scenario: Real Claude Code verification is requested
- **WHEN** a developer explicitly runs real Claude Code verification in a configured local environment
- **THEN** the verifier checks Claude Code provider health, starts a minimal real Claude Code run, and observes normalized run output through Control Plane

#### Scenario: Real Claude Code verification is not requested
- **WHEN** standard deterministic smoke checks run in CI or local smoke mode
- **THEN** they do not invoke the real Claude Code CLI for agent output

### Requirement: Managed runtime profile documentation
The local development documentation SHALL explain how AgentHub-managed Claude Code profiles interact with workspace paths, settings files, MCP configs, plugin directories, hooks, and smoke mode.

#### Scenario: Developer configures managed profile mode
- **WHEN** a developer follows local setup documentation for managed Claude Code profiles
- **THEN** they can identify where AgentHub stores local profile files and how to switch between inherited, managed, isolated, and smoke modes

#### Scenario: Developer troubleshoots profile failure
- **WHEN** a managed Claude Code run fails because of missing plugins, unsupported CLI flags, invalid settings, or MCP configuration
- **THEN** local setup documentation provides an actionable recovery path


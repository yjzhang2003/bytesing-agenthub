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

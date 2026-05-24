## ADDED Requirements

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

## ADDED Requirements

### Requirement: User-triggered connection checks
The system SHALL let a user request fresh connection checks for local AgentHub dependencies from the Connections page.

#### Scenario: User checks one connection
- **WHEN** the user activates Check connection for a checkable connection
- **THEN** the system requests a fresh health check for that connection and preserves the previous health result until a new result is available

#### Scenario: User checks all available connections
- **WHEN** the user activates Check all while one or more checkable connections are available
- **THEN** the system requests fresh health checks for every enabled checkable connection and excludes disabled future provider slots

#### Scenario: Check is in progress
- **WHEN** a requested connection check has not produced a fresh result yet
- **THEN** the Connections page shows that connection as checking while still displaying the last known status, checked time, and failure reason if present

### Requirement: Connection health result states
The system SHALL represent connection health results with clear states and actionable failure details.

#### Scenario: Connection is healthy
- **WHEN** a provider, memory service, or runtime dependency reports a successful health check
- **THEN** the result is stored and displayed as connected with the fresh checked time

#### Scenario: Connection is missing
- **WHEN** a configured local binary or dependency cannot be found or executed
- **THEN** the result is stored and displayed as missing with a failure reason that identifies the missing dependency

#### Scenario: Connection is unavailable
- **WHEN** a configured local service or dependency is reachable incorrectly, times out, or reports an unhealthy response
- **THEN** the result is stored and displayed as unavailable with a failure reason

#### Scenario: Connection is misconfigured
- **WHEN** a required connection configuration value is invalid
- **THEN** the result is stored and displayed as misconfigured with a failure reason that identifies the invalid configuration

#### Scenario: Connection is disabled
- **WHEN** an optional connection is not enabled or a future provider has no supported implementation
- **THEN** the Connections page displays it as disabled and does not offer an active health check

### Requirement: Runtime-gated local checks
The system SHALL route checks that require local machine access through the owning Desktop Runtime.

#### Scenario: Desktop Runtime is online
- **WHEN** the user requests a Claude Code or agentmemory check for a workspace bound to an online Desktop Runtime
- **THEN** Control Plane queues a local connection check command for that runtime

#### Scenario: Desktop Runtime is offline
- **WHEN** the user requests a local connection check while the workspace Desktop Runtime is offline
- **THEN** the system does not queue the local check and the Connections page explains that Desktop Runtime must be online

#### Scenario: Runtime liveness is checked
- **WHEN** the user checks the Desktop Runtime connection
- **THEN** the system verifies current runtime liveness from heartbeat status and reports whether the active workspace runtime is online

# connection-health-checks Specification

## Purpose
TBD - created by archiving change improve-connections-health-checks. Update Purpose after archive.
## Requirements
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

### Requirement: Claude Code authentication setup failures
The system SHALL identify Claude Code CLI authentication failures and present them as actionable provider setup issues rather than raw run output.

#### Scenario: Run fails because Claude Code is not logged in
- **WHEN** Desktop Runtime receives a Claude Code failure indicating the local CLI is not authenticated
- **THEN** the run failure is presented as a Claude Code login/setup issue with guidance to authenticate the local CLI

#### Scenario: Connections page displays Claude Code auth issue
- **WHEN** the latest provider health or run diagnostics indicate Claude Code requires login
- **THEN** the Connections page displays the Claude Code provider as requiring setup with an actionable failure explanation

#### Scenario: Raw provider error is needed for diagnostics
- **WHEN** the user opens diagnostic or advanced run/provider details
- **THEN** the system can expose the original provider failure text without showing it as primary conversation content

### Requirement: Claude Code capability discovery checks
The Connections page SHALL let users request fresh discovery for Claude Code runtime capabilities from the Claude Code provider detail surface through the owning Desktop Runtime.

#### Scenario: User checks Claude Code capabilities
- **WHEN** the user requests a Claude Code capability check for a workspace with an online Desktop Runtime
- **THEN** Control Plane queues a local discovery command and preserves the previous discovery summary until the fresh result arrives

#### Scenario: Runtime completes capability discovery
- **WHEN** Desktop Runtime completes Claude Code capability discovery
- **THEN** Control Plane stores summary metadata for provider version, settings support, plugin summaries, skill summaries, MCP summaries, hooks policy support, and managed profile paths

#### Scenario: Capabilities are displayed as provider detail
- **WHEN** Claude Code capability discovery has latest summary metadata
- **THEN** Connections displays plugins, skills, MCP servers, hooks policy support, workspace Claude files, and managed profile paths inside the Claude Code provider detail rather than as a separate top-level connection

### Requirement: Claude Code discovery result privacy
The system SHALL redact local-only or secret Claude Code discovery data before exposing it to clients.

#### Scenario: Discovery finds MCP secret values
- **WHEN** Desktop Runtime reads MCP config that includes secrets
- **THEN** clients receive redacted MCP metadata and never receive secret values

#### Scenario: Discovery finds skill files
- **WHEN** Desktop Runtime finds plugin skill files
- **THEN** clients receive skill names and descriptions but not full skill file contents

#### Scenario: Discovery finds hook commands
- **WHEN** Desktop Runtime finds enabled or available hook commands
- **THEN** clients receive source and enabled status summaries without exposing sensitive command arguments unless explicitly safe to display

### Requirement: Managed profile status display
The Connections and Settings surfaces SHALL show whether AgentHub-managed Claude Code profiles are configured and usable for the active workspace, with Connections presenting profile state inside the Claude Code provider detail.

#### Scenario: Managed profile is healthy
- **WHEN** Desktop Runtime reports that managed profile files can be materialized for the active workspace
- **THEN** Connections displays managed profile status as available with the local profile path label

#### Scenario: Managed profile is misconfigured
- **WHEN** Desktop Runtime cannot materialize a selected settings, MCP, plugin, or hook profile
- **THEN** Connections displays the profile as misconfigured with an actionable failure reason

#### Scenario: Profile state is part of provider setup
- **WHEN** managed profile state affects Claude Code execution or discovery
- **THEN** Connections presents that state as part of Claude Code setup diagnostics instead of a separate selectable connection

### Requirement: Connection setup guidance
The system SHALL map connection health and discovery states to user-facing setup guidance that identifies the blocking condition and the next recovery action without requiring users to interpret raw diagnostics first.

#### Scenario: Desktop Runtime is offline
- **WHEN** a local Claude Code check cannot run because the owning Desktop Runtime is offline
- **THEN** the Connections page explains that Desktop Runtime must be online before local provider checks can run and keeps the provider re-check action unavailable until runtime status allows it

#### Scenario: Claude Code binary is missing
- **WHEN** provider health reports Claude Code as missing
- **THEN** the Connections page explains that the local Claude Code CLI cannot be found or executed and presents guidance to install or expose the CLI before re-checking

#### Scenario: Claude Code authentication is required
- **WHEN** provider health or run diagnostics indicate Claude Code requires login or setup
- **THEN** the Connections page presents the issue as a setup action for the local Claude Code CLI rather than as raw run output

#### Scenario: Claude Code provider is misconfigured
- **WHEN** provider health reports a misconfigured Claude Code provider or invalid provider setting
- **THEN** the Connections page identifies the misconfiguration and offers a re-check path after the user fixes local settings

#### Scenario: Capability discovery is unavailable
- **WHEN** Claude Code capability discovery is unavailable or stale while provider health can still be shown
- **THEN** the Connections page keeps the latest provider health visible and presents capability discovery as a separate detail section that can be refreshed

#### Scenario: Raw diagnostics are available
- **WHEN** a setup issue includes a raw failure reason
- **THEN** the Connections page can expose the raw diagnostic text as secondary diagnostic detail without making it the primary recovery instruction


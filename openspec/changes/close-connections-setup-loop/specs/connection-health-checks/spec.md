## ADDED Requirements

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

## MODIFIED Requirements

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

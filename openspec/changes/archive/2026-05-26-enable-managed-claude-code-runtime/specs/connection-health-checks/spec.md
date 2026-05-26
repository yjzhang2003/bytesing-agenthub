## ADDED Requirements

### Requirement: Claude Code capability discovery checks
The Connections page SHALL let users request fresh discovery for Claude Code runtime capabilities through the owning Desktop Runtime.

#### Scenario: User checks Claude Code capabilities
- **WHEN** the user requests a Claude Code capability check for a workspace with an online Desktop Runtime
- **THEN** Control Plane queues a local discovery command and preserves the previous discovery summary until the fresh result arrives

#### Scenario: Runtime completes capability discovery
- **WHEN** Desktop Runtime completes Claude Code capability discovery
- **THEN** Control Plane stores summary metadata for provider version, settings support, plugin summaries, skill summaries, MCP summaries, hooks policy support, and managed profile paths

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
The Connections and Settings surfaces SHALL show whether AgentHub-managed Claude Code profiles are configured and usable for the active workspace.

#### Scenario: Managed profile is healthy
- **WHEN** Desktop Runtime reports that managed profile files can be materialized for the active workspace
- **THEN** Connections displays managed profile status as available with the local profile path label

#### Scenario: Managed profile is misconfigured
- **WHEN** Desktop Runtime cannot materialize a selected settings, MCP, plugin, or hook profile
- **THEN** Connections displays the profile as misconfigured with an actionable failure reason

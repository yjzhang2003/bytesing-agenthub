# managed-claude-code-runtime Specification

## Purpose
TBD - created by archiving change enable-managed-claude-code-runtime. Update Purpose after archive.
## Requirements
### Requirement: Managed Claude Code runtime profiles
The system SHALL let Desktop Runtime materialize AgentHub-managed Claude Code profiles for a workspace, agent, or run without requiring users to manually edit Claude Code settings files.

#### Scenario: Managed profile is selected for a run
- **WHEN** a run starts with a managed Claude Code profile
- **THEN** Desktop Runtime launches Claude Code with the selected settings file, MCP config, plugin directories, permission mode, effort, and session behavior for that run

#### Scenario: Profile files remain local
- **WHEN** Desktop Runtime materializes settings, MCP, hook, or plugin configuration for a managed profile
- **THEN** full profile contents remain on the Desktop Runtime machine and Control Plane receives only non-secret summary metadata

### Requirement: Claude Code settings source modes
The system SHALL support inherited, managed, and isolated Claude Code settings source modes.

#### Scenario: Inherited settings mode
- **WHEN** a run uses inherited settings mode
- **THEN** Desktop Runtime allows Claude Code to load the user's configured user, project, and local settings sources

#### Scenario: Managed settings mode
- **WHEN** a run uses managed settings mode
- **THEN** Desktop Runtime passes AgentHub-selected settings, MCP config, and plugin directories while launching Claude Code from the bound workspace

#### Scenario: Isolated settings mode
- **WHEN** a run uses isolated settings mode
- **THEN** Desktop Runtime constrains Claude Code to AgentHub-selected settings and MCP configuration and does not rely on user-global or workspace-local configuration unless explicitly included

### Requirement: Claude Code plugin and skill selection
The system SHALL let users select discovered Claude Code plugin and skill profiles for agents and individual runs.

#### Scenario: Plugin profile is selected
- **WHEN** a run starts with a plugin profile containing one or more local plugin directories
- **THEN** Desktop Runtime passes those plugin directories to Claude Code for that run

#### Scenario: Skill summary is displayed
- **WHEN** Desktop Runtime discovers available skills from selected plugins
- **THEN** clients can display skill names, descriptions, plugin source, and enabled status without exposing full skill file contents

### Requirement: Claude Code MCP profile selection
The system SHALL let users select MCP profiles for Claude Code-backed runs while keeping secrets local.

#### Scenario: MCP profile is selected
- **WHEN** a run starts with a selected MCP profile
- **THEN** Desktop Runtime passes the corresponding local MCP config to Claude Code

#### Scenario: MCP profile contains secrets
- **WHEN** an MCP config contains environment variables, tokens, headers, or other secret values
- **THEN** Control Plane and clients receive only redacted metadata such as server name, transport type, and status

### Requirement: Claude Code hook policy
The system SHALL let AgentHub profiles control whether Claude Code hooks are inherited, disabled, or explicitly enabled for a run.

#### Scenario: Hooks are disabled
- **WHEN** a run starts with hooks disabled by profile policy
- **THEN** Desktop Runtime launches Claude Code with settings that prevent profile-controlled hooks from running for that run

#### Scenario: Hooks are enabled
- **WHEN** a run starts with hooks enabled by profile policy
- **THEN** clients can inspect which hook sources are enabled before the run starts

### Requirement: Claude Code session behavior
The system SHALL let a run start a new Claude Code session, continue an existing session, or fork an existing session when supported by the local Claude Code CLI.

#### Scenario: New session is selected
- **WHEN** the user starts a run with new session behavior
- **THEN** Desktop Runtime starts Claude Code without resuming a previous session

#### Scenario: Continue session is selected
- **WHEN** the user starts a run with continue session behavior and a compatible session exists
- **THEN** Desktop Runtime launches Claude Code so the previous session context can be continued

#### Scenario: Requested session cannot be resumed
- **WHEN** a run requests session continuation but Desktop Runtime cannot resolve a compatible Claude Code session
- **THEN** the run fails visibly or falls back according to the selected profile policy without silently using unrelated session state


## ADDED Requirements

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

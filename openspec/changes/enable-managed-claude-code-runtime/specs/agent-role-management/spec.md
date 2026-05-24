## ADDED Requirements

### Requirement: Agent Claude Code default controls
The system SHALL let each Claude Code-backed agent role define default runtime controls used when the composer does not override them.

#### Scenario: User saves agent runtime defaults
- **WHEN** a user edits a Claude Code-backed agent and saves default permission preset, runtime profile, MCP profile, settings source mode, hooks policy, effort, or session behavior
- **THEN** Control Plane persists those defaults in the agent policy for future runs

#### Scenario: Run starts without overrides
- **WHEN** a run starts for an agent with saved Claude Code runtime defaults and no composer overrides
- **THEN** the runtime command uses the saved agent defaults

### Requirement: Agent tool permission configuration
The system SHALL let advanced agent configuration include allowed and disallowed Claude Code tool policies.

#### Scenario: User configures allowed tools
- **WHEN** a user saves allowed Claude Code tool rules for an agent
- **THEN** future runs for that agent can pass those allowed tool rules to Claude Code through the managed profile

#### Scenario: User configures disallowed tools
- **WHEN** a user saves disallowed Claude Code tool rules for an agent
- **THEN** future runs for that agent can pass those disallowed tool rules to Claude Code through the managed profile

### Requirement: Agent profile safety disclosure
The Agents surface SHALL clearly distinguish safe defaults from high-risk Claude Code runtime defaults.

#### Scenario: Agent default uses full access
- **WHEN** an agent's saved default permission preset allows full access or bypass-style permissions
- **THEN** the Agents surface displays a high-risk warning before the defaults are saved and whenever that agent is selected

#### Scenario: Agent default enables hooks
- **WHEN** an agent profile enables inherited or selected Claude Code hooks
- **THEN** the Agents surface shows that hooks may execute local commands during runs

### Requirement: Workspace write opt-in for Claude files
The system SHALL require explicit user opt-in before writing AgentHub-managed Claude Code configuration into a workspace.

#### Scenario: User chooses local profile storage
- **WHEN** a user chooses to write profile configuration into workspace-local Claude Code files
- **THEN** the UI explains which files may be written and requires confirmation before Desktop Runtime writes them

#### Scenario: User does not opt in
- **WHEN** a managed profile is used without workspace write opt-in
- **THEN** Desktop Runtime stores generated profile files outside the workspace by default

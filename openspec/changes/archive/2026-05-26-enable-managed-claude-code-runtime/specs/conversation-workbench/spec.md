## ADDED Requirements

### Requirement: Composer Claude Code run controls
The conversation composer SHALL expose concise Claude Code run controls for eligible Claude Code-backed runs.

#### Scenario: Composer targets Claude Code-backed agent
- **WHEN** the active target agent is backed by Claude Code and the runtime is available
- **THEN** the composer lets the user inspect and adjust permission preset, runtime profile, MCP profile, effort, and session behavior before sending

#### Scenario: Composer targets unavailable runtime
- **WHEN** Claude Code controls are visible but the Desktop Runtime or provider is unavailable
- **THEN** the composer disables run start and displays the relevant provider or runtime explanation

### Requirement: Permission preset selection
The composer SHALL present human-readable permission presets instead of raw Claude Code flags.

#### Scenario: User selects plan-only mode
- **WHEN** the user selects Plan only
- **THEN** the run is queued with a permission preset that prevents file-modifying execution according to the Claude Code profile mapping

#### Scenario: User selects full access mode
- **WHEN** the user selects Full access
- **THEN** the composer marks the run as high risk and requires explicit confirmation before sending

### Requirement: Runtime profile visibility in timeline
The workbench SHALL show the Claude Code runtime profile and permission preset used by each run.

#### Scenario: Run starts with managed profile
- **WHEN** a Claude Code-backed run appears in the timeline
- **THEN** the user can see the selected runtime profile, permission preset, MCP profile, and effort level in compact run details

#### Scenario: Run used high-risk permissions
- **WHEN** a run used Full access or equivalent high-risk permission mode
- **THEN** the timeline and inspector preserve that fact for later audit and review

### Requirement: Advanced Claude Code controls disclosure
The workbench SHALL keep advanced Claude Code options discoverable without crowding the default composer.

#### Scenario: User opens advanced run controls
- **WHEN** the user expands advanced Claude Code controls from the composer
- **THEN** the workbench exposes settings source mode, hooks policy, allowed/disallowed tools, plugin profile, and session options for that run

#### Scenario: User closes advanced run controls
- **WHEN** advanced controls are collapsed
- **THEN** the composer still displays the active high-level profile and permission selections

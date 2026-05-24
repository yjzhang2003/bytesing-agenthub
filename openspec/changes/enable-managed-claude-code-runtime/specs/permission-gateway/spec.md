## ADDED Requirements

### Requirement: Claude Code permission preset audit
The system SHALL record the Claude Code permission preset selected for each Claude Code-backed run.

#### Scenario: Run starts with permission preset
- **WHEN** a Claude Code-backed run is queued with Plan only, Ask first, Auto edits, Full access, or another supported preset
- **THEN** the run metadata or audit trail records the selected preset, source of the selection, and effective risk level

#### Scenario: Composer override changes permission preset
- **WHEN** a user overrides an agent's default permission preset from the composer
- **THEN** the audit trail records that the run used a run-level override

### Requirement: High-risk permission confirmation
The system SHALL visibly gate high-risk Claude Code permission presets before execution.

#### Scenario: User selects full access
- **WHEN** a user selects Full access or an equivalent bypass-style permission preset for a run
- **THEN** the system requires explicit confirmation before queuing the run

#### Scenario: High-risk default is inherited from agent
- **WHEN** an agent has a high-risk default permission preset
- **THEN** the composer shows the high-risk state before the user starts a run

### Requirement: Permission preset and action requests coexist
The system SHALL preserve action-level permission request behavior even when a run-level Claude Code permission preset is selected.

#### Scenario: Run uses ask-first preset
- **WHEN** Claude Code or AgentHub surfaces a risky action during an Ask first run
- **THEN** the existing permission request flow can present the action to the user for allow or deny

#### Scenario: Run uses plan-only preset
- **WHEN** a plan-only run attempts to execute a modifying action
- **THEN** the system blocks or fails the action according to the effective Claude Code profile policy

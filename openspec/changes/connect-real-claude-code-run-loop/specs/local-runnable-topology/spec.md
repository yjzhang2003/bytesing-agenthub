## ADDED Requirements

### Requirement: Local run loop smoke verification
The repository SHALL provide local verification that proves a user-started run reaches Desktop Runtime, executes through the smoke provider, and returns output to Control Plane.

#### Scenario: Smoke run loop completes
- **WHEN** a developer runs the documented local smoke verification in local-demo auth mode and smoke provider mode
- **THEN** the check starts a run, observes a runtime command, receives provider output, and verifies the run reaches a terminal state visible in the workbench snapshot

#### Scenario: Smoke verification fails
- **WHEN** any required local process, command delivery step, provider event, or snapshot update is unavailable
- **THEN** the smoke verification fails with an actionable error identifying the missing step

### Requirement: Claude Code mode configuration
The local development documentation SHALL explain how to enable real Claude Code provider execution.

#### Scenario: Developer enables Claude Code mode
- **WHEN** a developer sets `AGENTHUB_PROVIDER_MODE=claude-code` and configures `AGENTHUB_CLAUDE_CODE_BIN`
- **THEN** Desktop Runtime uses the Claude Code provider adapter for new run commands

#### Scenario: Claude Code binary is unavailable
- **WHEN** Claude Code mode is configured but the binary cannot be executed
- **THEN** the runtime or verification path reports the setup problem without silently falling back to smoke output

## ADDED Requirements

### Requirement: Explicit smoke provider configuration
The local runnable topology SHALL require smoke verification paths to opt into smoke provider mode explicitly.

#### Scenario: Local smoke verifier starts runtime
- **WHEN** a local smoke verifier starts Desktop Runtime for deterministic smoke output
- **THEN** it sets smoke provider mode explicitly before creating runs

#### Scenario: Developer starts runtime without provider override
- **WHEN** a developer starts Desktop Runtime without a provider mode override
- **THEN** local setup documentation explains that real Claude Code is the default provider and must be installed and authenticated

### Requirement: Real Claude Code local verification
The repository SHALL provide a documented optional verification path for real Claude Code execution.

#### Scenario: Real Claude Code verification is requested
- **WHEN** a developer explicitly runs real Claude Code verification in a configured local environment
- **THEN** the verifier checks Claude Code provider health, starts a minimal real Claude Code run, and observes normalized run output through Control Plane

#### Scenario: Real Claude Code verification is not requested
- **WHEN** standard deterministic smoke checks run in CI or local smoke mode
- **THEN** they do not invoke the real Claude Code CLI for agent output

### Requirement: Managed runtime profile documentation
The local development documentation SHALL explain how AgentHub-managed Claude Code profiles interact with workspace paths, settings files, MCP configs, plugin directories, hooks, and smoke mode.

#### Scenario: Developer configures managed profile mode
- **WHEN** a developer follows local setup documentation for managed Claude Code profiles
- **THEN** they can identify where AgentHub stores local profile files and how to switch between inherited, managed, isolated, and smoke modes

#### Scenario: Developer troubleshoots profile failure
- **WHEN** a managed Claude Code run fails because of missing plugins, unsupported CLI flags, invalid settings, or MCP configuration
- **THEN** local setup documentation provides an actionable recovery path

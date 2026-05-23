# agent-role-management Specification

## Purpose
TBD - created by archiving change complete-desktop-claude-memory-roles. Update Purpose after archive.
## Requirements
### Requirement: User-created agent roles
The system SHALL let a user create Claude Code-backed agent roles for a local workspace.

#### Scenario: User creates an agent role
- **WHEN** an authenticated user submits display name, role type, system prompt, capability tags, and policy for an active workspace
- **THEN** Control Plane creates an owned agent role and includes it in future workbench snapshots

#### Scenario: User updates an agent role
- **WHEN** an authenticated user updates an owned agent role
- **THEN** Control Plane persists the changed role fields and future runs use the updated system prompt

#### Scenario: User archives an agent role
- **WHEN** an authenticated user archives an owned agent role
- **THEN** Control Plane removes the role from default runnable targets without deleting historical runs or messages

### Requirement: Registry-managed default roles
The system SHALL preserve seeded Orchestrator and Implementer roles while allowing additional user roles.

#### Scenario: Fresh local snapshot
- **WHEN** a user loads the local workbench before creating roles
- **THEN** the snapshot includes Orchestrator and Implementer as runnable default agents


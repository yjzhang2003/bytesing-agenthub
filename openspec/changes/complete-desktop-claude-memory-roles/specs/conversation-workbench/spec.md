## MODIFIED Requirements

### Requirement: Snapshot-backed workbench state
Desktop and Web workbenches SHALL load their primary workspace, conversation, runtime status, and timeline snapshot from Control Plane in runnable local development.

#### Scenario: Snapshot includes connection and memory status
- **WHEN** the workbench loads a Control Plane snapshot
- **THEN** it can display local Claude Code provider health, agentmemory health, and available agent roles without a separate reload

### Requirement: Composer agent targeting
The composer SHALL support targeted messages to runnable agent roles.

#### Scenario: User-created role appears as target
- **WHEN** the snapshot includes a user-created non-archived agent role
- **THEN** the composer can target that role and run creation uses that role id

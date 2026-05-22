## Purpose
Define how AgentHub represents code artifacts, git-based diff summaries, full diff retrieval, persistence limits, temporary caching, and stale diff detection.

## Requirements

### Requirement: Code artifact metadata
The system SHALL represent code-related outputs as artifacts attached to messages or runs.

#### Scenario: Agent produces code change
- **WHEN** an agent run produces or modifies code
- **THEN** the system records artifact metadata including artifact type, run id, workspace id, file paths, summary, and timestamps

### Requirement: Git-based diff summary
The system SHALL compute diff summaries from the local workspace git state through Desktop Runtime.

#### Scenario: Run completes with workspace changes
- **WHEN** a Claude Code-backed run completes after modifying a git workspace
- **THEN** Desktop Runtime computes changed files, insertions, deletions, base commit, and working tree fingerprint

### Requirement: Full diff on demand
The system SHALL retrieve full diffs from Desktop Runtime on demand instead of requiring durable cloud storage of full diffs.

#### Scenario: Web user opens diff while runtime is online
- **WHEN** a Web client requests the full diff for a run and the owning Desktop Runtime is online
- **THEN** the system routes the request to Desktop Runtime and returns the computed diff to the client

#### Scenario: iOS user opens diff while runtime is offline
- **WHEN** an iOS client requests the full diff for a run and the owning Desktop Runtime is offline
- **THEN** the client displays stored diff metadata and indicates that the full diff requires the runtime to be online

### Requirement: Cloud diff persistence limits
The system SHALL avoid durable cloud storage of source files and full diffs by default.

#### Scenario: Run metadata is persisted
- **WHEN** a run produces code changes
- **THEN** the cloud stores diff metadata and does not store source file contents or full diff text unless the user has enabled short-lived caching

### Requirement: Short-lived diff cache
The system SHALL allow optional short-lived caching of full diffs for faster cross-client review.

#### Scenario: User enables temporary diff cache
- **WHEN** temporary diff caching is enabled for a workspace
- **THEN** full diff cache entries expire after the configured TTL and are not treated as source-of-truth history

### Requirement: Stale diff detection
The system SHALL detect when a requested full diff may no longer match the stored run metadata.

#### Scenario: Workspace git state changes after run
- **WHEN** Desktop Runtime computes a requested diff and the current base commit or working tree fingerprint differs from the stored run metadata
- **THEN** the client marks the diff as potentially stale and shows the current available diff state

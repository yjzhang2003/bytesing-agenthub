## ADDED Requirements

### Requirement: User-visible local connection checks
The local runnable topology SHALL support user-triggered health checks for local runtime dependencies and expose their results through the workbench snapshot or status routes.

#### Scenario: Provider status is checked from the workbench
- **WHEN** a user requests a Claude Code provider check from Connections in a local runnable environment
- **THEN** the system performs the same provider preflight used by Desktop Runtime startup and exposes the fresh provider health result to Desktop/Web

#### Scenario: Memory status is checked from the workbench
- **WHEN** a user requests an agentmemory check from Connections in a local runnable environment
- **THEN** the system performs an agentmemory health request and exposes the fresh memory health result to Desktop/Web

#### Scenario: Check result is visible after refresh
- **WHEN** a user-triggered provider or memory check completes
- **THEN** a subsequent workbench snapshot or status route response contains the fresh checked time, status, and failure reason when present

### Requirement: Local connection check verification
The repository SHALL verify the user-triggered connection check path without requiring hosted Supabase credentials.

#### Scenario: Local provider check succeeds
- **WHEN** local verification runs in local-demo auth mode with smoke provider mode
- **THEN** it requests a provider check and observes a connected provider health result with a fresh checked time

#### Scenario: Local memory check reports unavailable
- **WHEN** local verification runs with agentmemory enabled but the configured health endpoint is unavailable
- **THEN** it requests a memory check and observes an unavailable or misconfigured memory health result with an actionable failure reason

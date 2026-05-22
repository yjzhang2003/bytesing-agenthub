## MODIFIED Requirements

### Requirement: Claude Code local process adapter
The system SHALL provide a Claude Code adapter that launches Claude Code as a local process from Desktop Runtime.

#### Scenario: Runtime reports Claude Code preflight status
- **WHEN** Desktop Runtime starts in Claude Code provider mode
- **THEN** it resolves the configured Claude Code binary, performs a cheap executable check, and reports provider health as connected, missing, unavailable, or misconfigured

#### Scenario: Workbench displays provider health
- **WHEN** Control Plane has provider health from Desktop Runtime
- **THEN** the workbench snapshot includes that health so Desktop/Web can show whether local Claude Code is connected or why it is unavailable

### Requirement: Runtime device registration
The system SHALL let Desktop Runtime register local device and workspace metadata with Control Plane.

#### Scenario: Runtime registers provider and memory health
- **WHEN** Desktop Runtime registers a device
- **THEN** Control Plane stores provider health and memory health alongside workspace metadata for snapshot and status route consumers

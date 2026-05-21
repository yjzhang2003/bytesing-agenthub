## ADDED Requirements

### Requirement: Control Plane-backed workbench snapshot
Desktop and Web workbenches SHALL load their primary workspace, conversation, runtime status, and timeline snapshot from Control Plane in runnable local development.

#### Scenario: Client opens with Control Plane online
- **WHEN** Web or Desktop opens and Control Plane is reachable
- **THEN** the workbench displays the Control Plane-provided workspace, conversation timeline, runtime status, and available actions

#### Scenario: Client opens with Control Plane offline
- **WHEN** Web or Desktop opens and Control Plane is unreachable
- **THEN** the workbench displays a connection error state with retry affordance instead of silently showing stale static demo data

### Requirement: Workbench runtime state updates
Desktop and Web workbenches SHALL reflect runtime online, offline, and heartbeat changes from Control Plane.

#### Scenario: Runtime comes online
- **WHEN** Control Plane publishes a runtime online event
- **THEN** Web and Desktop update the runtime status area without requiring a full page reload

#### Scenario: Runtime goes offline
- **WHEN** Control Plane publishes a runtime offline event
- **THEN** Web and Desktop disable run-start actions that require that runtime and show the offline state in the workbench

## ADDED Requirements

### Requirement: Minimal runnable agent run lifecycle
The system SHALL support a minimal local agent run lifecycle through Control Plane and Desktop Runtime.

#### Scenario: User starts a local run
- **WHEN** the user sends a supported local task from the workbench
- **THEN** Control Plane creates a run, routes it to the online Desktop Runtime, and publishes run started state to connected clients

#### Scenario: Runtime emits run output
- **WHEN** the Desktop Runtime provider emits local run output
- **THEN** Control Plane appends normalized message or run events to the conversation timeline

#### Scenario: Local run completes
- **WHEN** the Desktop Runtime reports run completion
- **THEN** Control Plane marks the run completed and clients display the final run state in the timeline

### Requirement: Runnable demo remains provider-boundary driven
The runnable demo SHALL use provider adapter outputs rather than hardcoded client-side transcript fixtures for agent collaboration state.

#### Scenario: Client displays demo run output
- **WHEN** Web or Desktop displays output from a local demo run
- **THEN** the displayed messages and run states originate from Control Plane events produced by Desktop Runtime provider adapters

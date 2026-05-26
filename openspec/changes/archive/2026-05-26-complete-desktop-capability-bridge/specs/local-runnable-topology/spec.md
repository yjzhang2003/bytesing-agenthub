## ADDED Requirements

### Requirement: Desktop bridge startup verification
The local runnable topology SHALL verify that the Desktop client loads its native capability bridge when Desktop-only features are expected.

#### Scenario: Desktop startup includes bridge
- **WHEN** a developer starts the documented Desktop client in local development
- **THEN** startup verification can prove the renderer exposes the Desktop bridge version and project-related capabilities

#### Scenario: Desktop preload is incompatible
- **WHEN** the Desktop preload artifact cannot execute in Electron
- **THEN** the startup output or smoke verification reports the preload problem with enough detail to distinguish it from Web, Control Plane, or Runtime failures

### Requirement: Desktop bridge smoke coverage
The repository SHALL provide automated smoke or integration coverage for Desktop bridge availability.

#### Scenario: Smoke verifier probes Desktop renderer
- **WHEN** the Desktop bridge smoke verifier runs against a local Desktop app
- **THEN** it observes the renderer bridge and verifies expected project capabilities without requiring hosted Supabase credentials

#### Scenario: Smoke verifier detects missing bridge
- **WHEN** the Desktop renderer loads the workbench without the native bridge
- **THEN** the verifier fails with an actionable message instead of passing because the Web URL loaded successfully

## ADDED Requirements

### Requirement: Hosted staging with local runtime

The local runnable topology SHALL support staging Web and Control Plane coordinating with a local Desktop Runtime.

#### Scenario: Local runtime registers with staging Control Plane

- **WHEN** Desktop Runtime is configured with the staging Control Plane URL and a valid Supabase-backed session path
- **THEN** hosted Web can observe the runtime as online for the signed-in account

#### Scenario: Local-demo development remains available

- **WHEN** a developer runs the documented local-demo topology
- **THEN** Web, Desktop, Control Plane, and Desktop Runtime use local-demo auth without requiring staging Supabase or GitHub OAuth credentials

### Requirement: Staging rollback documentation

The local runnable topology documentation SHALL describe how to return from staging configuration to local-demo development.

#### Scenario: Developer switches back to local-demo

- **WHEN** a developer has finished staging smoke verification
- **THEN** documentation identifies the local environment values and commands needed to run local-demo mode again

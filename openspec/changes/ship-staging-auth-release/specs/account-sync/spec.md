## ADDED Requirements

### Requirement: Staging account authentication

The system SHALL use real Supabase GitHub OAuth sessions for account-scoped access in staging.

#### Scenario: Staging client uses Supabase session

- **WHEN** a staging Web or Desktop client calls Control Plane after GitHub login
- **THEN** Control Plane authenticates the Supabase JWT subject as the account owner for private records

#### Scenario: Staging client uses local-demo token

- **WHEN** a staging client sends the local-demo token to hosted Control Plane
- **THEN** Control Plane rejects the request as unauthenticated

### Requirement: Staging account isolation smoke

The system SHALL verify that staging account state is isolated from unauthenticated and local-demo state.

#### Scenario: Staging session is missing

- **WHEN** a staging client has no valid Supabase session
- **THEN** the client clears private in-memory state and returns to login before loading workspace, conversation, runtime, run, artifact, or permission data

#### Scenario: Staging session is rejected

- **WHEN** hosted Control Plane rejects a staging session as unauthenticated
- **THEN** the client closes active event streams, clears private in-memory state, and returns to login

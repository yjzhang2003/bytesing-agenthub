## ADDED Requirements

### Requirement: GitHub-backed production account sessions

The system SHALL use Supabase sessions created from GitHub OAuth as the production account session for Desktop, Web, and iOS.

#### Scenario: GitHub-authenticated session accesses private data

- **WHEN** a client calls Control Plane with a valid Supabase access token created from GitHub OAuth
- **THEN** Control Plane authenticates the token subject as the owning user for account-scoped records

#### Scenario: Local-demo token is used in production mode

- **WHEN** a production-mode client sends the local-demo token instead of a Supabase access token
- **THEN** Control Plane rejects the request as unauthenticated

### Requirement: Authentication state isolation

The system SHALL isolate authenticated account state from unauthenticated login state.

#### Scenario: Client becomes unauthenticated

- **WHEN** a client signs out, loses the session, or receives an authentication failure
- **THEN** it clears private in-memory workspace, conversation, runtime, and artifact state before showing login

#### Scenario: User signs in again

- **WHEN** a user completes GitHub login after being signed out
- **THEN** the client loads account-scoped data only for the newly authenticated session subject

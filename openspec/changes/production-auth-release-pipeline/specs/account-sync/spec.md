## ADDED Requirements

### Requirement: Production Supabase session authentication

The system SHALL use Supabase-backed user sessions for production Desktop, Web, and hosted Control Plane access.

#### Scenario: Production client has a valid session

- **WHEN** a production client calls Control Plane with a valid Supabase access token
- **THEN** Control Plane authenticates the user from the token subject and scopes private data to that user

#### Scenario: Production client has no valid session

- **WHEN** a production client has no valid Supabase session or sends an invalid token
- **THEN** Control Plane rejects private data access and the client presents authentication instead of loading account data

### Requirement: Local-demo authentication isolation

The system SHALL preserve local-demo authentication for development and deterministic smoke verification without allowing it to become the production authentication mode.

#### Scenario: Local-demo mode is used locally

- **WHEN** local development starts with local-demo authentication
- **THEN** clients can use the configured local demo token without requiring hosted Supabase credentials

#### Scenario: Production mode is used

- **WHEN** production authentication is enabled
- **THEN** static local-demo tokens are not accepted as authenticated user sessions

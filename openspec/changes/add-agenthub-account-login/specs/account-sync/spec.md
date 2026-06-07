## ADDED Requirements

### Requirement: Provider-agnostic Supabase account sessions
The system SHALL accept Supabase account sessions from supported production auth providers without requiring Control Plane to know the originating provider.

#### Scenario: Email-authenticated session accesses private data
- **WHEN** a Web client calls Control Plane with a valid Supabase access token created from email/password login
- **THEN** Control Plane authenticates the token subject as the owning user for account-scoped records

#### Scenario: GitHub-authenticated session remains valid
- **WHEN** a Web, Desktop, or iOS client calls Control Plane with a valid Supabase access token created from GitHub OAuth
- **THEN** Control Plane authenticates the token subject using the same account ownership rules as before

#### Scenario: Unsupported or invalid token is used
- **WHEN** a client sends a missing, expired, malformed, or invalidly signed token
- **THEN** Control Plane rejects the request as unauthenticated before loading private AgentHub data

### Requirement: Account method isolation
The system SHALL keep authenticated account state scoped to the Supabase user subject regardless of whether the session originated from GitHub or email/password.

#### Scenario: User signs out from an email session
- **WHEN** a Web user signs out from an email-authenticated session
- **THEN** the client clears private in-memory workspace, conversation, runtime, run, artifact, and permission state before showing login

#### Scenario: User signs in with a different method
- **WHEN** a user signs out and then signs in again with GitHub or email/password
- **THEN** the client loads account-scoped data only for the new Supabase session subject

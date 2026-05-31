## ADDED Requirements

### Requirement: Native iOS login screen

iOS SHALL present a native login screen before loading private AgentHub data in production authentication mode.

#### Scenario: iOS launches unauthenticated

- **WHEN** the user opens iOS without a valid production session
- **THEN** the app shows native product branding, GitHub sign-in, loading, and authentication error states without loading private workspace data

#### Scenario: iOS launches authenticated

- **WHEN** the user opens iOS with a valid stored production session
- **THEN** the app skips login and loads account-scoped workspace data

### Requirement: iOS GitHub OAuth return

iOS SHALL return from GitHub OAuth through a configured app callback and persist the Supabase session.

#### Scenario: iOS GitHub login succeeds

- **WHEN** the user completes GitHub OAuth from the iOS system authentication session
- **THEN** iOS receives the callback, stores the session, and loads authenticated app data

#### Scenario: iOS GitHub login is cancelled

- **WHEN** the user cancels the system authentication session
- **THEN** iOS returns to the login screen with no private data loaded

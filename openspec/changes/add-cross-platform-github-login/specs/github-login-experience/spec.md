## ADDED Requirements

### Requirement: Cross-platform GitHub login entry

The system SHALL present a GitHub login entry point before loading private AgentHub data in production authentication mode.

#### Scenario: Production Web opens without a session

- **WHEN** a user opens Web in production authentication mode without a valid session
- **THEN** Web presents a login page with a GitHub sign-in action instead of loading workspace, conversation, agent, runtime, or artifact data

#### Scenario: Production Desktop opens without a session

- **WHEN** a user opens Desktop in production authentication mode without a valid session
- **THEN** Desktop presents a login page with a GitHub sign-in action before loading private workbench data

#### Scenario: iOS opens without a session

- **WHEN** a user opens iOS in production authentication mode without a valid session
- **THEN** iOS presents a native login screen with a GitHub sign-in action before loading private workspace data

### Requirement: GitHub OAuth session completion

The system SHALL complete GitHub OAuth through Supabase Auth and produce a Supabase access token for Control Plane calls.

#### Scenario: GitHub OAuth succeeds

- **WHEN** the user completes GitHub OAuth through Supabase
- **THEN** the client stores the resulting Supabase session and calls Control Plane with the Supabase access token

#### Scenario: GitHub OAuth fails

- **WHEN** GitHub OAuth is cancelled, denied, expired, or returns an invalid callback
- **THEN** the client remains unauthenticated and shows an actionable authentication error without loading private data

### Requirement: Desktop browser login handoff

Desktop SHALL start GitHub login in the user's browser and return to the Desktop app after OAuth completion.

#### Scenario: Desktop starts GitHub login

- **WHEN** the Desktop user chooses GitHub sign-in
- **THEN** Desktop opens the system browser to the Supabase GitHub OAuth URL with a Desktop callback redirect

#### Scenario: Desktop receives OAuth callback

- **WHEN** OAuth redirects to the configured Desktop callback
- **THEN** Desktop validates the callback, stores the Supabase session, closes any pending login state, and loads the authenticated workbench

### Requirement: iOS system browser login

iOS SHALL use the platform system authentication session for GitHub login.

#### Scenario: iOS starts GitHub login

- **WHEN** the iOS user chooses GitHub sign-in
- **THEN** iOS starts a system authentication session for the Supabase GitHub OAuth URL with an iOS callback redirect

#### Scenario: iOS receives OAuth callback

- **WHEN** OAuth redirects to the configured iOS callback
- **THEN** iOS stores the Supabase session and loads authenticated workspace data

### Requirement: Sign-out

The system SHALL let authenticated users sign out on Web, Desktop, and iOS.

#### Scenario: User signs out

- **WHEN** an authenticated user chooses sign out
- **THEN** the client clears the local Supabase session, stops private data loading, closes active Control Plane event streams, and returns to the login page

#### Scenario: Session expires

- **WHEN** the stored session expires or Control Plane rejects the session as unauthenticated
- **THEN** the client returns to the login page and preserves no private in-memory workspace state

### Requirement: Local-demo auth bypass

The system SHALL keep local-demo development mode usable without GitHub OAuth.

#### Scenario: Local-demo Web starts

- **WHEN** Web starts in local-demo authentication mode
- **THEN** it uses the configured local demo token and does not show the GitHub login page

#### Scenario: Local-demo Desktop starts

- **WHEN** Desktop starts in local-demo authentication mode
- **THEN** it loads the local workbench without requiring browser GitHub login

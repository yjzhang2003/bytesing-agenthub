## ADDED Requirements

### Requirement: Web email account sign-in
The Web app SHALL allow users to sign in with an AgentHub email/password account backed by Supabase Auth.

#### Scenario: User signs in with email and password
- **WHEN** an unauthenticated Web user submits a valid email and password on the login page
- **THEN** Supabase creates a session and the Web app routes the user to the authenticated workbench

#### Scenario: Email sign-in is pending
- **WHEN** the Web app is submitting email/password credentials
- **THEN** it disables duplicate auth submissions and shows a pending state for the active method

#### Scenario: Email sign-in fails
- **WHEN** Supabase rejects the submitted email/password credentials
- **THEN** the login page shows a retryable, user-readable error without exposing stack traces, tokens, or raw secrets

### Requirement: Web account signup
The Web app SHALL allow users to create an AgentHub account with email and password through Supabase Auth.

#### Scenario: User creates an account
- **WHEN** an unauthenticated Web user submits a valid email and password from the signup state
- **THEN** Supabase receives a signup request with an AgentHub-owned redirect URL

#### Scenario: Signup requires confirmation
- **WHEN** Supabase requires email confirmation before a session is available
- **THEN** the Web app shows a confirmation-required success state rather than treating signup as a failed login

#### Scenario: Signup returns a session
- **WHEN** Supabase returns an active session after signup
- **THEN** the Web app routes the user to the authenticated workbench

#### Scenario: Signup input is invalid
- **WHEN** the submitted email or password is missing or fails minimum client-side requirements
- **THEN** the Web app prevents submission and shows localized validation guidance

### Requirement: Web password recovery
The Web app SHALL support password reset requests and reset completion for AgentHub email accounts.

#### Scenario: User requests password reset
- **WHEN** a user submits an email from the forgot-password state
- **THEN** Supabase receives a password recovery request with an AgentHub-owned reset redirect URL

#### Scenario: Reset email is sent
- **WHEN** Supabase accepts a password recovery request
- **THEN** the Web app shows a success state that does not reveal whether the email belongs to an account

#### Scenario: User opens reset callback
- **WHEN** Supabase redirects the browser to the AgentHub password reset route
- **THEN** the hosted Web app serves the SPA shell and presents a new-password form after session recovery is available

#### Scenario: User sets a new password
- **WHEN** a user submits a valid new password from the reset state
- **THEN** Supabase updates the authenticated user's password and the Web app routes to the authenticated workbench

### Requirement: Multi-method login surface
The Web login page SHALL present AgentHub email account login and GitHub OAuth as distinct supported auth methods.

#### Scenario: Login page opens
- **WHEN** an unauthenticated Web user opens `/login`
- **THEN** the page presents email account sign-in controls and a GitHub OAuth action without loading private workbench data

#### Scenario: User chooses GitHub login
- **WHEN** a user activates the GitHub OAuth action
- **THEN** the existing Supabase GitHub OAuth flow starts with the hosted Web callback URL

#### Scenario: User switches auth mode
- **WHEN** a user switches between sign-in, signup, and forgot-password states
- **THEN** the page clears transient method-specific errors without clearing an active authenticated session

### Requirement: Hosted email auth routes
The hosted Web deployment SHALL serve the SPA shell for AgentHub-owned email auth routes.

#### Scenario: Password reset route is requested directly
- **WHEN** a browser requests the hosted password reset route directly
- **THEN** Vercel serves the Web app shell instead of a hosting-provider 404

#### Scenario: Email confirmation returns to Web
- **WHEN** Supabase redirects an email confirmation or recovery link to AgentHub Web
- **THEN** the Web app can process the session state and route to the appropriate login or workbench state

## ADDED Requirements

### Requirement: Dedicated login page
The web app SHALL provide a dedicated login page for unauthenticated GitHub sign-in.

#### Scenario: Anonymous visitor opens login
- **WHEN** an unauthenticated visitor opens the login page
- **THEN** the page presents AgentHub identity, a GitHub sign-in action, concise trust copy, and a path back to the product homepage

#### Scenario: Signed-in user opens login
- **WHEN** an authenticated user opens the login page
- **THEN** the app routes the user to the workspace workbench rather than asking them to sign in again

### Requirement: Login OAuth state handling
The login page SHALL show distinct states for ready, pending, callback, success, and failure stages of GitHub authentication.

#### Scenario: Login is ready
- **WHEN** authentication configuration is available and no OAuth request is in progress
- **THEN** the GitHub sign-in control is enabled with clear accessible text

#### Scenario: Login request is pending
- **WHEN** the user starts GitHub sign-in
- **THEN** the page shows a non-duplicated pending state and prevents repeated submissions

#### Scenario: OAuth callback is being processed
- **WHEN** the app is processing the OAuth callback
- **THEN** the page shows a callback/loading state without rendering a sign-in failure message prematurely

#### Scenario: Hosted callback route is requested directly
- **WHEN** Supabase redirects the browser to the hosted `/auth/callback` route
- **THEN** the hosted web app serves the SPA shell so the client can process the OAuth callback instead of returning a hosting-provider 404

#### Scenario: OAuth succeeds
- **WHEN** GitHub authentication succeeds
- **THEN** the app routes the user to the workspace workbench

#### Scenario: OAuth fails
- **WHEN** GitHub authentication fails or returns an error
- **THEN** the page shows a retryable error state with actionable copy and no raw internal stack traces

### Requirement: Authentication configuration errors
The login page SHALL make configuration problems understandable without exposing secrets or internal implementation details.

#### Scenario: Auth environment is incomplete
- **WHEN** required public authentication configuration is missing
- **THEN** the login page disables the sign-in action and shows a deployer-readable configuration error

#### Scenario: User retries after a failure
- **WHEN** the user activates retry after a sign-in failure
- **THEN** the app clears transient failure state and returns to a usable login state or restarts the login flow

### Requirement: Hosted Control Plane reachability
The web deployment SHALL verify that the configured Control Plane URL points to a reachable hosted service before considering login-to-workbench healthy.

#### Scenario: Control Plane URL is reachable
- **WHEN** the deployed web app is configured with `VITE_CONTROL_PLANE_URL`
- **THEN** `${VITE_CONTROL_PLANE_URL}/health` returns the AgentHub Control Plane health payload from the public internet

#### Scenario: Control Plane URL is stale or unbound
- **WHEN** `${VITE_CONTROL_PLANE_URL}/health` returns a hosting-provider routing error such as Render `x-render-routing: no-server`
- **THEN** staging verification fails and the deployer must correct the URL or Render hostname binding before treating login as working

### Requirement: Login responsive layout
The login page SHALL remain focused and readable across desktop and mobile web layouts.

#### Scenario: Login renders on desktop
- **WHEN** the login page renders at desktop width
- **THEN** identity, trust copy, sign-in action, and error/pending states fit within a balanced layout without appearing as an unfinished control-plane card

#### Scenario: Login renders on mobile
- **WHEN** the login page renders at mobile width
- **THEN** sign-in controls and error content remain readable, tappable, and non-overlapping

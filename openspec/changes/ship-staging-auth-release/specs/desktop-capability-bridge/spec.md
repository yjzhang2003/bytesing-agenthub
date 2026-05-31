## ADDED Requirements

### Requirement: Packaged Desktop staging configuration

The Desktop client SHALL load configured staging Web and Control Plane endpoints from the packaged release environment without source changes.

#### Scenario: Staging package launches

- **WHEN** a user launches the staging Desktop package
- **THEN** Desktop loads the configured staging Web shell and exposes Desktop bridge capabilities to the renderer

#### Scenario: Staging package has missing endpoints

- **WHEN** a staging Desktop package is built without required Web or Control Plane endpoint configuration
- **THEN** release verification fails before publishing production artifacts

### Requirement: Packaged Desktop OAuth callback smoke

The Desktop client SHALL verify browser-login callback behavior from a packaged staging build.

#### Scenario: Packaged Desktop starts GitHub login

- **WHEN** a staging Desktop user chooses GitHub sign-in
- **THEN** Desktop opens the system browser to Supabase GitHub OAuth with the Desktop callback URL configured for staging

#### Scenario: Packaged Desktop receives callback

- **WHEN** Supabase redirects back to the Desktop callback after GitHub OAuth
- **THEN** Desktop validates the callback, completes the session, and loads the authenticated workbench without exposing tokens through renderer globals

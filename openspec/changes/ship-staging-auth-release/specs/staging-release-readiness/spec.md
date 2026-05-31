## ADDED Requirements

### Requirement: Staging deployment readiness

The system SHALL have a documented staging deployment that runs Web and Control Plane with production-like Supabase authentication before production release.

#### Scenario: Staging services are configured

- **WHEN** staging deployment is prepared
- **THEN** the Web URL, Control Plane URL, Supabase URL, Supabase anon key, Control Plane JWT secret, and auth mode are configured outside source code with secret values stored only in provider secret stores

#### Scenario: Staging Web opens unauthenticated

- **WHEN** a user opens the staging Web URL without a valid Supabase session
- **THEN** Web presents the GitHub login surface and does not load private workbench data

### Requirement: Staging OAuth callback verification

The system SHALL verify Supabase GitHub OAuth callback configuration for staging before production distribution.

#### Scenario: Hosted Web callback succeeds

- **WHEN** a user completes GitHub OAuth from staging Web
- **THEN** Supabase redirects back to the staging Web callback and the client obtains a Supabase session for Control Plane calls

#### Scenario: Callback configuration is invalid

- **WHEN** Supabase or GitHub rejects a staging callback URL
- **THEN** the smoke result records the failing callback value and blocks production release

### Requirement: Staging Desktop release artifact

The system SHALL produce a downloadable macOS Desktop artifact through a staging tag release before production distribution.

#### Scenario: Local unsigned Desktop package is built

- **WHEN** release preparation runs the local Desktop package command with signing disabled
- **THEN** a macOS app package is produced and can load the configured hosted Web shell

#### Scenario: Staging release tag is pushed

- **WHEN** a staging tag matching the release workflow pattern is pushed
- **THEN** GitHub Actions verifies the repository, builds Desktop package artifacts, and publishes them to a GitHub Release

### Requirement: Staging smoke evidence

The system SHALL record staging smoke evidence before production release.

#### Scenario: Staging smoke passes

- **WHEN** Web login, Control Plane auth, Desktop package launch, Desktop OAuth callback, local runtime connection, and rollback checks pass
- **THEN** the deployment runbook records the staging URLs, release tag, artifact location, smoke date, and result summary

#### Scenario: Staging smoke fails

- **WHEN** any staging smoke check fails
- **THEN** production release remains blocked and the runbook records the failed check, observed error, and rollback or retry action

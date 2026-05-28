## ADDED Requirements

### Requirement: Repository CI validation

The repository SHALL validate pull requests and main branch changes with automated checks before production delivery artifacts are trusted.

#### Scenario: Pull request validation runs

- **WHEN** a pull request is opened or updated
- **THEN** CI runs formatting checks, typechecking, linting, automated tests, OpenSpec validation, and workspace builds

#### Scenario: CI validation fails

- **WHEN** any required repository validation command fails
- **THEN** the CI run fails and does not publish release artifacts

### Requirement: Deployable Control Plane service

The system SHALL provide a production deployment path for Control Plane with explicit authentication configuration.

#### Scenario: Supabase auth mode is configured

- **WHEN** Control Plane starts with production Supabase authentication enabled
- **THEN** it requires the Supabase JWT secret and rejects startup when the secret is absent

#### Scenario: Local demo mode starts without hosted secrets

- **WHEN** Control Plane starts in local-demo mode
- **THEN** it uses safe local defaults without requiring Supabase deployment secrets

### Requirement: Web production deployment

The system SHALL support a hosted Web deployment that authenticates users and communicates with the configured Control Plane URL.

#### Scenario: Production Web loads with a valid session

- **WHEN** a user opens the hosted Web app with a valid Supabase session
- **THEN** Web calls Control Plane with the user's access token and loads account-scoped AgentHub data

#### Scenario: Production Web has no session

- **WHEN** a user opens the hosted Web app without a valid session
- **THEN** Web presents authentication before loading private workbench data

### Requirement: Desktop release artifacts

The release pipeline SHALL produce Desktop package artifacts from versioned release tags.

#### Scenario: Release tag is pushed

- **WHEN** a version tag is pushed
- **THEN** the release workflow builds the Desktop app, packages macOS artifacts, and uploads them to a GitHub Release

#### Scenario: Desktop package build fails

- **WHEN** the Desktop package build or repository verification fails during a release workflow
- **THEN** the workflow fails without publishing incomplete Desktop artifacts

### Requirement: Deployment runbook

The repository SHALL document the production and staging deployment procedure for Web, Control Plane, and Desktop releases.

#### Scenario: Operator prepares staging

- **WHEN** an operator follows the deployment runbook
- **THEN** they can identify required environment variables, service URLs, release commands, smoke checks, and rollback actions

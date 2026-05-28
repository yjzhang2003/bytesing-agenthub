## ADDED Requirements

### Requirement: Hosted service topology

The system SHALL define a hosted topology in which Web and Control Plane run as deployable services while Desktop Runtime remains local to the user's machine.

#### Scenario: Hosted Web connects to hosted Control Plane

- **WHEN** Web is deployed for staging or production
- **THEN** it uses the configured Control Plane URL instead of the local development default

#### Scenario: Desktop Runtime remains local

- **WHEN** a user starts Desktop from a packaged build
- **THEN** Claude Code execution and local project operations remain on the user's machine through Desktop Runtime

### Requirement: Production and local configuration separation

The runnable topology SHALL keep production configuration separate from local development defaults.

#### Scenario: Developer runs local commands

- **WHEN** a developer starts the documented local topology
- **THEN** the system continues to run without hosted Supabase or release secrets

#### Scenario: Production deployment starts

- **WHEN** a production service starts
- **THEN** required production URLs, authentication mode, and secrets are read from deployment configuration rather than local defaults

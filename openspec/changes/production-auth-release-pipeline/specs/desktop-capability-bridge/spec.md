## ADDED Requirements

### Requirement: Packaged Desktop bridge availability

Packaged Desktop builds SHALL preserve the native capability bridge used by the shared workbench renderer.

#### Scenario: Packaged Desktop loads Web shell

- **WHEN** a user launches a packaged Desktop build
- **THEN** the renderer can query the Desktop bridge version and supported capabilities without enabling Node integration

#### Scenario: Packaged Desktop uses configured Web URL

- **WHEN** a packaged Desktop build is configured with a production or staging Web URL
- **THEN** Desktop loads that Web shell while preserving Desktop-only bridge capabilities

### Requirement: Desktop release runtime configuration

Packaged Desktop builds SHALL expose enough runtime configuration to connect to the intended Control Plane and local runtime without rebuilding source code.

#### Scenario: Release build starts with configured endpoints

- **WHEN** a packaged Desktop build starts with release endpoint configuration
- **THEN** Desktop and Desktop Runtime use the configured Web and Control Plane URLs for account and command coordination

#### Scenario: Release configuration is missing

- **WHEN** required release endpoint configuration is missing or invalid
- **THEN** Desktop reports an actionable startup or connection diagnostic instead of silently behaving as a Web-only client

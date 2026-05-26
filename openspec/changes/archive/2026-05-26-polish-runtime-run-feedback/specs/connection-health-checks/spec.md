## ADDED Requirements

### Requirement: Claude Code authentication setup failures
The system SHALL identify Claude Code CLI authentication failures and present them as actionable provider setup issues rather than raw run output.

#### Scenario: Run fails because Claude Code is not logged in
- **WHEN** Desktop Runtime receives a Claude Code failure indicating the local CLI is not authenticated
- **THEN** the run failure is presented as a Claude Code login/setup issue with guidance to authenticate the local CLI

#### Scenario: Connections page displays Claude Code auth issue
- **WHEN** the latest provider health or run diagnostics indicate Claude Code requires login
- **THEN** the Connections page displays the Claude Code provider as requiring setup with an actionable failure explanation

#### Scenario: Raw provider error is needed for diagnostics
- **WHEN** the user opens diagnostic or advanced run/provider details
- **THEN** the system can expose the original provider failure text without showing it as primary conversation content

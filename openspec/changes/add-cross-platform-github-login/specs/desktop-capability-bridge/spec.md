## ADDED Requirements

### Requirement: Desktop OAuth bridge capability

The Desktop capability bridge SHALL expose only the minimal safe authentication actions needed by the renderer to start browser login and observe authentication callback status.

#### Scenario: Desktop renderer discovers auth capability

- **WHEN** the Desktop renderer loads in production authentication mode
- **THEN** capability discovery includes a browser-login capability without enabling Node integration

#### Scenario: Web renderer loads without Desktop auth bridge

- **WHEN** the Web renderer loads in a normal browser
- **THEN** Desktop browser-login capability discovery reports unavailable and does not throw

### Requirement: Desktop OAuth callback handling

The Desktop shell SHALL handle OAuth callbacks from the configured browser login redirect.

#### Scenario: Valid Desktop callback is received

- **WHEN** Desktop receives a callback for an in-progress GitHub login attempt
- **THEN** Desktop validates the callback state and passes the session completion result to the authenticated app shell

#### Scenario: Unexpected Desktop callback is received

- **WHEN** Desktop receives an OAuth callback with missing, invalid, expired, or mismatched state
- **THEN** Desktop rejects the callback and shows a localized authentication error without loading private data

## ADDED Requirements

### Requirement: Login localization coverage

The system SHALL localize login, logout, provider, loading, and authentication error chrome in English and Simplified Chinese.

#### Scenario: Login page renders in Simplified Chinese

- **WHEN** the selected product language is Simplified Chinese and an unauthenticated client renders the login page
- **THEN** product-owned login title, description, GitHub sign-in action, loading text, error text, and retry actions render in Simplified Chinese

#### Scenario: Login page renders in English

- **WHEN** the selected product language is English and an unauthenticated client renders the login page
- **THEN** product-owned login title, description, GitHub sign-in action, loading text, error text, and retry actions render in English

### Requirement: Provider names remain source values

The system SHALL preserve provider names and technical redirect details while localizing surrounding product chrome.

#### Scenario: GitHub provider appears in Chinese UI

- **WHEN** the selected product language is Simplified Chinese and the login UI references GitHub
- **THEN** the provider name `GitHub` remains unchanged while surrounding labels and descriptions use Simplified Chinese

#### Scenario: OAuth error contains technical detail

- **WHEN** an authentication error includes a callback URL, provider identifier, or diagnostic code
- **THEN** the technical value remains unchanged while the user-facing explanation is localized

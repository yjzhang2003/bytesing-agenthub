## ADDED Requirements

### Requirement: Account login localization coverage
The system SHALL localize product-owned account login, signup, and password recovery chrome in every supported product language.

#### Scenario: Email login renders in Simplified Chinese
- **WHEN** the selected language is Simplified Chinese and the Web login page shows email account sign-in
- **THEN** form labels, placeholders, helper text, validation messages, pending labels, success messages, error messages, and actions use Simplified Chinese product chrome

#### Scenario: Email login renders in English
- **WHEN** the selected language is English and the Web login page shows email account sign-in
- **THEN** form labels, placeholders, helper text, validation messages, pending labels, success messages, error messages, and actions use English product chrome

#### Scenario: Source values are preserved
- **WHEN** account login UI displays provider names, email addresses, URLs, route names, or technical configuration keys
- **THEN** those source values remain unchanged while surrounding product chrome uses the selected product language

### Requirement: Account auth accessibility localization
The system SHALL localize account-auth accessibility text consistently with visible product chrome.

#### Scenario: Account form exposes accessible names
- **WHEN** a Web account login, signup, forgot-password, or reset-password control exposes an accessible name, description, tooltip, or live-region message
- **THEN** that accessibility text uses the selected supported product language

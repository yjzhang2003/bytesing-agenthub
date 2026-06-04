## ADDED Requirements

### Requirement: Public homepage localization
The system SHALL localize product-owned public homepage chrome for supported languages.

#### Scenario: Homepage renders in English
- **WHEN** the selected language is English and an unauthenticated visitor opens the product homepage
- **THEN** homepage navigation, hero copy, feature labels, calls to action, product evidence labels, and footer chrome render in English

#### Scenario: Homepage renders in Simplified Chinese
- **WHEN** the selected language is Simplified Chinese and an unauthenticated visitor opens the product homepage
- **THEN** homepage navigation, hero copy, feature labels, calls to action, product evidence labels, and footer chrome render in Simplified Chinese

### Requirement: Login page localization
The system SHALL localize product-owned login page chrome for supported languages.

#### Scenario: Login renders in English
- **WHEN** the selected language is English and an unauthenticated visitor opens the login page
- **THEN** login title, trust copy, GitHub sign-in action, pending state, callback state, error state, retry action, and homepage return link render in English

#### Scenario: Login renders in Simplified Chinese
- **WHEN** the selected language is Simplified Chinese and an unauthenticated visitor opens the login page
- **THEN** login title, trust copy, GitHub sign-in action, pending state, callback state, error state, retry action, and homepage return link render in Simplified Chinese

### Requirement: Public page source content preservation
The system SHALL preserve source content values on public homepage and login pages while localizing product chrome.

#### Scenario: Technical values render on public pages
- **WHEN** the homepage or login page shows provider names, URLs, commands, product identifiers, runtime names, or workspace examples
- **THEN** those source content values remain unchanged while surrounding product chrome uses the selected language

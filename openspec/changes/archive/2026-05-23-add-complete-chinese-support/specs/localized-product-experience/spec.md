## ADDED Requirements

### Requirement: Product language selection
The system SHALL allow users to choose the product UI language from supported language options.

#### Scenario: User opens language settings
- **WHEN** the user opens Settings on a supported client
- **THEN** the UI shows a language preference with English and Simplified Chinese options

#### Scenario: User changes language
- **WHEN** the user selects Simplified Chinese or English from the language preference
- **THEN** the client updates product-owned UI chrome to the selected language without requiring a Control Plane data migration

### Requirement: Persisted client language preference
The system SHALL persist the selected product language per client and apply it during startup.

#### Scenario: User reloads Desktop or Web
- **WHEN** the user has selected Simplified Chinese and reloads or restarts the Desktop/Web client
- **THEN** the workbench renders product-owned UI chrome in Simplified Chinese from the first loaded app shell state

#### Scenario: User reopens iOS
- **WHEN** the user has selected Simplified Chinese and reopens the iOS client
- **THEN** native navigation, settings, and operational surfaces use Simplified Chinese labels

### Requirement: Product chrome localization coverage
The system SHALL localize product-owned UI chrome for supported languages.

#### Scenario: Workbench chrome renders in Simplified Chinese
- **WHEN** the selected language is Simplified Chinese
- **THEN** navigation, settings, composer affordances, loading states, error states, empty states, inspector labels, timeline card actions, buttons, tooltips, and accessibility labels use Simplified Chinese text

#### Scenario: English remains the default language
- **WHEN** no language preference exists
- **THEN** the client renders product-owned UI chrome in English unless a later requirement defines OS or browser language auto-detection

### Requirement: Content language preservation
The system SHALL preserve source language for user-owned, agent-owned, and technical content.

#### Scenario: Conversation contains English agent output
- **WHEN** the selected language is Simplified Chinese and a conversation message contains English agent output
- **THEN** the client displays the message body in its original English text while surrounding product chrome uses Simplified Chinese

#### Scenario: Technical artifact contains commands or paths
- **WHEN** the selected language is Simplified Chinese and a surface displays commands, file paths, URLs, provider names, code snippets, diffs, or markdown artifacts
- **THEN** those technical values remain unchanged and are not translated as product chrome

### Requirement: Localization fallback behavior
The system SHALL provide predictable fallback behavior when a translation key is missing or unsupported.

#### Scenario: Translation key is missing
- **WHEN** a product chrome string has no Simplified Chinese translation
- **THEN** the client falls back to the English string for that key and test coverage flags the missing translation before release

#### Scenario: Unsupported language is requested
- **WHEN** a client receives an unsupported language value from local storage or runtime configuration
- **THEN** the client falls back to English and keeps Settings usable

### Requirement: Localization verification
The implementation SHALL include automated checks for supported-language rendering and translation coverage.

#### Scenario: Shared Desktop/Web UI tests run
- **WHEN** the shared UI test suite runs
- **THEN** it verifies English default rendering and Simplified Chinese rendering for the main workbench, Settings, composer, navigation, and inspector chrome

#### Scenario: iOS localization tests run
- **WHEN** the iOS test or preview verification suite runs
- **THEN** it verifies that core native surfaces can render English and Simplified Chinese labels without replacing user or agent content

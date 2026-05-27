# localized-product-experience Specification

## Purpose
TBD - created by archiving change add-complete-chinese-support. Update Purpose after archive.
## Requirements
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

### Requirement: Chat information localization
The system SHALL localize product-owned chat information labels and participant management actions.

#### Scenario: Chat information renders in Simplified Chinese
- **WHEN** the selected language is Simplified Chinese and the user opens chat information
- **THEN** labels for participants, add agent, remove agent, chat name, chat kind, workspace, runtime, created, updated, announcement, note, and membership summary use Simplified Chinese text

#### Scenario: Chat title and agent names are source content
- **WHEN** the selected language is Simplified Chinese and a chat title or agent display name contains English or technical text
- **THEN** the title and agent display name remain unchanged while surrounding product chrome uses Simplified Chinese

#### Scenario: Unsupported locale opens chat information
- **WHEN** an unsupported locale value is present and chat information renders
- **THEN** the chat information labels fall back to English and add/remove controls remain usable

### Requirement: Supported locale normalization
The system SHALL normalize product language values before rendering product-owned UI chrome.

#### Scenario: Common English locale values are normalized
- **WHEN** a client receives `en` or `en-US` from props, persisted client settings, local storage, or runtime configuration
- **THEN** the client renders product-owned UI chrome using the English catalog and persists only a supported English locale value when writing the preference

#### Scenario: Common Simplified Chinese locale values are normalized
- **WHEN** a client receives `zh` or `zh-CN` from props, persisted client settings, local storage, or runtime configuration
- **THEN** the client renders product-owned UI chrome using the Simplified Chinese catalog and persists only `zh-CN` when writing the preference

#### Scenario: Invalid locale value falls back safely
- **WHEN** a client receives a malformed, unsupported, or empty language value
- **THEN** the client falls back to English product chrome, keeps language settings usable, and does not mutate user-authored or agent-authored content

### Requirement: Bilingual product chrome completeness
The system SHALL require every product-owned UI string to have English and Simplified Chinese coverage before release.

#### Scenario: New product chrome string is introduced
- **WHEN** implementation adds a product-owned label, action, status, helper text, placeholder, validation message, empty state, loading state, error state, toast, tooltip, menu item, dialog text, or accessibility label
- **THEN** the implementation includes an English source string and a Simplified Chinese translation through the supported localization mechanism

#### Scenario: Product surface renders in either supported language
- **WHEN** Desktop/Web or iOS renders settings, navigation, workbench, composer, timeline, inspector, agent management, connection setup, permission, diff, runtime, collaboration, notification, empty/loading/error, or feedback surfaces
- **THEN** product-owned chrome renders in the selected supported language while preserving source content values unchanged

#### Scenario: Accessibility text follows selected language
- **WHEN** a control exposes an accessible name, description, live-region message, tooltip, or screen-reader-only label
- **THEN** that accessibility text uses the selected product language whenever the visible product chrome would be localized

### Requirement: Translation governance checks
The implementation SHALL include automated checks that prevent English and Simplified Chinese translation catalogs from drifting.

#### Scenario: Translation catalogs are checked
- **WHEN** localization tests run
- **THEN** they verify that every required product translation key has an English value, a Simplified Chinese value, and English fallback behavior for unsupported or missing locale values

#### Scenario: Representative localized renders are checked
- **WHEN** UI render tests run for shared Desktop/Web surfaces and native iOS surfaces
- **THEN** they verify representative English and Simplified Chinese output for main navigation, settings, composer, inspector, agents, connections, permissions, diffs, runtime states, empty states, loading states, error states, and feedback messages

#### Scenario: Source content preservation is checked
- **WHEN** localization tests render user messages, agent output, commands, paths, URLs, provider names, workspace metadata, code snippets, diffs, or markdown artifacts under Simplified Chinese
- **THEN** those source content values remain unchanged while surrounding product chrome uses Simplified Chinese


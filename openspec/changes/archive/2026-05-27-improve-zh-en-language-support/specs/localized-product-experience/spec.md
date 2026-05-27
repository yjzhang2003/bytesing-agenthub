## ADDED Requirements

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

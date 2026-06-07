## ADDED Requirements

### Requirement: Hosted public homepage Chinese default
The system SHALL allow hosted public homepage surfaces to use Simplified Chinese as the unauthenticated default locale while preserving supported locale normalization and fallback behavior.

#### Scenario: Public homepage has no stored locale
- **WHEN** an unauthenticated hosted web visitor opens the public homepage and no supported locale is stored
- **THEN** product-owned public homepage chrome uses Simplified Chinese as the default locale

#### Scenario: Public homepage receives unsupported locale
- **WHEN** an unauthenticated hosted web visitor has an unsupported, malformed, or empty public locale value
- **THEN** the homepage falls back predictably without corrupting persisted language settings or translating source content values

### Requirement: Concise Simplified Chinese homepage catalog
The Simplified Chinese public homepage catalog SHALL use concise product-owned copy that preserves meaning and source content values.

#### Scenario: Chinese homepage copy renders
- **WHEN** the public homepage renders in Simplified Chinese
- **THEN** navigation, hero copy, calls to action, feature labels, product evidence labels, and footer chrome use concise Simplified Chinese product text

#### Scenario: Technical identifiers render in Chinese homepage
- **WHEN** the Simplified Chinese public homepage shows product identifiers, provider names, runtime names, commands, URLs, or workspace examples
- **THEN** those source content values remain unchanged while surrounding product chrome uses Simplified Chinese

## ADDED Requirements

### Requirement: Localized text layout safety
The Desktop/Web visual system SHALL keep English and Simplified Chinese product strings readable within compact workbench layouts.

#### Scenario: Chinese labels render in compact controls
- **WHEN** the selected language is Simplified Chinese and buttons, side navigation, composer placeholders, settings rows, inspector headers, or timeline actions render
- **THEN** text remains readable without overlapping adjacent controls, clipping essential meaning, or changing fixed-format workbench structure

#### Scenario: Narrow layout renders localized chrome
- **WHEN** the workbench uses narrow or mobile-web layout with Simplified Chinese selected
- **THEN** drawer controls, timeline content, composer controls, and inspector content remain readable and do not overlap

### Requirement: Localized accessibility labels
The Desktop/Web visual system SHALL provide localized accessible names for product-owned interactive controls.

#### Scenario: Screen reader user navigates in Chinese
- **WHEN** the selected language is Simplified Chinese and a user navigates workspace tools, settings controls, composer send, theme toggle, inspector actions, or permission actions with assistive technology
- **THEN** accessible names and labels use Simplified Chinese for product chrome while preserving source text for content values

#### Scenario: Keyboard user reviews localized permissions
- **WHEN** the selected language is Simplified Chinese and the user navigates pending permissions with a keyboard
- **THEN** focus order, visible focus state, and localized action labels allow the user to inspect, allow once, or deny requests

### Requirement: Localized Ant Design wrappers
AgentHub Ant Design-backed controls SHALL support localized labels, placeholders, validation messages, and option text through AgentHub-owned wrappers or feature props.

#### Scenario: Settings language control renders
- **WHEN** Settings renders the language preference with Ant Design-backed controls
- **THEN** the control uses AgentHub semantic styling, compact density, localized option labels, and accessible names

#### Scenario: Form validation renders in Chinese
- **WHEN** a product-owned validation message appears while Simplified Chinese is selected
- **THEN** the message uses Simplified Chinese and retains the same compact spacing and error styling as English

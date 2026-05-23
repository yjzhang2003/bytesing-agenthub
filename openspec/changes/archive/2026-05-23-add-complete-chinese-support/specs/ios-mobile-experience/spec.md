## ADDED Requirements

### Requirement: Native iOS language preference
iOS SHALL expose the same product language choices as Desktop/Web using native SwiftUI settings patterns.

#### Scenario: User opens language settings on iOS
- **WHEN** the user opens Settings in the iOS app
- **THEN** the app shows English and Simplified Chinese as language choices using native controls

#### Scenario: User changes language on iOS
- **WHEN** the user selects Simplified Chinese or English on iOS
- **THEN** native navigation, conversation chrome, plan and permission surfaces, diff review chrome, runtime status, and settings labels update to the selected product language

### Requirement: iOS localized content boundaries
iOS SHALL localize product-owned UI chrome while preserving user-owned, agent-owned, and technical content.

#### Scenario: Conversation contains agent output
- **WHEN** the selected iOS language is Simplified Chinese and the user opens a conversation with English agent output
- **THEN** native labels and actions use Simplified Chinese while the agent message body remains unchanged

#### Scenario: Permission contains a command
- **WHEN** the selected iOS language is Simplified Chinese and a permission detail displays a command or file path
- **THEN** product labels use Simplified Chinese while the command and file path remain unchanged

### Requirement: iOS language persistence
iOS SHALL persist the selected product language locally and apply it when the app launches.

#### Scenario: User reopens iOS after selecting Chinese
- **WHEN** the user selected Simplified Chinese during a previous iOS session
- **THEN** the app launches with Simplified Chinese product chrome before the user navigates into workspace details

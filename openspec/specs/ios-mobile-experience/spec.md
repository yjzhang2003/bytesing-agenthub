## Purpose
Define the native iOS AgentHub experience, including navigation, runtime visibility, mobile plan and permission handling, diff review, and offline behavior.
## Requirements
### Requirement: Native iOS experience
The iOS client SHALL be a native SwiftUI experience that follows the same product model as Desktop and Web.

#### Scenario: iOS app launches
- **WHEN** the user opens the iOS app
- **THEN** the app presents native navigation for workspaces, conversations, runtime status, plans, permissions, diffs, and settings without embedding the Web UI as the primary interface

### Requirement: Mobile workspace navigation
iOS SHALL preserve workspace-first navigation using mobile-appropriate navigation patterns.

#### Scenario: User changes workspace on iOS
- **WHEN** the user switches workspace
- **THEN** the conversation list, runtime status, agent surfaces, and run state update to the selected workspace

### Requirement: Mobile conversation experience
iOS SHALL provide the same core conversation actions as Desktop and Web, adapted for mobile layout.

#### Scenario: User opens group chat on iOS
- **WHEN** the user opens a multi-agent conversation on iOS
- **THEN** the app shows user messages, agent messages, plan summaries, permission cards, artifacts, and run progress in chronological order

### Requirement: Mobile Plan Mode
iOS SHALL present Plan Mode using bottom sheets or pushed detail screens while preserving conversation context.

#### Scenario: User opens plan details on iOS
- **WHEN** the user taps a plan summary
- **THEN** the app shows the full plan with approve, revise, and cancel actions in a mobile detail surface

### Requirement: Mobile permission handling
iOS SHALL allow users to review and decide pending permission requests.

#### Scenario: Permission request arrives on iOS
- **WHEN** a permission request becomes pending
- **THEN** the app exposes it through the conversation and a pending permissions surface with allow once and deny actions

### Requirement: Mobile runtime limitations
iOS SHALL make local execution limitations explicit without reducing the client to a read-only app.

#### Scenario: Desktop Runtime is offline
- **WHEN** iOS is connected to the account but the workspace runtime is offline
- **THEN** the app allows viewing history and metadata while disabling or explaining actions that require local execution

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


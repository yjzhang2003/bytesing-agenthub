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

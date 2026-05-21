## ADDED Requirements

### Requirement: Light-first professional console theme
The design system SHALL define a light-first professional console visual language for MVP.

#### Scenario: User opens default theme
- **WHEN** the app loads with default theme settings
- **THEN** the UI uses a light theme with restrained neutrals, clear hierarchy, crisp dividers, and status colors reserved for semantic meaning

### Requirement: Avoid marketing and generic AI aesthetics
The UI SHALL avoid landing-page composition, decorative hero sections, oversized marketing cards, generic purple gradients, and decorative orb backgrounds.

#### Scenario: Developer opens the main workbench
- **WHEN** the main application view renders
- **THEN** the first viewport is the usable workspace workbench rather than a marketing or explanatory page

### Requirement: Design tokens
The design system SHALL define shared semantic tokens for color, typography, spacing, radius, borders, elevation, focus, status, and density.

#### Scenario: React and SwiftUI implement a card state
- **WHEN** Desktop/Web and iOS render equivalent plan, permission, or diff cards
- **THEN** both clients use equivalent semantic token names and state meanings even if component code is platform-native

### Requirement: Compact density
The UI SHALL use compact but legible density suitable for developer workflows.

#### Scenario: Conversation contains multiple agent events
- **WHEN** a conversation includes messages, run states, permissions, and artifacts
- **THEN** the UI remains scannable without using oversized cards or excessive vertical spacing

### Requirement: Component states
Core components SHALL define loading, empty, offline, blocked, error, success, warning, selected, focused, and disabled states.

#### Scenario: Runtime-dependent panel loads while offline
- **WHEN** a panel requires Desktop Runtime data but the runtime is offline
- **THEN** the component shows a specific offline state rather than a generic loading or error state

### Requirement: Accessibility and keyboard support
Desktop and Web SHALL support keyboard navigation for primary workbench actions, and all clients SHALL meet baseline contrast and focus visibility requirements.

#### Scenario: Keyboard user reviews pending permissions
- **WHEN** the user navigates pending permissions with a keyboard on Desktop or Web
- **THEN** focus order, visible focus state, and action labels allow the user to inspect, allow once, or deny requests

### Requirement: Visual QA
The implementation SHALL verify core UI states across Desktop/Web and iOS-sized layouts.

#### Scenario: UI implementation is ready for review
- **WHEN** the UI work is considered complete
- **THEN** screenshots or equivalent visual checks cover workspace workbench, active group chat, plan review, permission queue, diff review, offline runtime, and narrow/mobile layouts

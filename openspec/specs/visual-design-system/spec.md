## Purpose
Define the AgentHub MVP visual system, including professional workbench density, semantic tokens, theme behavior, accessibility, and visual QA expectations.

## Requirements

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

### Requirement: MVP workbench density and structure
The MVP workbench UI SHALL use compact, professional, light-first styling suitable for repeated developer workflows.

#### Scenario: User opens the main workbench
- **WHEN** the main app view renders
- **THEN** the UI uses the workbench as the first viewport, with restrained neutral surfaces, crisp panel borders, compact spacing, and no marketing hero or decorative background treatment

#### Scenario: Timeline contains mixed operational cards
- **WHEN** the timeline contains messages, run events, plan cards, permission cards, and diff cards
- **THEN** the UI remains scannable without oversized cards, nested cards, or excessive vertical spacing

### Requirement: Codex-like monochrome theme system
The MVP Desktop/Web UI SHALL provide dark and light monochrome modes using semantic tokens.

#### Scenario: User opens the default workbench
- **WHEN** the main workbench renders
- **THEN** the UI uses a restrained monochrome console style with thin borders, compact rows, low decoration, and a visible theme control

#### Scenario: User switches between dark and light modes
- **WHEN** the user activates the theme control
- **THEN** the workbench switches between dark and light semantic token sets without losing workspace, conversation, or inspector state

### Requirement: Open-source UI primitives
The MVP Desktop/Web UI SHALL use composable open-source primitives for common UI foundations instead of hand-rolling every interactive surface from raw markup.

#### Scenario: Workbench structure uses reusable primitives
- **WHEN** navigation, scrolling regions, separators, icons, or related primitive controls are implemented
- **THEN** the UI uses open-source primitives or component-source patterns while retaining AgentHub-owned semantic styling

### Requirement: MVP keyboard and accessibility coverage
The MVP Desktop/Web UI SHALL provide keyboard-accessible controls for primary workbench workflows.

#### Scenario: Keyboard user reviews a pending permission
- **WHEN** the user navigates the permission queue or selected permission detail by keyboard
- **THEN** focus order, visible focus state, and accessible action labels allow the user to inspect, allow once, or deny the request

#### Scenario: User navigates workbench surfaces by keyboard
- **WHEN** the user tabs through workspace navigation, conversation list, timeline cards, composer controls, and inspector actions
- **THEN** focus remains visible and follows the visual order of the workbench

### Requirement: MVP text and responsive safety
The MVP Desktop/Web UI SHALL prevent text overflow and incoherent overlap in supported layouts.

#### Scenario: Long workspace, agent, branch, or file names are shown
- **WHEN** the UI renders long names in navigation rows, cards, buttons, or inspector headers
- **THEN** text wraps, truncates, or uses constrained layout rules without overlapping adjacent controls

#### Scenario: Layout collapses to narrow width
- **WHEN** the workbench uses its narrow or mobile-web layout
- **THEN** controls, labels, timeline cards, and inspector/drawer content remain readable and do not overlap

### Requirement: Ant Design token mapping
The Desktop/Web visual system SHALL map AgentHub semantic tokens into Ant Design theme tokens while retaining the AgentHub workbench visual language.

#### Scenario: Ant Design control renders in the workbench
- **WHEN** a migrated Ant Design-backed control renders in a workbench panel
- **THEN** it uses AgentHub semantic colors, compact spacing, focus styles, border treatment, typography, and status colors rather than unmodified Ant Design defaults

#### Scenario: Theme changes at runtime
- **WHEN** the user switches between light and dark themes
- **THEN** both custom AgentHub surfaces and Ant Design-backed controls update consistently from the same theme state

### Requirement: Ant Design density constraints
The Desktop/Web visual system SHALL constrain Ant Design-backed components to compact developer-workbench density.

#### Scenario: Form controls render in an editor panel
- **WHEN** Agent, Connections, or Settings forms render with Ant Design-backed controls
- **THEN** row height, labels, validation messages, spacing, and action placement remain compact enough for repeated desktop workflows

#### Scenario: List rows render in side panels
- **WHEN** conversation, agent, provider, or settings rows use Ant Design-backed list, avatar, badge, or empty-state primitives
- **THEN** rows remain dense, aligned with the existing sidebar width rules, and free of oversized card-grid styling

### Requirement: Vendor styling isolation
The Desktop/Web visual system SHALL isolate vendor component styling behind AgentHub wrappers and theme configuration.

#### Scenario: Feature component uses a common control
- **WHEN** a feature component needs an Ant Design-backed control
- **THEN** it applies AgentHub wrapper classes and props rather than patching Ant Design internals with feature-specific global selectors

#### Scenario: Ant Design component markup changes
- **WHEN** Ant Design updates internal DOM or class names
- **THEN** AgentHub feature components remain protected by wrapper-level tests and avoid relying on internal Ant Design selectors

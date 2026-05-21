## ADDED Requirements

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

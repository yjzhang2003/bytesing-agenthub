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

### Requirement: Settings panel visual structure
The Desktop/Web Settings surface SHALL use a focused settings-panel layout with category navigation and grouped preference rows that follow AgentHub compact workbench typography, density, radius, and spacing tokens instead of page-specific oversized settings styling.

#### Scenario: User opens Settings on desktop
- **WHEN** the user opens Settings at desktop width
- **THEN** the UI presents a left category list and a right scrollable content area with compact grouped setting panels, tokenized row labels, compact controls, and clear separators between rows without using oversized category labels, headings, row titles, row heights, or preference-card styling

#### Scenario: Settings matches adjacent workbench surfaces
- **WHEN** the user switches between Chat, Agents, and Settings
- **THEN** Settings uses the same AgentHub compact typography scale, restrained panel treatment, icon scale, and control density as the surrounding workbench surfaces

#### Scenario: Settings contains operational metadata
- **WHEN** Settings shows workspace, runtime, permissions, language, keyboard, or appearance information
- **THEN** interactive preferences render as row controls while read-only technical values remain secondary text inside grouped rows rather than taking primary visual focus

#### Scenario: Settings is viewed in a narrow layout
- **WHEN** available width cannot support the desktop split layout
- **THEN** the category navigation collapses into a horizontal scrollable strip above the grouped settings content without overlapping controls, clipping localized labels, or inflating typography beyond the compact workbench scale

### Requirement: Grouped configuration editors
Desktop/Web configuration editors SHALL place related editable settings inside shared rounded groups rather than leaving fields as unbounded page content.

#### Scenario: User edits an agent role
- **WHEN** the Agents page renders editable role fields
- **THEN** name, role, responsibilities, and capability tags are grouped inside one rounded basic-information panel as row-based label/control pairs, while advanced metadata and policy fields are grouped inside a separate rounded advanced panel using the same row-based pattern where space allows

#### Scenario: User creates an agent from a template
- **WHEN** the Agents page renders template-assisted creation
- **THEN** template options are grouped inside their own rounded panel above the basic-information panel without navigating away from the create form

### Requirement: Shared sidebar search field
The Desktop/Web visual system SHALL provide one AgentHub-owned compact sidebar search field pattern for conversation and agent sidebars.

#### Scenario: Conversation sidebar search renders
- **WHEN** the conversation sidebar renders its search field
- **THEN** the field uses the shared AgentHub search structure, compact sizing, icon placement, focus state, and theme tokens

#### Scenario: Agents sidebar search renders
- **WHEN** the Agents sidebar renders its search field
- **THEN** the field uses the same shared AgentHub search structure as conversation search and does not nest a vendor search input inside another search container

#### Scenario: Search field receives focus
- **WHEN** the user focuses a shared sidebar search field
- **THEN** the focus state remains visible and does not resize, overlap, or visually split the field

### Requirement: Agents configuration hierarchy
The Desktop/Web visual system SHALL make Agents configuration readable and compact by grouping basic fields, responsibility, capabilities, and advanced configuration with clear hierarchy.

#### Scenario: Existing agent detail renders
- **WHEN** an existing agent detail is visible
- **THEN** the page avoids oversized form-first composition and presents readable grouped sections with compact spacing and no nested cards

#### Scenario: Create interface renders template presets
- **WHEN** the agent create interface renders template presets
- **THEN** the presets appear as compact selectable options inside the same form and do not become a separate gallery or landing page

#### Scenario: Advanced configuration is collapsed
- **WHEN** advanced configuration is collapsed
- **THEN** raw technical fields are visually secondary while the primary configuration remains understandable without opening the section

### Requirement: Agents primary action discipline
The Desktop/Web visual system SHALL keep the Agents surface focused on one primary save action and avoid duplicate prominent create actions in the detail header.

#### Scenario: User views the Agents detail header
- **WHEN** the detail header renders for an existing or new agent
- **THEN** it does not show a prominent right-side "New agent" header action

#### Scenario: User has no unsaved changes
- **WHEN** the current agent configuration has no unsaved changes
- **THEN** the save action is disabled or visually de-emphasized while remaining consistent with AgentHub compact button styling

### Requirement: IM-style add-agent picker visual pattern

The Desktop/Web visual system SHALL provide an AgentHub-owned compact add-agent picker pattern that matches an IM contact selection list while preserving AgentHub theme tokens.

#### Scenario: Add-agent picker renders

- **WHEN** the chat add-agent picker opens
- **THEN** it displays a prominent search field at the top, followed by vertically stacked agent rows with a circular selection control, avatar thumbnail, and display name aligned on one line

#### Scenario: Agent row selection changes

- **WHEN** an agent row is selected or unselected
- **THEN** the circular selection control, row state, and accessible selected state update without changing row height or shifting adjacent rows

#### Scenario: Picker uses compact workbench styling

- **WHEN** the add-agent picker renders in light or dark theme
- **THEN** it uses AgentHub semantic tokens for background, text, border, focus, hover, selected, and disabled states rather than unscoped vendor defaults

#### Scenario: Long agent names render

- **WHEN** an eligible agent has a long display name or Chinese product chrome is selected
- **THEN** row text remains readable through constrained wrapping or truncation without overlapping the selection control, avatar, or dialog actions

#### Scenario: Picker renders on narrow layout

- **WHEN** the workbench uses a narrow or mobile-web layout
- **THEN** the picker fits within the viewport, keeps search and actions reachable, and scrolls the agent list without horizontal overflow

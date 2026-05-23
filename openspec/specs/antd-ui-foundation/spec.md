## Purpose
Define the Ant Design-backed Desktop/Web UI foundation, including wrapper boundaries, theme bridging, migration constraints, Ant Design X evaluation, and verification expectations.

## Requirements

### Requirement: Ant Design component foundation
Desktop/Web UI SHALL use Ant Design-backed AgentHub wrappers for common interactive controls where Ant Design provides mature behavior.

#### Scenario: Developer implements a common form control
- **WHEN** a Desktop/Web feature needs a button, input, text area, select, checkbox, switch, form item, tooltip, dropdown, modal, tab, badge, avatar, empty state, skeleton, spinner, or notification
- **THEN** the feature uses an AgentHub-owned wrapper backed by Ant Design unless the implementation documents why the custom component is required

#### Scenario: Product surface imports UI controls
- **WHEN** an AgentHub page or feature component renders a common control
- **THEN** it imports the AgentHub wrapper rather than importing Ant Design components directly

### Requirement: AgentHub theme bridge
Desktop/Web UI SHALL provide an Ant Design theme bridge that maps AgentHub semantic tokens to Ant Design theme and component tokens.

#### Scenario: User switches to dark mode
- **WHEN** the workbench theme state changes to dark mode
- **THEN** Ant Design-backed controls update to the corresponding dark semantic colors, compact spacing, focus states, status colors, border radii, and typography without losing workbench state

#### Scenario: User switches to light mode
- **WHEN** the workbench theme state changes to light mode
- **THEN** Ant Design-backed controls update to the corresponding light semantic colors, compact spacing, focus states, status colors, border radii, and typography without losing workbench state

### Requirement: Product-owned layout boundaries
The migration SHALL preserve AgentHub-owned layout shells and use Ant Design inside those shells rather than replacing the workbench with generic Ant Design layout patterns.

#### Scenario: User opens the conversation workbench
- **WHEN** the workbench renders after the migration
- **THEN** the left rail, resizable workspace sidebar, center conversation surface, composer placement, runtime status, and center-view switching remain AgentHub-owned layouts

#### Scenario: User opens Agents or Connections
- **WHEN** the user navigates to Agents or Connections
- **THEN** the pages preserve the desktop IM side-panel/detail layout while using Ant Design-backed controls inside the panels where appropriate

### Requirement: Ant Design X chat evaluation
The implementation SHALL evaluate Ant Design X chat primitives before replacing custom timeline or composer components.

#### Scenario: Developer evaluates message bubbles
- **WHEN** Ant Design X Bubble, Sender, Conversations, or related chat components are considered for adoption
- **THEN** the evaluation verifies agent-click navigation, message avatars, mixed run-event cards, inspector selection, composer targeting, dense desktop layout, dark/light themes, and narrow layout behavior

#### Scenario: Ant Design X does not meet timeline requirements
- **WHEN** Ant Design X cannot preserve AgentHub's mixed operational timeline behavior
- **THEN** the custom timeline remains in place and only shared lower-level controls are migrated

### Requirement: Behavioral compatibility
The Ant Design migration SHALL preserve existing Control Plane API behavior and workbench user workflows.

#### Scenario: User creates or edits an agent
- **WHEN** the migrated Agents page submits create, update, or archive actions
- **THEN** it calls the existing agent APIs and refreshes the existing workbench snapshot behavior

#### Scenario: User checks Claude Code connection
- **WHEN** the migrated Connections page displays provider and memory status
- **THEN** it uses the existing runtime/provider/memory snapshot data and preserves refresh behavior

#### Scenario: User sends a message
- **WHEN** the migrated composer submits a prompt to a selected agent
- **THEN** it preserves the current run creation payload shape, agent targeting behavior, and runtime-disabled states

### Requirement: Migration verification
The migration SHALL include tests and visual checks that protect Ant Design wrapper behavior and AgentHub product workflows.

#### Scenario: UI wrappers are migrated
- **WHEN** Ant Design-backed wrappers are introduced
- **THEN** tests cover rendering, disabled states, focus labels, theme integration, and representative form validation behavior without depending on Ant Design internal DOM structure

#### Scenario: Product surfaces are migrated
- **WHEN** Agents, Connections, Settings, composer, or timeline-adjacent surfaces are migrated
- **THEN** tests verify the existing user workflows still render and submit through the same AgentHub callbacks

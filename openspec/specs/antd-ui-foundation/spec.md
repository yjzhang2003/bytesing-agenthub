## Purpose
Define the Ant Design-backed Desktop/Web UI foundation, including wrapper boundaries, theme bridging, migration constraints, Ant Design X evaluation, and verification expectations.
## Requirements
### Requirement: AgentHub component foundation
Desktop/Web UI SHALL use AgentHub-owned first-party components for common interactive controls.

#### Scenario: Developer implements a common form control
- **WHEN** a Desktop/Web feature needs a button, input, text area, select, checkbox, switch, form field, tooltip, dropdown, modal, tab, badge, avatar, empty state, loading indicator, or notification
- **THEN** the feature uses an AgentHub-owned component whose styling and public API are defined by AgentHub

#### Scenario: Product surface imports UI controls
- **WHEN** an AgentHub page or feature component renders a common control
- **THEN** it imports the AgentHub component rather than importing a styled vendor framework component directly

### Requirement: AgentHub theme root
Desktop/Web UI SHALL apply AgentHub semantic tokens directly through an AgentHub theme root rather than through an Ant Design theme bridge.

#### Scenario: User switches to dark mode
- **WHEN** the workbench theme state changes to dark mode
- **THEN** AgentHub-owned controls update to the corresponding dark semantic colors, compact spacing, focus states, status colors, border radii, and typography without losing workbench state

#### Scenario: User switches to light mode
- **WHEN** the workbench theme state changes to light mode
- **THEN** AgentHub-owned controls update to the corresponding light semantic colors, compact spacing, focus states, status colors, border radii, and typography without losing workbench state

### Requirement: Product-owned behavior boundaries
The component migration SHALL preserve AgentHub-owned layout shells and workflow behavior while replacing AntD-backed controls.

#### Scenario: User opens the conversation workbench
- **WHEN** the workbench renders after the migration
- **THEN** the left rail, resizable workspace sidebar, center conversation surface, composer placement, runtime status, and center-view switching remain AgentHub-owned layouts

#### Scenario: User opens Agents or Connections
- **WHEN** the user navigates to Agents or Connections
- **THEN** the pages preserve the desktop IM side-panel/detail layout while using AgentHub-owned controls inside the panels

### Requirement: Behavioral compatibility after AntD removal
The component migration SHALL preserve existing Control Plane API behavior and workbench user workflows.

#### Scenario: User creates or edits an agent
- **WHEN** the migrated Agents page submits create, update, archive, or new-conversation actions
- **THEN** it calls the existing Agent and Conversation APIs and refreshes the existing workbench snapshot behavior

#### Scenario: User checks Claude Code connection
- **WHEN** the migrated Connections page displays provider and memory status
- **THEN** it uses the existing runtime/provider/memory snapshot data and preserves refresh behavior

#### Scenario: User sends a message
- **WHEN** the migrated composer submits a prompt to a selected agent
- **THEN** it preserves the current run creation payload shape, agent targeting behavior, and runtime-disabled states


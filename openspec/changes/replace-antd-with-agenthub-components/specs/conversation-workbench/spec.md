## ADDED Requirements

### Requirement: AgentHub-owned workbench controls
The conversation workbench SHALL use AgentHub-owned controls for common interactions while preserving existing conversation, agent, runtime, and inspector behavior.

#### Scenario: User opens the migrated workbench
- **WHEN** Desktop or Web renders the migrated workbench
- **THEN** buttons, text inputs, selects, tooltips, dropdowns, badges, avatars, empty states, loading indicators, dialogs, tabs, and feedback controls use first-party AgentHub components where suitable

#### Scenario: User navigates primary workbench surfaces
- **WHEN** the user switches between conversation, Agents, Connections, Settings, run history, or inspector detail surfaces
- **THEN** the existing center-view state model, active workspace context, active conversation context, and runtime state remain intact

### Requirement: Composer compatibility after component replacement
The composer SHALL preserve agent targeting, mention suggestions, slash commands, prompt state, and runtime-disabled behavior when migrated to AgentHub-owned controls.

#### Scenario: User targets an agent
- **WHEN** the user selects or mentions an agent in the migrated composer
- **THEN** the composer submits the same selected agent id, prompt text, and run creation callback behavior as before migration

#### Scenario: Runtime is unavailable
- **WHEN** the runtime is offline or provider status prevents execution
- **THEN** the migrated composer displays the disabled reason and prevents run creation through the same runtime-aware state as before migration

### Requirement: Timeline remains AgentHub-owned
The timeline SHALL preserve mixed operational content using AgentHub-owned message, card, and action components.

#### Scenario: Timeline contains mixed content
- **WHEN** the conversation timeline contains agent messages, user messages, run events, plan cards, permission cards, artifacts, or summaries
- **THEN** the timeline preserves chronological order, compact density, selection behavior, and Context Inspector linkage

#### Scenario: User clicks an agent message author
- **WHEN** the user activates an agent author or avatar in the timeline
- **THEN** the workbench opens the Agents page with the corresponding agent selected

### Requirement: Agent and connection pages use AgentHub controls
The Agents and Connections center views SHALL use AgentHub-owned controls while retaining the IM-style side-list/detail layout.

#### Scenario: User edits an agent role
- **WHEN** the migrated Agents page renders the agent list and editor
- **THEN** list rows, avatars, badges, form fields, validation, and action buttons use AgentHub-owned controls while preserving create, update, archive, and new-conversation workflows

#### Scenario: User views provider status
- **WHEN** the migrated Connections page renders Claude Code, Codex placeholder, runtime status, or memory status
- **THEN** status badges, detail rows, refresh controls, empty states, and diagnostics use AgentHub-owned controls while preserving current provider and memory snapshot data

## REMOVED Requirements

### Requirement: Ant Design-backed workbench controls
**Reason**: Common controls will no longer be backed by Ant Design wrappers.
**Migration**: Use `AgentHub-owned workbench controls`.

### Requirement: Composer compatibility during migration
**Reason**: The Ant Design migration path is being replaced by a first-party component replacement path.
**Migration**: Use `Composer compatibility after component replacement`.

### Requirement: Timeline compatibility during chat component evaluation
**Reason**: Ant Design X chat evaluation is no longer part of the component strategy.
**Migration**: Use `Timeline remains AgentHub-owned`.

### Requirement: Agent and connection pages use shared controls
**Reason**: The shared controls are now explicitly AgentHub-owned rather than Ant Design-backed.
**Migration**: Use `Agent and connection pages use AgentHub controls`.

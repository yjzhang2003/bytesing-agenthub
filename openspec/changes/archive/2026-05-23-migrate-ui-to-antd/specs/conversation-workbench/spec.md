## ADDED Requirements

### Requirement: Ant Design-backed workbench controls
The conversation workbench SHALL use Ant Design-backed AgentHub wrappers for common controls while preserving existing conversation, agent, runtime, and inspector behavior.

#### Scenario: User opens the migrated workbench
- **WHEN** Desktop or Web renders the migrated workbench
- **THEN** buttons, text inputs, selects, tooltips, dropdowns, badges, avatars, empty states, loading indicators, and feedback controls use shared AgentHub wrappers where suitable

#### Scenario: User navigates primary workbench surfaces
- **WHEN** the user switches between conversation, Agents, Connections, Settings, run history, or inspector detail surfaces
- **THEN** the existing center-view state model, active workspace context, active conversation context, and runtime state remain intact

### Requirement: Composer compatibility during migration
The composer SHALL preserve agent targeting and runtime-disabled behavior when migrated to Ant Design-backed controls.

#### Scenario: User targets an agent
- **WHEN** the user selects or mentions an agent in the migrated composer
- **THEN** the composer submits the same selected agent id, prompt text, and run creation callback behavior as before migration

#### Scenario: Runtime is unavailable
- **WHEN** the runtime is offline or provider status prevents execution
- **THEN** the migrated composer displays the disabled reason and prevents run creation through the same runtime-aware state as before migration

### Requirement: Timeline compatibility during chat component evaluation
The timeline SHALL preserve mixed operational content even if Ant Design X chat primitives are evaluated or adopted.

#### Scenario: Timeline contains mixed content
- **WHEN** the conversation timeline contains agent messages, user messages, run events, plan cards, permission cards, artifacts, or summaries
- **THEN** the migrated or retained timeline preserves chronological order, compact density, selection behavior, and Context Inspector linkage

#### Scenario: User clicks an agent message author
- **WHEN** the user activates an agent author or avatar in the timeline
- **THEN** the workbench opens the Agents page with the corresponding agent selected

### Requirement: Agent and connection pages use shared controls
The Agents and Connections center views SHALL use Ant Design-backed controls while retaining the IM-style side-list/detail layout.

#### Scenario: User edits an agent role
- **WHEN** the migrated Agents page renders the agent list and editor
- **THEN** list rows, avatars, badges, form fields, validation, and action buttons use shared controls while preserving create, update, and archive workflows

#### Scenario: User views provider status
- **WHEN** the migrated Connections page renders Claude Code, Codex placeholder, runtime status, or memory status
- **THEN** status badges, detail rows, refresh controls, empty states, and diagnostics use shared controls while preserving current provider and memory snapshot data

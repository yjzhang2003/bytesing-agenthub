## MODIFIED Requirements

### Requirement: MVP Context Inspector modes

The Desktop/Web MVP Context Inspector SHALL support empty, chat information, collaboration agent status, plan, permission, diff, runtime, artifact, and run detail modes with product-owned labels and actions rendered in the selected product language.

#### Scenario: No detail is selected

- **WHEN** no timeline item or navigation item is selected for inspection
- **THEN** the inspector displays an empty state summarizing active workspace, runtime, selected conversation context, and compact collaboration availability when present

#### Scenario: User opens chat detail

- **WHEN** the user activates the active chat title or header affordance
- **THEN** the inspector displays chat participants, agent membership actions, and basic chat information using localized product labels while preserving chat title and technical context values

#### Scenario: User opens collaboration agent status

- **WHEN** the active conversation has collaboration status and the user opens the agent status view
- **THEN** the inspector displays each participating agent's identity, availability, current task, blocked user question state, and linked OpenSpec change summary without replacing the conversation timeline

#### Scenario: User opens plan detail

- **WHEN** the user selects a plan card
- **THEN** the inspector displays goal, assumptions, assigned agents, steps, risks, progress, and available plan actions using localized product labels while preserving plan content text

#### Scenario: User opens permission detail

- **WHEN** the user selects a pending permission
- **THEN** the inspector displays requesting agent, action type, action summary, workspace, risk level, related run or plan, and Allow once and Deny actions using localized product labels while preserving technical values

#### Scenario: User opens diff detail

- **WHEN** the user selects a diff card
- **THEN** the inspector displays changed files, insertions, deletions, status, metadata, stale/offline warnings, and an action to open full-screen review using localized product labels while preserving file paths and diff metadata

#### Scenario: User opens runtime detail

- **WHEN** the user selects runtime status
- **THEN** the inspector displays device identity, online state, heartbeat, capabilities, workspace binding, active runs, and offline/degraded explanations when applicable using the selected product language for product chrome

## ADDED Requirements

### Requirement: Collaboration status sidebar
The Desktop/Web MVP workbench SHALL show collaboration status in the right sidebar without introducing a new full-screen team dashboard.

#### Scenario: Agents are working in the active conversation
- **WHEN** collaboration status reports one or more participating agents with active, idle, blocked, completed, or failed work states
- **THEN** the right sidebar displays those states in a compact list that preserves the active conversation timeline and composer

#### Scenario: User input is blocking an agent
- **WHEN** collaboration status includes unresolved user questions
- **THEN** the right sidebar shows the affected agent and question status with an affordance to open or answer the question

#### Scenario: OpenSpec change is linked
- **WHEN** collaboration status includes an OpenSpec change link
- **THEN** the right sidebar shows the change name and summarized progress without rendering raw OpenSpec file contents by default

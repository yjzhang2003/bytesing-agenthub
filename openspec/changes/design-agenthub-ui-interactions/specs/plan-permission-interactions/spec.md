## ADDED Requirements

### Requirement: Plan summary card
The system SHALL show Orchestrator plans as compact timeline cards with full details available in the Context Inspector.

#### Scenario: Orchestrator creates a plan
- **WHEN** Plan Mode produces a draft plan
- **THEN** the timeline shows a compact plan summary and the Context Inspector shows goal, assumptions, steps, assigned agents, dependencies, expected artifacts, risk notes, and plan actions

### Requirement: Plan actions
The system SHALL provide approve, ask to revise, and cancel actions for draft plans.

#### Scenario: User approves a plan
- **WHEN** the user approves a draft plan
- **THEN** the plan state changes to approved and worker dispatch can begin

#### Scenario: User asks for revision
- **WHEN** the user asks to revise a draft plan
- **THEN** the plan remains undispatched and the UI shows that Orchestrator must produce a revised plan

### Requirement: Plan state visibility
The system SHALL show plan states consistently across timeline cards, Context Inspector, and iOS plan screens.

#### Scenario: Plan is dispatched
- **WHEN** worker runs have started for an approved plan
- **THEN** the UI shows dispatched state, active assigned agents, and per-step progress

### Requirement: Inline permission cards
The system SHALL show permission requests inline at the point in the conversation where the requesting agent action occurs.

#### Scenario: Agent requests command execution
- **WHEN** an agent requests permission to run a shell command
- **THEN** the timeline shows the requesting agent, command summary, workspace, risk level, and decision state

### Requirement: Global permission queue
The system SHALL provide a global pending permission queue in Desktop/Web and an equivalent pending permissions surface on iOS.

#### Scenario: Multiple agents request permissions
- **WHEN** more than one permission request is pending
- **THEN** the user can see and act on all pending requests without scrolling through the entire timeline

### Requirement: Permission decision actions
The system SHALL provide allow once and deny actions for MVP permission requests.

#### Scenario: User allows once
- **WHEN** the user selects allow once
- **THEN** the UI marks only that specific request as allowed and does not imply future approval

#### Scenario: User denies
- **WHEN** the user denies a permission request
- **THEN** the UI marks the request denied and shows the affected run as blocked, failed, or awaiting alternate action

### Requirement: Permission timeout state
The system SHALL display timeout and expired states for unanswered permission requests.

#### Scenario: Permission request expires
- **WHEN** a permission request times out
- **THEN** the UI shows the request as expired and removes it from active action controls while preserving the audit-visible record

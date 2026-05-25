## MODIFIED Requirements

### Requirement: Context Inspector
The workbench SHALL use the right Context Inspector as the default detail surface for selected chats, participating agents, plans, permissions, diffs, artifacts, and runtime details.

#### Scenario: User selects a plan card
- **WHEN** the user selects a plan card in the timeline
- **THEN** the Context Inspector displays the full plan, plan state, assigned agents, risk notes, and available actions

#### Scenario: User opens chat information from the title
- **WHEN** the user activates the active chat title
- **THEN** the Context Inspector displays the active chat information surface without replacing the conversation timeline

#### Scenario: User opens agent settings from an agent identity
- **WHEN** the user activates an agent avatar or name in the active conversation timeline or chat information participant area
- **THEN** the Context Inspector displays that agent's settings for the current conversation without navigating to the global Agents page

#### Scenario: User returns from chat information to timeline context
- **WHEN** the chat information surface is open and the user selects a timeline item with detail
- **THEN** the Context Inspector switches to the selected item detail while preserving the active chat and composer state

### Requirement: Timeline compatibility during chat component evaluation
The timeline SHALL preserve mixed operational content even if Ant Design X chat primitives are evaluated or adopted.

#### Scenario: Timeline contains mixed content
- **WHEN** the conversation timeline contains agent messages, user messages, run events, plan cards, permission cards, artifacts, or summaries
- **THEN** the migrated or retained timeline preserves chronological order, compact density, selection behavior, and Context Inspector linkage

#### Scenario: User clicks an agent message author
- **WHEN** the user activates an agent author or avatar in the timeline
- **THEN** the workbench opens that agent's conversation-scoped settings in the right Context Inspector while keeping the active conversation visible

### Requirement: Chat title activation
The active chat title SHALL be an accessible activation target for opening chat information and SHALL be the primary conversation-detail entry point in the center header.

#### Scenario: Mouse user clicks chat title
- **WHEN** the user clicks the active chat title in the center workbench header
- **THEN** the right Context Inspector opens the chat information surface for that conversation

#### Scenario: Keyboard user activates chat title
- **WHEN** keyboard focus is on the active chat title affordance and the user presses Enter or Space
- **THEN** the right Context Inspector opens the chat information surface for that conversation

#### Scenario: User scans conversation header actions
- **WHEN** the center workbench header renders
- **THEN** it does not show a redundant `i` conversation-detail button as the primary detail entry point

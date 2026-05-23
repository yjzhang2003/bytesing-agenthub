## ADDED Requirements

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

## ADDED Requirements

### Requirement: Header-driven detail actions
The Desktop and Web conversation workbench SHALL expose contextual detail actions in the conversation header for opening detail surfaces without relying on a generic right-sidebar collapse control as the primary interaction.

#### Scenario: User opens conversation detail from header action
- **WHEN** the user activates the Conversation Info header action
- **THEN** the workbench displays the active conversation detail surface while preserving the conversation timeline and composer state

#### Scenario: User opens run detail from header action
- **WHEN** at least one run is available for the active conversation and the user activates the Run Detail header action
- **THEN** the workbench displays the active, selected, or most recent run detail surface for that conversation

#### Scenario: No run detail is available
- **WHEN** no run exists for the active conversation
- **THEN** the Run Detail header action is disabled or opens an empty run detail state that does not imply a run is active

#### Scenario: Future detail actions are added
- **WHEN** future Diff, Artifact, Permission, or Runtime detail actions are added to the header
- **THEN** they use the same contextual detail surface model as Conversation Info and Run Detail

### Requirement: Context detail dismissal
The conversation detail surface SHALL support dismissal by clicking outside the detail content when it is presented as an overlay or drawer.

#### Scenario: User clicks outside conversation detail
- **WHEN** Conversation detail is open in an overlay or drawer presentation and the user clicks the blank area outside the detail content
- **THEN** the workbench closes the detail surface and leaves the conversation timeline and composer unchanged

#### Scenario: User interacts inside detail content
- **WHEN** a detail surface is open and the user clicks or types inside the detail content
- **THEN** the workbench keeps the detail surface open

### Requirement: User-facing run timeline summaries
The conversation timeline SHALL summarize run events using user-facing labels and SHALL NOT expose raw run ids, session ids, override source identifiers, or low-level audit fields by default.

#### Scenario: Run fails
- **WHEN** a run in the active conversation reaches failed status
- **THEN** the timeline shows a concise failed run summary with the agent identity and high-level run settings but without raw UUIDs or internal override source labels

#### Scenario: User needs technical run metadata
- **WHEN** the user opens Run detail for a run
- **THEN** the detail surface can show technical metadata such as effective permission preset, effort, profile labels, MCP profile, settings source, timing, failure reason, and diagnostic identifiers

#### Scenario: Timeline run card is selected
- **WHEN** the user selects a run event card in the timeline
- **THEN** the workbench opens the same Run detail surface used by the Run Detail header action

### Requirement: Run detail effective settings feedback
The workbench SHALL show the effective Claude Code settings used by a submitted run in Run detail.

#### Scenario: User sends a run with composer overrides
- **WHEN** the user submits a prompt with composer-selected Claude Code permission and effort settings
- **THEN** the resulting Run detail displays those effective settings for that run

#### Scenario: Agent defaults are used
- **WHEN** a run uses agent default Claude Code settings instead of composer overrides
- **THEN** the resulting Run detail identifies the effective settings without requiring the user to inspect raw agent policy JSON

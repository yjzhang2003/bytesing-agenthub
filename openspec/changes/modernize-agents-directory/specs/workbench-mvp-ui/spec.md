## ADDED Requirements

### Requirement: Modernized Agents verification
The Desktop/Web MVP implementation SHALL verify the modernized Agents page states, shared search rendering, template-assisted creation, advanced configuration disclosure, and localization.

#### Scenario: UI implementation is ready for Agents review
- **WHEN** the modernized Agents page implementation is considered complete
- **THEN** verification covers existing-agent detail, create interface, shared Agents search field, template preset selection, collapsed advanced configuration, save validation, and Simplified Chinese rendering

#### Scenario: Chat and Agents search fields are compared
- **WHEN** rendered verification captures the conversation sidebar and Agents sidebar
- **THEN** both search fields share the same compact visual structure and neither field appears split, doubled, or malformed

#### Scenario: Agents page renders in narrow layout
- **WHEN** the viewport cannot comfortably display the full Agents side-list and detail surface
- **THEN** the page preserves access to agent selection, create flow, advanced configuration, and save action without text overlap

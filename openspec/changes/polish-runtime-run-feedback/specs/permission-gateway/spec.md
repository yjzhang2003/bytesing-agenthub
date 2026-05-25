## ADDED Requirements

### Requirement: Composer permission mode feedback
The system SHALL make composer-selected Claude Code permission mode and effort settings visible as effective settings on the resulting run.

#### Scenario: User selects Ask first and Medium
- **WHEN** the user submits a Claude Code-backed run with Ask first permission mode and Medium effort selected in the composer
- **THEN** the run records and displays Ask first and Medium as effective run settings

#### Scenario: User selects Full access
- **WHEN** the user submits a Claude Code-backed run with Full access selected and confirmed
- **THEN** the run records and displays Full access as an effective high-risk run setting

#### Scenario: Runtime cannot honor a setting
- **WHEN** a selected Claude Code run setting cannot be honored by the active runtime or provider
- **THEN** the workbench prevents submission or shows a run failure explanation that identifies the unsupported setting

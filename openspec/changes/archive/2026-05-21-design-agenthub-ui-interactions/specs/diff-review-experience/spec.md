## ADDED Requirements

### Requirement: Diff summary card
The system SHALL show code changes as compact diff summary cards in the conversation timeline.

#### Scenario: Agent modifies files
- **WHEN** a run produces code changes
- **THEN** the timeline shows changed file count, insertions, deletions, run association, and a control to open the full diff surface

### Requirement: Right-panel diff review
Desktop and Web SHALL open diff details in the Context Inspector by default.

#### Scenario: User opens diff summary
- **WHEN** the user opens a diff summary card on Desktop or Web
- **THEN** the Context Inspector displays changed files, current selection, diff metadata, stale/offline state, and review actions

### Requirement: Full-screen diff review
Desktop and Web SHALL provide full-screen diff review for large or focused reviews.

#### Scenario: User enters full-screen diff
- **WHEN** the user chooses full-screen review from the Context Inspector
- **THEN** the conversation workbench is temporarily replaced by a focused diff review view with a clear return path

### Requirement: Mobile diff navigation
iOS SHALL use a file-list to file-detail flow for diff review.

#### Scenario: User opens diff on iOS
- **WHEN** the user opens a diff artifact on iOS
- **THEN** the app first shows changed files and summary, then lets the user open a single file diff detail

### Requirement: Offline diff state
The system SHALL distinguish available diff metadata from full diff content that requires an online Desktop Runtime.

#### Scenario: Runtime is offline
- **WHEN** the user requests full diff content and the owning runtime is offline
- **THEN** the UI shows stored metadata and states that full diff content requires the runtime to be online

### Requirement: Stale diff state
The system SHALL show when a diff may no longer match the stored run metadata.

#### Scenario: Diff is stale
- **WHEN** the runtime reports that the current git state differs from the stored run fingerprint
- **THEN** the UI marks the diff as potentially stale and explains that the displayed content reflects the current available state

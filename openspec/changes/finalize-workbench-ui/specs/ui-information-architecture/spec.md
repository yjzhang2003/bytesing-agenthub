## ADDED Requirements

### Requirement: Desktop/Web-first MVP scope
The MVP UI SHALL prioritize Desktop and Web workbench flows before iOS or team-oriented surfaces.

#### Scenario: Developer implements MVP UI navigation
- **WHEN** Desktop/Web MVP navigation is implemented
- **THEN** it focuses on workspace, conversations, agents, runs, settings, runtime status, permissions, plans, diffs, and artifacts

#### Scenario: User scans MVP navigation for future features
- **WHEN** the user opens primary navigation
- **THEN** team spaces, GitHub pull request workflows, cloud runtime execution, deployment publishing, web preview hosting, and public sharing are absent from primary navigation

### Requirement: Workbench detail continuity
The MVP UI SHALL preserve conversation context while users inspect operational details.

#### Scenario: User reviews a permission
- **WHEN** the user opens a permission from the queue or timeline
- **THEN** the UI keeps the active workspace and conversation visible or provides a direct return path

#### Scenario: User opens full-screen diff review
- **WHEN** the user opens a diff in full-screen review
- **THEN** the UI provides a clear return path to the originating conversation and selected workspace

## ADDED Requirements

### Requirement: Project list synchronization
The system SHALL synchronize user-owned project metadata needed for conversation creation across clients.

#### Scenario: User loads project picker
- **WHEN** a signed-in client opens the project picker
- **THEN** the system returns only projects owned by that user with display name, path label, owning runtime availability, repository metadata when available, and last-used metadata

#### Scenario: Project metadata changes
- **WHEN** Desktop Runtime updates project availability, repository branch, or path label
- **THEN** other signed-in clients receive updated project metadata without source file contents

#### Scenario: Project belongs to another user
- **WHEN** a client requests project metadata
- **THEN** the system excludes projects not owned by the signed-in user

### Requirement: Conversation project ownership
The system SHALL enforce account ownership when binding a project to a conversation.

#### Scenario: User creates project-bound conversation
- **WHEN** a signed-in user creates a conversation with a selected project
- **THEN** Control Plane verifies the selected project and selected agents belong to the same owning user before creating the conversation

#### Scenario: User references unavailable project
- **WHEN** a conversation creation request references a missing or unauthorized project
- **THEN** Control Plane rejects the request without creating conversation, membership, session binding, or run records

## MODIFIED Requirements

### Requirement: Local workspace metadata
The system SHALL store local workspace and project metadata in the cloud without requiring source code upload.

#### Scenario: Desktop registers a local workspace
- **WHEN** Desktop adds a workspace backed by a local path
- **THEN** the cloud record stores workspace identity, display name, owning device, optional repository metadata, and current availability without storing source files

#### Scenario: Desktop registers a local project
- **WHEN** Desktop adds or updates a project backed by a local path
- **THEN** the cloud record stores project identity, display name, owning device, path label, optional repository metadata, and current availability without storing source files

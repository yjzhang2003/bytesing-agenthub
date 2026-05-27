## Purpose
Define account-scoped access, ownership, synchronization, local workspace metadata, and offline execution visibility across AgentHub clients.
## Requirements
### Requirement: Account-based access
The system SHALL require a user account for Desktop, Web, and iOS clients before accessing conversations, workspaces, runtime devices, agents, runs, artifacts, or permission records.

#### Scenario: User signs in on a client
- **WHEN** a user completes authentication on Desktop, Web, or iOS
- **THEN** the client can access only records owned by that authenticated user

#### Scenario: Unauthenticated client opens the app
- **WHEN** a client has no valid session
- **THEN** the system presents authentication and does not load private AgentHub data

### Requirement: Personal data ownership
The system SHALL scope workspaces, conversations, agents, messages, runtime devices, runs, artifacts, and audit records to a single owning user.

#### Scenario: User loads personal workspace list
- **WHEN** a user requests workspaces
- **THEN** the system returns only workspaces owned by that user

### Requirement: Cross-client state synchronization
The system SHALL synchronize conversation metadata, messages, run state, permission state, artifact metadata, and runtime device status across Desktop, Web, and iOS.

#### Scenario: Message sent from Desktop
- **WHEN** a user sends a message from Desktop
- **THEN** Web and iOS clients signed in as the same user receive the new message through realtime synchronization

#### Scenario: Runtime status changes
- **WHEN** a Desktop Runtime changes from online to offline
- **THEN** Web and iOS clients update the runtime device status without requiring a manual refresh

### Requirement: Local workspace metadata
The system SHALL store local workspace and project metadata in the cloud without requiring source code upload.

#### Scenario: Desktop registers a local workspace
- **WHEN** Desktop adds a workspace backed by a local path
- **THEN** the cloud record stores workspace identity, display name, owning device, optional repository metadata, and current availability without storing source files

#### Scenario: Desktop registers a local project
- **WHEN** Desktop adds or updates a project backed by a local path
- **THEN** the cloud record stores project identity, display name, owning device, path label, optional repository metadata, and current availability without storing source files

### Requirement: Offline execution visibility
The system SHALL distinguish between cloud-visible workspace metadata and execution availability.

#### Scenario: Workspace runtime is offline
- **WHEN** Web or iOS opens a workspace whose owning Desktop Runtime is offline
- **THEN** the client shows historical metadata and disables execution actions that require that runtime

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


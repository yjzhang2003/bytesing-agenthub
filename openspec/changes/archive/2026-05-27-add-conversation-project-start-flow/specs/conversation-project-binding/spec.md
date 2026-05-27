## ADDED Requirements

### Requirement: Conversation project binding
The system SHALL bind each newly created local-agent conversation to an explicit project before local agent runs can start.

#### Scenario: User creates conversation with existing project
- **WHEN** the user starts a new conversation from Chat and selects an existing project
- **THEN** the created conversation stores that project binding and future local runs use that project's runtime and path metadata

#### Scenario: User creates conversation with default project
- **WHEN** a Desktop user selects the AgentHub-managed default project option during conversation creation
- **THEN** the system creates or reuses a concrete default project record and binds the new conversation to it

#### Scenario: User creates conversation from local directory
- **WHEN** a Desktop user chooses a local directory through the Desktop Runtime directory picker during conversation creation
- **THEN** the system registers a project record for that directory and binds the new conversation to the registered project

#### Scenario: Existing conversation lacks project binding
- **WHEN** a historical conversation without an explicit project binding is selected
- **THEN** the conversation remains readable and requires an explicit project binding before starting a new local run

### Requirement: Project binding visibility
The system SHALL make the conversation's selected project visible anywhere users need to understand local execution context.

#### Scenario: User views conversation header
- **WHEN** a conversation has a selected project
- **THEN** the header or adjacent context indicator shows the project display name and available repository context without requiring the user to open run details

#### Scenario: User opens conversation details
- **WHEN** the user opens conversation details for a project-bound conversation
- **THEN** the detail surface shows project name, local path label, owning runtime availability, and repository branch when available

#### Scenario: User inspects a run
- **WHEN** the user opens run detail for a local run
- **THEN** the run detail shows the project binding and resolved execution directory used for that run

### Requirement: Project directory privacy
The system SHALL store and synchronize local project metadata without uploading project source content.

#### Scenario: Desktop registers project from directory
- **WHEN** Desktop Runtime registers a project selected from a local directory
- **THEN** Control Plane stores project identity, display label, owning device, path label, and optional repository metadata without storing file contents

#### Scenario: Remote client views project list
- **WHEN** Web or iOS loads projects for a signed-in user
- **THEN** the client sees metadata and runtime availability but cannot access local source content through project metadata alone

### Requirement: Desktop-only local project creation
The system SHALL allow local project creation only from the Desktop client that owns the local directory.

#### Scenario: Desktop creates local project
- **WHEN** a Desktop user chooses a folder or AgentHub default directory during conversation creation
- **THEN** Desktop Runtime may register the project and expose its metadata for future conversation binding

#### Scenario: Web or iOS creates conversation
- **WHEN** a Web or iOS user creates a conversation
- **THEN** the client can select only existing Desktop-registered projects and cannot request local directory creation, default directory creation, or a remote directory picker

#### Scenario: Remote client has no projects
- **WHEN** Web or iOS opens the project picker and no existing project is available
- **THEN** the client explains that a local project must be added from Desktop before local-agent conversations can be created

### Requirement: Project selection validation
The system SHALL validate project availability before creating an executable local conversation.

#### Scenario: Selected project runtime is online
- **WHEN** the selected project is bound to an online Desktop Runtime
- **THEN** the new conversation can be created and local run actions may be enabled according to agent and permission state

#### Scenario: Selected project runtime is offline
- **WHEN** the selected project belongs to an offline Desktop Runtime
- **THEN** the user can create the conversation for history/planning but local run actions show an offline explanation until the runtime is available

#### Scenario: Directory selection fails
- **WHEN** Desktop Runtime cannot open, create, or validate the selected directory
- **THEN** the project selection flow reports the failure and does not create a conversation with an invalid project binding

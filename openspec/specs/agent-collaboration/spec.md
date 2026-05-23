## Purpose
Define AgentHub's agent identity model, IM-style conversation behavior, Orchestrator planning flow, run lifecycle, and result aggregation.
## Requirements
### Requirement: Agent identity model
The system SHALL model agents as product identities separate from their execution provider.

#### Scenario: Multiple agents share Claude Code provider
- **WHEN** the user creates Orchestrator, Architect, Implementer, and Reviewer agents backed by Claude Code
- **THEN** each agent retains its own name, role, prompt, capabilities, and policy while using the same provider adapter

### Requirement: IM-style conversations
The system SHALL support single-agent and group conversations with ordered messages, typed participants, and explicit agent membership.

#### Scenario: User opens a group conversation
- **WHEN** a user opens a group conversation
- **THEN** the client displays user messages, agent messages, Orchestrator messages, run events, plans, permissions, and artifacts in chronological context

#### Scenario: User views group participants
- **WHEN** a user opens chat information for a group conversation
- **THEN** the system exposes the participating agents for that conversation separately from all workspace agents

#### Scenario: User adds an agent to a group conversation
- **WHEN** a user adds an eligible workspace agent to the active group conversation
- **THEN** the agent becomes available for future targeting in that conversation without changing historical messages or completed run records

#### Scenario: User removes an agent from a group conversation
- **WHEN** a user removes an agent from the active group conversation
- **THEN** the agent is removed from future participant and targeting lists for that conversation while historical messages and run records remain visible

#### Scenario: Conversation membership is missing in a legacy snapshot
- **WHEN** a client receives a conversation snapshot without explicit membership data
- **THEN** the client falls back to the existing compatible participant behavior and remains usable

### Requirement: Explicit Orchestrator invocation
The system SHALL start orchestrated dispatch only when the user explicitly mentions Orchestrator or chooses an Orchestrator coordination action.

#### Scenario: User mentions a worker agent
- **WHEN** a user sends a message to a specific non-Orchestrator agent in a group conversation
- **THEN** the system routes the message to that agent without automatically invoking Orchestrator

#### Scenario: User mentions Orchestrator
- **WHEN** a user mentions Orchestrator for a task
- **THEN** the system starts Orchestrator planning for that conversation

### Requirement: Plan Mode
The system SHALL require Orchestrator to produce a dispatch plan before executing coordinated work in Plan Mode.

#### Scenario: Orchestrator creates plan
- **WHEN** Orchestrator receives a coordinated task in Plan Mode
- **THEN** it produces a plan containing goal, assumptions, assigned agents, task steps, dependencies, expected artifacts, and risk notes

#### Scenario: User approves plan
- **WHEN** the user approves a dispatch plan
- **THEN** the system dispatches the approved tasks to the assigned agents

#### Scenario: User requests plan revision
- **WHEN** the user asks Orchestrator to revise a dispatch plan
- **THEN** the system does not dispatch worker tasks until a revised plan is approved

### Requirement: Orchestrator output validation
The system SHALL validate Orchestrator planning and dispatch outputs against the AgentHub event schema.

#### Scenario: Orchestrator emits invalid dispatch plan
- **WHEN** Orchestrator output cannot be parsed as a valid dispatch plan
- **THEN** the system marks the plan invalid and requests regeneration or user intervention without dispatching worker agents

### Requirement: Result aggregation
The system SHALL allow Orchestrator to aggregate worker outputs into a final summary after assigned tasks complete.

#### Scenario: Worker agents complete tasks
- **WHEN** all assigned worker tasks finish or report terminal failure
- **THEN** Orchestrator can produce a final summary referencing completed work, blocked work, artifacts, and recommended next actions

### Requirement: Minimal runnable agent run lifecycle
The system SHALL support a minimal local agent run lifecycle through Control Plane and Desktop Runtime.

#### Scenario: User starts a local run
- **WHEN** the user sends a supported local task from the workbench
- **THEN** Control Plane creates a run, routes it to the online Desktop Runtime, and publishes run started state to connected clients

#### Scenario: Runtime emits run output
- **WHEN** the Desktop Runtime provider emits local run output
- **THEN** Control Plane appends normalized message or run events to the conversation timeline

#### Scenario: Local run completes
- **WHEN** the Desktop Runtime reports run completion
- **THEN** Control Plane marks the run completed and clients display the final run state in the timeline

### Requirement: Runnable demo remains provider-boundary driven
The runnable demo SHALL use provider adapter outputs rather than hardcoded client-side transcript fixtures for agent collaboration state.

#### Scenario: Client displays demo run output
- **WHEN** Web or Desktop displays output from a local demo run
- **THEN** the displayed messages and run states originate from Control Plane events produced by Desktop Runtime provider adapters

### Requirement: Direct agent runs publish provider-backed output
The system SHALL make direct worker-agent runs visible in the owning conversation using normalized provider events from the Desktop Runtime.

#### Scenario: Worker run streams output
- **WHEN** a user starts a direct run for a worker agent and the provider emits message output
- **THEN** the conversation timeline receives agent-authored output associated with that run and agent

#### Scenario: Worker run reaches terminal state
- **WHEN** the provider reports that the direct run completed or failed
- **THEN** the run record and conversation-visible run state reflect the terminal status for the same run id

#### Scenario: Provider output is normalized
- **WHEN** the configured provider is smoke mode or Claude Code mode
- **THEN** the conversation uses the same AgentHub run and message event model without exposing provider-specific output formats to the client

### Requirement: Conversation membership persistence
The system SHALL persist agent membership for each conversation so Desktop, Web, and future clients can render the same participants.

#### Scenario: Membership snapshot is loaded
- **WHEN** Control Plane returns a workbench snapshot for a conversation with explicit agent membership
- **THEN** the snapshot includes enough membership data for clients to distinguish participating agents from other workspace agents

#### Scenario: Membership changes are synchronized
- **WHEN** an agent is added to or removed from a conversation
- **THEN** connected clients receive updated conversation membership through snapshot refresh or event stream updates

### Requirement: Agent new conversation creation
The system SHALL support creating a new independent workspace-scoped single-agent conversation for a specific agent identity.

#### Scenario: New conversation is requested for an agent
- **WHEN** a client requests "新对话" for an eligible agent in a workspace
- **THEN** Control Plane creates a conversation with single-agent kind, explicit membership containing that agent, and no synthetic run output

#### Scenario: New conversation is requested for same agent
- **WHEN** a client requests "新对话" for an eligible agent that already has one or more single-agent conversations
- **THEN** Control Plane creates a distinct conversation with single-agent kind, explicit membership containing that agent, and no synthetic run output

#### Scenario: New conversation membership is loaded
- **WHEN** Control Plane returns a workbench snapshot for a newly created single-agent conversation
- **THEN** the snapshot identifies the single participating agent separately from all other workspace agents

### Requirement: Single-agent conversation routing
The system SHALL route messages sent in a single-agent conversation to the participating agent without requiring an explicit mention.

#### Scenario: User sends from single-agent conversation
- **WHEN** the user sends a prompt in a direct single-agent conversation
- **THEN** the run request targets the participating agent by agent id and appends resulting messages and run events to that conversation

#### Scenario: Single-agent conversation targets non-Orchestrator agent
- **WHEN** the participating agent is a non-Orchestrator worker agent
- **THEN** the system routes the prompt directly to that agent without automatically invoking Orchestrator

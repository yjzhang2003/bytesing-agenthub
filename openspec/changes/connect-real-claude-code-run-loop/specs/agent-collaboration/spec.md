## ADDED Requirements

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

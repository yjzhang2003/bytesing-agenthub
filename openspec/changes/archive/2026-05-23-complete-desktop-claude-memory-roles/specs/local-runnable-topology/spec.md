## MODIFIED Requirements

### Requirement: Local run loop smoke verification
The repository SHALL provide local smoke verification for the runnable topology.

#### Scenario: Fake Claude Code smoke
- **WHEN** the fake Claude Code smoke verifier runs
- **THEN** it proves provider preflight, run command delivery, fake provider output, and terminal run state without requiring a real Claude Code installation

#### Scenario: Agentmemory smoke
- **WHEN** the memory smoke verifier runs with a stub agentmemory service
- **THEN** it proves memory context injection and observation writes while keeping provider execution deterministic

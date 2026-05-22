## 1. Contracts and Test Fixtures

- [x] 1.1 Review shared run command, provider runtime event, AgentHub event, snapshot, and run schemas for the fields required by the closed loop.
- [x] 1.2 Add or tighten contract validation tests for run creation requests, `run.start` commands, `run.cancel` commands, provider status events, and provider message delta events.
- [x] 1.3 Add local test fixtures for smoke provider output and Claude Code adapter process output.

## 2. Control Plane Run Coordination

- [x] 2.1 Ensure run creation rejects unbound or offline runtime workspaces without enqueueing executable commands.
- [x] 2.2 Ensure run creation stores queued runs, emits run status events, and queues complete `run.start` commands for the bound runtime.
- [x] 2.3 Ensure provider status events update run lifecycle fields and publish running, streaming, completed, failed, and cancelled events.
- [x] 2.4 Ensure provider message delta events create conversation-visible agent messages and publish message delta events for the active conversation.
- [x] 2.5 Ensure cancellation marks runs as cancelling, queues `run.cancel`, and records the provider terminal result.
- [x] 2.6 Add Control Plane tests for successful smoke run loop, offline runtime rejection, provider failure, message delta recording, and cancellation command delivery.

## 3. Desktop Runtime and Provider Adapters

- [x] 3.1 Implement or tighten the runtime command polling loop so Desktop Runtime executes pending `run.start` and `run.cancel` commands for the registered device.
- [x] 3.2 Ensure Desktop Runtime publishes provider events for run start, output, completion, failure, and cancellation through the existing runtime events API.
- [x] 3.3 Ensure smoke provider mode produces deterministic output and terminal status through the same provider event contract as real providers.
- [x] 3.4 Ensure Claude Code mode fails explicitly when the configured binary is missing or exits unsuccessfully.
- [x] 3.5 Add Runtime and Claude Code adapter tests for command handling, fake process output, failed process exit, and cancellation.

## 4. Workbench Run Experience

- [x] 4.1 Wire the composer direct-agent send path to create a Control Plane run for the active workspace, conversation, agent, and prompt.
- [x] 4.2 Keep prompts retryable and execution disabled when runtime-dependent send is unavailable.
- [x] 4.3 Apply live run status and message delta events to Web client state without requiring a reload.
- [x] 4.4 Ensure snapshot reload recovers runs and messages after event stream disconnect or page refresh.
- [x] 4.5 Update UI component tests or rendered checks for online run start, streaming output, terminal state, offline runtime send blocking, and event recovery.

## 5. Local Verification and Documentation

- [x] 5.1 Extend `pnpm smoke:local` or add an equivalent local smoke command that verifies run creation, command delivery, provider event return, terminal state, and snapshot visibility.
- [x] 5.2 Document Claude Code mode setup with `AGENTHUB_PROVIDER_MODE=claude-code` and `AGENTHUB_CLAUDE_CODE_BIN`.
- [x] 5.3 Document failure recovery for missing Claude Code binary, offline runtime, Control Plane unavailability, and provider failure.
- [x] 5.4 Run package checks, targeted tests, smoke verification, and `openspec validate connect-real-claude-code-run-loop --strict`.

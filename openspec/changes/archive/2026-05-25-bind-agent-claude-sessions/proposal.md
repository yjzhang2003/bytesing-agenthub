## Why

AgentHub currently lets Claude Code session behavior be selected per run, which makes a single conversation feel inconsistent and exposes provider-specific session controls to users. A conversation should instead feel like a stable collaboration space where each participating agent keeps its own hidden Claude Code thread.

## What Changes

- Bind each Claude Code-backed agent in a conversation to one hidden Claude Code session record keyed by conversation and agent.
- Automatically create a session binding when a conversation is created with Claude Code agents or when a Claude Code agent is added to an existing conversation.
- Use lazy session materialization: create the AgentHub binding immediately, but store the provider session id only after the first successful Claude Code run reports it.
- Route subsequent runs for the same conversation-agent pair with `--resume <claudeSessionId>` once the provider session id is known.
- Remove ordinary composer exposure of manual session behavior and raw session id controls.
- Keep Claude Code session ids out of timeline cards, message bubbles, and normal run details; reserve them for diagnostics if needed.
- Preserve explicit advanced recovery actions for future reset/fork workflows without making them part of the normal send path.

## Capabilities

### New Capabilities
- `conversation-agent-claude-sessions`: Hidden Claude Code session binding for each conversation-agent pair, including lifecycle, resume behavior, and visibility rules.

### Modified Capabilities
- `agent-collaboration`: Conversation membership and run lifecycle must create and use per-agent Claude Code session bindings.
- `runtime-device-control`: Runtime commands and provider events must carry enough session information to resume and persist Claude Code sessions.
- `conversation-workbench`: The composer and run detail surfaces must stop exposing routine session id controls while preserving stable conversation behavior.

## Impact

- Control Plane data model: add an in-memory/persistent conversation-agent Claude session store.
- Control Plane run creation: resolve or create session bindings and inject resume options into runtime commands.
- Desktop Runtime Claude Code adapter: parse provider stream session ids and publish them back through normalized events.
- Contracts: extend runtime command/provider event schemas with optional provider session metadata.
- UI: remove high-frequency `sessionBehavior`/`sessionId` controls from the composer and keep session ids hidden from normal conversation surfaces.
- Tests: add coverage for conversation creation, agent membership changes, first-run session capture, subsequent-run resume, and UI non-disclosure.

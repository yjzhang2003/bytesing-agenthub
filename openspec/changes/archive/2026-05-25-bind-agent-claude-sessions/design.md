## Context

AgentHub has two conversation concepts today: the AgentHub conversation shown in the workbench, and the provider-specific Claude Code session controlled by `--continue`, `--resume`, and `--fork-session`. The UI currently treats Claude Code session behavior as a composer/run option, which makes provider session state visible at the wrong layer and allows one AgentHub conversation to contain unrelated Claude Code threads for the same agent.

The desired product model is that an AgentHub conversation is the user's collaboration space, while each participating Claude Code-backed agent owns one hidden Claude Code session inside that space. The Control Plane is the right owner for this binding because it already controls conversation membership, run creation, and runtime command routing. The Desktop Runtime is the right owner for provider process parsing because it already normalizes Claude Code stream output.

## Goals / Non-Goals

**Goals:**
- Create a stable `conversationId + agentId -> Claude Code session` binding for every Claude Code-backed participant.
- Keep Claude Code session ids hidden from normal user-facing surfaces.
- Resume subsequent runs for the same conversation-agent pair with the captured provider session id.
- Avoid calling Claude Code during conversation creation or membership changes.
- Preserve advanced future room for reset/fork without exposing manual session ids in the main composer.

**Non-Goals:**
- Do not make multiple agents share one Claude Code session.
- Do not preload or warm Claude Code sessions when conversations are created.
- Do not migrate historical runs into reconstructed Claude Code sessions.
- Do not make provider session ids part of ordinary timeline, composer, or run-card copy.
- Do not remove Claude Code's underlying `--resume` capability or contract support for diagnostics and advanced flows.

## Decisions

### Store session bindings in Control Plane

Control Plane will add a conversation-agent Claude session store keyed by `ownerUserId`, `workspaceId`, `conversationId`, and `agentId`. A record contains the provider mode, `claudeSessionId | null`, a snapshot of session-defining Claude Code options, timestamps, and the last run id.

Alternative considered: keep session ids only in the client. This would break across clients and reloads, and would expose provider session identity to the UI layer. Control Plane ownership keeps behavior consistent for Desktop and Web.

### Use lazy binding rather than eager prewarming

Conversation creation and agent add flows will create a binding record with `claudeSessionId = null`. The first run for that pair starts without `--resume`; when Desktop Runtime observes a Claude Code session id in the provider stream, it reports it back and Control Plane fills the binding. Later runs use `--resume <claudeSessionId>`.

Alternative considered: run a tiny Claude Code prompt at conversation creation to obtain a session id immediately. That would add latency, spend tokens, and create provider sessions for conversations the user may never execute.

### Treat session-defining options as binding-level state

`settingsSource`, permission preset, runtime profile, MCP profile, plugin profile, hooks policy, and tool allow/deny lists define the execution environment. The binding stores the effective snapshot used to create the provider session. Once a provider session id exists, ordinary sends reuse that snapshot instead of letting composer controls silently change the environment mid-session.

Alternative considered: keep every option per-run. That maximizes flexibility but makes "same agent in same conversation" unstable and can produce a resumed provider session with a different runtime environment than the one that created it.

### Keep effort as a run-level option unless product chooses otherwise

`effort` is less clearly session-defining than settings, MCP, or permissions. The initial implementation can continue to allow effective effort per run while still hiding raw session ids. If this proves confusing, it can later be promoted into the binding snapshot.

Alternative considered: freeze effort at first run. That is simpler conceptually but removes useful per-task control without clear safety benefit.

### Normalize provider session capture through runtime events

Desktop Runtime will parse Claude Code stream-json records for provider session metadata and publish a normalized event or metadata field containing the session id with the AgentHub run id. Control Plane will update only the binding for the matching owned run.

Alternative considered: parse provider output in Control Plane. Control Plane should remain provider-format agnostic and should not need raw Claude Code stream payloads.

### Hide session ids by default

Workbench composer will remove ordinary session behavior/session id controls. Timeline cards, message bubbles, and normal run detail rows will not display Claude session ids. Diagnostics can retain raw metadata for developers if needed, but normal users see stable conversation continuity rather than provider ids.

Alternative considered: show the session id in run detail. That makes debugging easier but conflicts with the product goal and risks users treating provider ids as controls.

## Risks / Trade-offs

- [Risk] Claude Code stream output may not always expose session ids in the same field. → Add parser coverage for known stream-json shapes and fail soft: if no id is captured, the next run starts a fresh provider session instead of exposing an invalid id.
- [Risk] A session-defining option changes after the first run. → Store the binding snapshot and require a future explicit reset/fork action to intentionally start a new provider session with changed settings.
- [Risk] Lazy binding means the first run cannot use `--resume`. → This is expected; the first run creates the provider session and subsequent runs resume it.
- [Risk] Historical conversations have no binding records. → Create bindings lazily on first post-change run for active participants and leave historical run records unchanged.
- [Risk] Provider session ids are sensitive implementation details. → Keep them out of default snapshots or expose only redacted/diagnostic fields.

## Migration Plan

1. Add contract types and schemas for conversation-agent Claude session bindings and provider session metadata.
2. Add Control Plane session binding storage and create bindings during conversation creation, agent add, and lazy run creation.
3. Update run creation to merge the binding snapshot and inject `session: { behavior: "continue", sessionId }` only when a captured id exists.
4. Update Desktop Runtime Claude Code parsing to capture session ids and publish normalized metadata.
5. Update UI composer controls to remove ordinary session behavior/session id selection and ensure normal surfaces do not show ids.
6. Add tests across contracts, Control Plane, Desktop Runtime, and UI.

Rollback is straightforward because existing run creation still works without session metadata; if session binding update fails, runs can continue without `--resume` while the binding feature is disabled.

## Open Questions

- Should `effort` be fixed in the binding snapshot or remain a per-run control?
- Should diagnostics show a redacted session id, a copyable id behind an explicit developer toggle, or no id at all?
- What explicit user-facing reset/fork actions should be added after the initial hidden-binding flow lands?

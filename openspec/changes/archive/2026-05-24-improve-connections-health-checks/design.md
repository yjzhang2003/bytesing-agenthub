## Context

Connections currently renders provider and memory health from the workbench snapshot. That data is useful, but memory and runtime health are lower-level implementation details: the Web client refreshes the snapshot, while Desktop Runtime owns the actual local checks for Claude Code and agentmemory. The UI also differs from the Chat and Agents management pages, which already use compact side-list/detail patterns.

This change makes Connections a first-class local capability status surface. It needs UI work, contracts for user-triggered checks, Control Plane routing, and Desktop Runtime execution because browser-only code cannot reliably inspect local binaries or local memory service reachability.

## Goals / Non-Goals

**Goals:**

- Make Connections visually and structurally consistent with Chat and Agents.
- Let users actively check user-facing provider connection health.
- Keep Desktop Runtime and agentmemory out of the Connections list while preserving their health data for internal availability and diagnostics.
- Show clear current states, in-progress states, timestamps, configuration values, and failure reasons.
- Route local checks through Control Plane to the owning Desktop Runtime.
- Preserve existing snapshot-based status as the cached/default view.
- Verify desktop and narrow Connections layouts in English and Simplified Chinese.

**Non-Goals:**

- Add Codex or any new provider implementation.
- Change provider run execution semantics.
- Add hosted account synchronization for connection settings.
- Build a separate component gallery or design-system documentation site.
- Require hosted Supabase credentials for local check verification.

## Decisions

### Decision 1: Connections uses the same side-list/detail management pattern as Agents

Connections should render a compact left list of user-facing provider identities and a right detail surface for the selected connection. The list should include Claude Code and disabled future provider slots, but not Desktop Runtime or agentmemory because those are lower-level dependencies rather than provider choices. The detail surface owns the status explanation, configuration rows, failure reason, and check actions.

Rationale: this keeps management pages predictable without exposing implementation plumbing as selectable product connections. Users already scan Agents through a dense list and edit/read detail state on the right; Connections is the same kind of management surface for providers.

Alternatives considered:
- Keep the current stacked cards. Rejected because it does not scale to more connections and diverges from the current Chat/Agents navigation rhythm.
- Move connection status into Settings only. Rejected because provider health is operational status, not just preference configuration.

### Decision 2: Active checks are explicit Control Plane requests

The Web client should request a connection check through Control Plane. Control Plane should either answer immediately for cloud-visible state such as runtime liveness or enqueue a runtime command for checks that require local access. Desktop Runtime should execute local checks and publish updated health.

Rationale: Claude Code binary resolution and agentmemory reachability are local machine concerns. The browser cannot perform them correctly, and the Control Plane is already the command broker between clients and Desktop Runtime.

Alternatives considered:
- Treat "Refresh status" as enough. Rejected because refreshing cached snapshot state does not prove the current connection is usable.
- Call local endpoints directly from Web. Rejected because Web may run on another device and must not assume access to the user's local machine or local service ports.

### Decision 3: Model check lifecycle separately from health status

Health remains `connected`, `missing`, `unavailable`, `misconfigured`, or `disabled`, while the UI may show a separate transient `checking` state for a requested check. If Desktop Runtime is offline, the check action should be disabled and explain that the runtime must be online.

Rationale: `checking` is not a health result. Keeping lifecycle and result separate prevents stale connected states from being overwritten by in-progress UI state.

Alternatives considered:
- Add `checking` to provider and memory health status enums. Rejected because health payloads represent observed results, not pending requests.

### Decision 4: Reuse existing preflight implementations where possible

Desktop Runtime should reuse `checkClaudeCodeProviderHealth` for Claude Code checks and `AgentMemoryClient.checkHealth()` for memory checks. The implementation should avoid duplicating preflight logic between startup registration and user-triggered checks.

Rationale: startup health and manual health checks should produce the same statuses, timestamps, and failure reasons.

Alternatives considered:
- Add separate UI-specific checks. Rejected because it would create conflicting health semantics.

### Decision 5: Check results update snapshot-visible health

After Desktop Runtime publishes a check result, Control Plane should store the latest provider or memory health in the same places currently used by snapshot and status endpoints. Clients can then refresh or receive relevant events and render the updated Connections state.

Rationale: Connections should not need a separate read model for manual checks. The current snapshot already carries provider and memory health.

Alternatives considered:
- Store check history as a separate timeline. Rejected for this change because the product need is current usability, not audit history.

## Risks / Trade-offs

- Runtime command expansion can blur run commands and operational commands → keep connection check commands small, typed, and non-run-producing.
- Manual checks may take several seconds or fail due to local environment changes → show in-progress state, preserve the last result, and surface fresh failure reasons.
- Event delivery may lag or be unavailable → the UI can fall back to refreshing the snapshot after check completion or timeout.
- Adding check-all can create multiple queued checks → coalesce each selected request into one runtime command when practical and keep disabled future providers out of check-all.
- Narrow layout may regress because Connections has two management columns → verify the list stacks above details and actions remain reachable without text overlap.

## Migration Plan

1. Update specs and contracts for connection check requests, runtime command handling, and result visibility.
2. Add Control Plane routes/registry behavior for requesting checks and storing fresh results.
3. Extend Desktop Runtime command handling to execute provider and memory checks.
4. Update Web client methods and wire Connections actions to check requests.
5. Redesign Connections UI using the Chat/Agents side-list/detail pattern.
6. Add i18n copy, UI behavior tests, Control Plane/runtime tests, and local smoke coverage where practical.

Rollback strategy: keep existing snapshot-rendered provider health as the fallback. If runtime command checks regress, remove or disable active check actions while preserving the redesigned read-only Connections page.

## Open Questions

- Should check results emit a new event type, or should clients rely on snapshot refresh after the request returns?
- Should Desktop Runtime checks be available for all registered runtime devices or only the active workspace-bound runtime in this change?
- Should check-all run provider and memory checks in parallel inside one command or enqueue one command per connection?

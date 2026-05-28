## Context

Connections currently uses a compact list/detail management layout shared with the Agents page. The data model already separates provider health, memory health, runtime status, and Claude Code discovery, but the UI flattens `Claude Code` and `Claude Code capabilities` into separate selectable rows. That exposes implementation details as top-level connections and makes the recovery path unclear when local setup is incomplete.

The existing check path is useful and should remain: Web requests `/connections/checks`, Control Plane queues local check commands, Desktop Runtime checks provider health or Claude Code discovery, and snapshots expose the latest results. The main gap is information architecture and setup guidance, not a missing transport.

## Goals / Non-Goals

**Goals:**

- Present Claude Code as one provider-level connection row.
- Show provider health, runtime gating, memory dependency, capability discovery, workspace Claude files, MCP, plugins, skills, hooks, and managed profile status inside the selected Claude Code detail surface.
- Add localized setup guidance that tells users the next action for each common blocking state.
- Preserve the current AgentHub visual language: compact list/detail layout, density, badges, read-only rows, buttons, and narrow behavior.
- Continue using existing connection check targets and backend routing unless implementation proves a small contract extension is required.

**Non-Goals:**

- Redesigning the Connections page into a new visual pattern.
- Adding automatic installation, login, or local configuration mutation.
- Making Desktop Runtime, agentmemory, or Claude Code capabilities top-level selectable connection rows.
- Uploading local Claude Code secrets, skill contents, hook command arguments, or workspace source content.

## Decisions

### Keep provider rows user-facing and dependency rows embedded

Connections should list user-recognizable provider integrations such as Claude Code and future Codex support. Desktop Runtime, agentmemory, and Claude Code capabilities are dependencies or diagnostics for those integrations, so they belong in provider detail groups.

Alternative considered: keep capabilities as a peer row and rename it. That still makes one provider appear as two user-facing connections and does not solve the setup-loop problem.

### Use grouped detail sections rather than a new page style

The Claude Code detail surface should add compact groups such as Status, Setup, Capabilities, Profiles, and Dependencies using the existing detail-row and button primitives. This keeps the page visually aligned with Chat, Agents, and the current Connections implementation.

Alternative considered: introduce a richer diagnostics dashboard with cards and timelines. That would be heavier than the problem requires and would violate the current constraint to avoid broad UI style changes.

### Derive recommended actions in the view model

The view model should normalize raw health/discovery states into user-facing setup guidance, disabled reasons, action labels, and check targets. Components should render these fields rather than re-implementing status interpretation.

Alternative considered: keep all branching in the React component. That would couple product semantics to markup and make it harder for Composer, Run detail, and future Settings surfaces to reuse the same explanations.

### Reuse existing check targets

Checking Claude Code from the detail surface can request `provider`, `claude-code`, or both depending on the action. The UI should preserve last known results while checks are pending, matching the current connection check behavior.

Alternative considered: add a new combined check target. That is only warranted if implementation finds the existing target set cannot represent the desired state; the current contracts already support provider health and capability discovery separately.

### Treat repair actions as guidance first

The first version should provide clear, localized instructions and re-check controls. It should not automatically run installs, login commands, or write Claude/MCP/profile files.

Alternative considered: add one-click repair. That crosses local trust and permissions boundaries and needs a separate proposal with explicit user consent and auditing.

## Risks / Trade-offs

- Existing tests may assume `claude-code-discovery` is a selectable row -> Update tests to assert discovery appears inside Claude Code detail instead.
- More detail in one surface can become dense -> Keep sections compact, collapsible only if existing patterns support it, and avoid nested cards.
- Recommended actions can drift from runtime errors -> Centralize mapping near the view model and cover representative statuses in tests.
- Existing backend errors may be too raw for setup guidance -> Use current normalized status/failure fields first; add narrowly scoped classification only if tests expose missing categories.
- Users may still need deeper diagnostics -> Keep raw diagnostics available in an advanced/detail row without making raw errors the primary guidance.

## Migration Plan

1. Update the Connections view model so the public item list contains Claude Code and disabled future providers only, while Claude Code detail includes capability and dependency groups.
2. Add localized recommended-action fields for provider, runtime, discovery, memory, and managed profile states.
3. Update Connections components to render grouped detail sections using existing AgentHub controls and current CSS density.
4. Keep existing check wiring, but allow the Claude Code detail surface to trigger provider and capability discovery checks as appropriate.
5. Update component, localization, and rendered verification tests for merged detail, checking state, offline gating, setup guidance, disabled future provider, narrow layout, and English/Simplified Chinese output.
6. Roll back by restoring the previous flattened `claude-code-discovery` row if the grouped detail causes regressions; backend state and contracts remain compatible.

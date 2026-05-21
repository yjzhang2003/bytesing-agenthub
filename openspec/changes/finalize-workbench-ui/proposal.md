## Why

AgentHub now has a runnable local topology, but the product workflow is still only partially fixed through docs and smoke data. Before deepening the real provider or persistence layers, the Desktop/Web MVP workbench needs a concrete UI contract so backend and runtime work can target the right interaction model.

## What Changes

- Define the Desktop/Web MVP workbench as the first production-facing surface.
- Convert existing UI documentation into explicit OpenSpec requirements for layout, navigation, timeline behavior, composer targeting, inspector modes, and responsive collapse.
- Establish the MVP UI state model for runtime availability, plan review, permission decisions, diff review, and run progress.
- Rework the visual direction around a Codex-like monochrome console with light and dark modes.
- Use open-source UI primitives and iconography rather than hand-rolling every surface from raw markup.
- Require implementation-oriented visual QA coverage for the critical UI states before the UI is considered complete.
- Keep iOS, team workflows, cloud runtime, deployment, GitHub PR workflows, and persistence out of scope for this change except where existing terminology must remain compatible.

## Capabilities

### New Capabilities

- `workbench-mvp-ui`: Covers the concrete Desktop/Web MVP workbench UI contract, including layout, major surfaces, interaction states, responsive behavior, and visual QA expectations.

### Modified Capabilities

- `conversation-workbench`: Tighten requirements for timeline composition, composer targeting, runtime-aware action states, and Context Inspector behavior.
- `ui-information-architecture`: Clarify that the MVP UI is workspace-first and Desktop/Web-first, with explicit exclusions from primary navigation.
- `visual-design-system`: Add MVP implementation requirements for compact professional styling, semantic states, keyboard accessibility, Codex-like light/dark theming, open-source UI primitives, and visual verification.

## Impact

- Affected code: `apps/web`, `apps/desktop`, `packages/ui`, and shared contract types used by workbench state.
- Affected docs: `docs/ui/*` may need updates or cross-links after implementation.
- Affected tests: UI state tests, component tests, and browser/screenshot verification for Desktop/Web layouts.
- No database schema, hosted auth, real Claude Code provider, iOS implementation, or external integration changes are required by this proposal.

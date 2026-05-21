## Context

AgentHub has a runnable local development topology with Control Plane, Desktop Runtime, Web, and Desktop shell. The current shared UI package already exposes a basic three-column workbench, runtime badge, conversation list, timeline, plan card, permission card, diff card, and composer. Existing UI docs define strong product direction, but the implementation still lacks a complete MVP UI contract for the states a user will encounter when running AgentHub locally.

This change turns the current docs and skeleton into an implementation-ready Desktop/Web UI target. It deliberately keeps execution provider integration, persistence, iOS implementation, cloud runtime, team spaces, and external integrations outside the scope so the next work can validate the product flow before backend complexity increases.

## Goals / Non-Goals

**Goals:**

- Make the Desktop/Web workbench the first real app surface, not a placeholder or landing page.
- Define a complete MVP layout contract for left navigation, center timeline/composer, and right Context Inspector.
- Define UI behavior for online, offline, running, blocked, loading, empty, error, and selected states.
- Make Orchestrator targeting, direct agent targeting, plan review, permission decisions, diff review, and runtime detail discoverable from one workbench.
- Replace the raw custom visual layer with a Codex-like monochrome UI direction using open-source primitives where useful.
- Support both dark and light modes from the first MVP UI pass.
- Establish visual QA checkpoints so implementation can be reviewed through concrete UI states and responsive layouts.

**Non-Goals:**

- Implement real Claude Code provider execution.
- Persist workbench data to Supabase or another database.
- Build iOS UI screens.
- Add team spaces, GitHub pull request flows, deployment publishing, cloud runtime, web preview hosting, or public sharing.
- Create a marketing page, landing page, dark mode parity, or decorative brand system.

## Decisions

### Decision: Ship a Desktop/Web-first workbench slice

The next UI work SHALL focus on `packages/ui`, `apps/web`, and the Desktop shell that loads the Web client. This is the fastest path to validate the product model because the runnable local topology already feeds Web/Desktop snapshot data.

Alternatives considered:

- Build iOS in parallel. Rejected for this change because it introduces a separate platform and navigation model before the core workbench has been proven.
- Start with a pure design-system pass. Rejected because tokens alone do not validate the actual agent workflow.

### Decision: Treat the Context Inspector as the primary detail surface

Plans, permissions, diffs, runtime details, and artifacts SHALL open in the right Context Inspector at desktop widths. This keeps the conversation visible while the user reviews decisions and output.

Alternatives considered:

- Use full-screen routes for every detail. Rejected because it breaks conversation context for routine review.
- Put all details inline in the timeline. Rejected because plans, permissions, and diffs can become too dense and make the timeline hard to scan.

### Decision: Use Control Plane snapshot data first, with typed UI view models

The UI SHALL derive MVP view models from the current workbench snapshot and demo/smoke events before requiring persistent storage. Missing backend data can be represented through explicit empty, unavailable, or metadata-only states.

Alternatives considered:

- Wait for persistence first. Rejected because the UI can validate object boundaries before storage decisions.
- Hardcode a separate client-only transcript. Rejected because the runnable demo should remain provider-boundary driven where data exists.

### Decision: Visual quality is part of done

The implementation SHALL be reviewed against core state screenshots or equivalent browser checks. The workbench must remain compact, light-first, keyboard navigable, and free of marketing or generic AI visual patterns.

Alternatives considered:

- Rely only on unit tests. Rejected because layout density, text overflow, responsive collapse, and visual state clarity require rendered verification.

### Decision: Use open-source primitives without adopting a heavy branded framework

The visual layer SHALL use small composable open-source primitives and icons, starting with Radix primitives and lucide icons inside `@agenthub/ui`. Styling remains owned by AgentHub semantic tokens so the product can match a Codex-like monochrome console rather than inheriting an Ant Design, MUI, or marketing-dashboard look.

Alternatives considered:

- Continue with raw custom markup only. Rejected because the first pass became visually noisy and harder to refine consistently.
- Adopt a full strong-style component framework. Rejected because those frameworks impose too much visual language for a Codex-like developer tool.

## Risks / Trade-offs

- UI may expose states that backend does not fully support yet -> Represent unsupported details as explicit empty, metadata-only, offline, or unavailable states rather than inventing fake behavior.
- Workbench scope can grow into full product design -> Keep this change limited to Desktop/Web MVP surfaces and the local runnable flow.
- Diff and permission flows may need future backend fields -> Define UI placeholders and contracts without requiring persistence or real provider integration in this change.
- Visual QA can become brittle -> Use screenshots and focused browser checks for core states instead of pixel-perfect assertions.

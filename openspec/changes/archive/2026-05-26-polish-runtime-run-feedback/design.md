## Context

AgentHub currently has a working local run path from the Web/Desktop composer through Control Plane into Desktop Runtime and the Claude Code provider adapter. The workbench can start runs and reflect live run status, but the UI still treats runtime audit metadata as timeline content. Failed Claude Code runs can surface raw stderr, including authentication setup messages, directly in the conversation stream.

The right Context Inspector also mixes two interaction models: it is a fixed desktop sidebar, but it is also used as a contextual detail surface for chat info, run details, diffs, permissions, and future operational views. The next step is to make the detail surface explicitly driven by header actions and timeline selection while keeping the current inspector data model useful.

## Goals / Non-Goals

**Goals:**

- Present run events in the timeline as concise user-facing state, not raw runtime audit data.
- Preserve detailed run metadata in Run detail for troubleshooting and audit.
- Classify Claude Code CLI authentication failures and show a setup-focused explanation.
- Make composer-selected Claude Code settings visibly traceable on the resulting run.
- Add a header detail action area that can open Conversation Info and Run Detail now and expand to more detail types later.
- Let overlay/drawer detail presentations close by clicking outside the detail surface.

**Non-Goals:**

- Replace Claude Code's own permission system or implement full AgentHub-native command approval in this change.
- Add new provider support beyond the existing Claude Code and Codex placeholder model.
- Redesign the entire navigation layout or remove the existing Context Inspector model.
- Persist a new run history database model beyond the current Control Plane snapshot/run state.

## Decisions

### Use a header detail action model

The center header will own an explicit detail action group. Initial actions are Conversation Info and Run Detail. The action group updates the same detail surface used by timeline selections.

Rationale: this separates "which detail am I looking at?" from "is the sidebar collapsed?", and gives the UI a stable extension point for future Diff, Artifacts, Permissions, and Runtime actions.

Alternative considered: keep a single right-sidebar toggle and add content inside the existing panel. That keeps less UI state, but it makes future actions harder to discover and keeps Conversation detail coupled to panel chrome.

### Treat run timeline cards as summaries

Timeline run events will use display labels derived from run status, agent name, and high-level selected settings. Raw identifiers, session ids, override source names, and profile internals will not appear in the timeline by default.

Rationale: the timeline is the conversation surface. It should be scannable and safe for normal users, while Run detail can still expose technical fields where they are useful.

Alternative considered: hide run events entirely and only show agent messages. That would make failures and queued/running state less visible.

### Keep technical metadata in Run detail

Run detail will show the effective permission preset, effort, settings source, profile labels, MCP profile, timing, agent, and failure category. Low-level audit fields can be grouped as diagnostics or advanced metadata.

Rationale: troubleshooting still requires access to the actual run configuration, but it should not pollute the primary chat stream.

### Classify Claude Code auth failures near the runtime boundary

Claude Code stderr that clearly indicates an unauthenticated CLI, such as "Not logged in" and "Please run /login", will be normalized into a user-facing failure category. The original failure text can remain available for diagnostics.

Rationale: this is a provider setup problem, not an agent response. Classifying it before view rendering lets Run detail and Connections share the same explanation.

Alternative considered: classify only in the UI view-model. That is cheaper, but it duplicates logic and makes it harder for Connections and future clients to present the same state.

### Preserve run creation API shape unless classification needs metadata

The first implementation path should avoid a broad contract change. If a typed failure category is needed, it should be added as optional metadata so existing clients keep working.

Rationale: the current run event and snapshot model already carries status and failure reason. This change is mostly presentation and normalization.

## Risks / Trade-offs

- [Risk] Header detail actions could duplicate timeline selection behavior. -> Mitigation: use one shared `InspectorSelection`/detail state path so header actions and timeline clicks select the same detail modes.
- [Risk] Redacting timeline metadata could hide useful debugging context. -> Mitigation: keep the data in Run detail diagnostics and cover that path in UI tests.
- [Risk] Claude Code authentication messages may vary by CLI version. -> Mitigation: match conservative phrases first and fall back to generic provider failure text when the error is unknown.
- [Risk] Click-outside dismissal can accidentally close a detail drawer while editing conversation fields. -> Mitigation: only close on backdrop/blank-surface clicks outside the panel, not clicks inside form controls or detail content.

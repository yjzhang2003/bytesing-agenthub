## Why

The current workbench exposes internal runtime identifiers and implementation audit fields in the conversation timeline, while Claude Code authentication failures appear as raw provider stderr such as "Not logged in. Please run /login". This makes normal local run failures look like agent conversation content and leaves users unsure whether composer controls such as permission mode and effort actually affected the run.

The right-side conversation detail surface also behaves like a fixed sidebar instead of a contextual detail layer, which limits future expansion for run details, diffs, permissions, artifacts, and runtime diagnostics.

## What Changes

- Replace raw run timeline labels with human-readable run status summaries that do not expose UUIDs, session ids, override source names, or low-level audit fields by default.
- Keep technical run metadata available in Run detail as diagnostic/audit information instead of primary timeline content.
- Detect Claude Code CLI authentication failures and present them as setup-focused provider/auth issues in Run detail and connection diagnostics.
- Clarify the composer run settings loop by showing which permission preset, effort, profiles, and settings source were used for the submitted run.
- Rework the right-side detail surface so the workbench header exposes explicit detail action buttons, starting with Conversation Info and Run Detail.
- Change Conversation detail dismissal so overlay/drawer presentations close when the user clicks outside the detail surface, not through a primary right-sidebar collapse button.
- Allow timeline selections and header action buttons to drive the same detail surface, creating an extension point for future Diff, Artifacts, Permissions, and Runtime detail actions.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `conversation-workbench`: Update timeline run presentation, contextual detail surface behavior, header detail actions, and run detail entry points.
- `connection-health-checks`: Add user-facing handling for Claude Code CLI authentication/setup failures surfaced by runtime runs and provider diagnostics.
- `permission-gateway`: Clarify composer-selected Claude Code permission/effort settings as effective run settings with visible feedback after submission.

## Impact

- Affected UI code: workbench header actions, Context Inspector/detail surface, timeline run cards, Run detail, composer feedback, and related view-model mapping.
- Affected runtime/control-plane behavior: failure reason classification or normalization for Claude Code authentication errors, without changing the run command API shape unless needed.
- Affected tests: UI rendering tests for redacted timeline content and detail routing; app-state/control-plane tests for run option propagation; runtime adapter tests for auth failure classification.
- No new external dependencies are expected.

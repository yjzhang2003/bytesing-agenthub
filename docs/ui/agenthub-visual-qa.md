# AgentHub Visual QA Checklist

## Required Screens

Capture or verify these states before UI implementation is considered complete:

- Workspace workbench with online runtime.
- Workspace workbench with offline runtime.
- Active multi-agent group chat.
- Orchestrator draft plan awaiting approval.
- Dispatched plan with active worker runs.
- Pending permission queue with multiple requests.
- Inline permission request in conversation.
- Diff review in Context Inspector.
- Full-screen diff review.
- iOS workspace home.
- iOS conversation detail.
- iOS plan detail.
- iOS permission review.
- iOS diff file list and single-file diff detail.

## Visual Constraints

The implementation must not include:

- Marketing landing pages as the main app entry.
- Decorative hero sections.
- Oversized dashboard cards for routine controls.
- Generic purple or purple-blue gradients as a dominant theme.
- Decorative orb, bokeh, or blob backgrounds.
- Cards nested inside cards.
- Text that overflows buttons, cards, or navigation rows.
- UI elements that overlap incoherently at supported view sizes.

## State Coverage

Verify each core component has:

- Loading state.
- Empty state.
- Offline state.
- Blocked state.
- Error state.
- Success state.
- Warning state.
- Selected state.
- Focused state.
- Disabled state.

## Product Language Consistency

Use the same object names across Desktop, Web, and iOS:

- Workspace.
- Runtime.
- Conversation.
- Agent.
- Orchestrator.
- Run.
- Plan.
- Permission.
- Artifact.
- Diff.
- Context Inspector.

Use the same Plan states:

- Draft.
- Invalid.
- Approved.
- Revision requested.
- Cancelled.
- Dispatched.
- Completed.
- Failed.

Use the same Permission states:

- Pending.
- Allowed once.
- Denied.
- Expired.
- Blocked.
- Completed.

Use the same Diff states:

- Metadata only.
- Loading full diff.
- Available.
- Offline.
- Stale.
- Cached.
- Error.

## MVP Out Of Scope

Do not design or implement MVP UI for:

- Dark mode parity.
- Team spaces.
- GitHub pull request workflows.
- Deployment publishing.
- Web preview hosting.
- Cloud runtime execution.
- Public sharing.

These can appear only as future notes in design docs or disabled settings placeholders.

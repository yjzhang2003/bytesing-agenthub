# AgentHub Core Interactions

## Plan Mode

Plan Mode starts when the user explicitly mentions Orchestrator or chooses coordinated execution.

### Timeline Plan Card

Compact content:

- Plan title or task goal.
- Plan state.
- Assigned agents.
- Step count and progress.
- Risk summary.
- Primary action: open plan.
- Pending action badge when approval or revision is required.

### Inspector Plan Detail

Required sections:

- Goal.
- Assumptions.
- Steps.
- Assigned agents.
- Dependencies.
- Expected artifacts.
- Risk notes.
- Current progress.
- Actions.

Plan actions:

- Approve.
- Ask to revise.
- Cancel.

Plan states:

- `draft`: awaiting approval.
- `invalid`: schema or validation issue.
- `approved`: user approved, dispatch can begin.
- `revision-requested`: waiting for Orchestrator revision.
- `cancelled`: user cancelled before completion.
- `dispatched`: worker runs started.
- `completed`: work and summary complete.
- `failed`: plan or dispatch failed.

## Permission Interactions

Permission requests appear in two places:

- Inline at the point where the requesting agent action occurs.
- In a global pending permission queue.

### Inline Permission Card

Required content:

- Requesting agent.
- Action type: file write, command, sensitive access, deployment placeholder.
- Action summary.
- Workspace.
- Risk level.
- Related run and plan when present.
- Decision state.
- Actions when pending.

MVP actions:

- Allow once.
- Deny.

Permission states:

- `pending`: user decision required.
- `allowed-once`: approved only for this action.
- `denied`: user denied request.
- `expired`: request timed out.
- `blocked`: run cannot continue until decision or alternate action.
- `completed`: approved action finished.

### Global Permission Queue

Desktop/Web:

- Accessible from header or Context Inspector.
- Shows all pending permissions for active workspace.
- Can filter by conversation or run.
- Supports keyboard navigation.

iOS:

- Accessible from workspace home and conversation header.
- Uses a list or sheet of pending permissions.

The queue must include enough context to decide without returning to the original message, but each item links back to source context.

## Diff Review

### Timeline Diff Card

Required content:

- Changed file count.
- Insertions and deletions.
- Run association.
- Base commit or current branch when available.
- Stale/offline indicator when applicable.
- Open review action.

### Right-panel Diff Review

Required layout:

- Header with run, branch, base commit, and status.
- File list with changed paths and line counts.
- Selected file diff.
- Metadata and warnings.
- Actions: refresh, open full-screen, copy path.

### Full-screen Diff Review

Use when:

- User explicitly opens full-screen.
- Diff is too large for comfortable side-panel review.
- User wants focused review.

Requirements:

- Clear return path to conversation.
- File list remains available.
- Selected file diff has stable scrolling.
- Stale/offline warning remains visible.

### Diff States

- `metadata-only`: summary exists but full diff is unavailable.
- `loading-full-diff`: runtime request in progress.
- `available`: full diff loaded.
- `offline`: runtime unavailable.
- `stale`: runtime reports changed git fingerprint.
- `cached`: temporary full diff cache is being shown.
- `error`: diff request failed.

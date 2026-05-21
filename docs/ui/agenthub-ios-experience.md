# AgentHub iOS Experience

## Principle

iOS is an experience-isomorphic native client. It uses SwiftUI and mobile navigation, but it keeps the same product objects, state names, and action labels as Desktop/Web.

iOS is not a read-only companion and not a WebView wrapper. It can view conversations, inspect plans, approve or deny permissions, review diffs, cancel runs, and understand runtime state. It cannot execute local Claude Code without an online Desktop Runtime or future cloud runtime.

## Navigation

Top-level structure:

- Workspace list.
- Workspace home.
- Conversations.
- Runs.
- Agents.
- Settings.

Workspace home shows:

- Active workspace.
- Runtime status.
- Pending permission count.
- Active runs.
- Recent conversations.
- Recent artifacts or diff summaries.

Conversation detail shows:

- Runtime status in the header.
- Agent participants.
- Timeline.
- Composer.
- Pending permission affordance.

Inspector details become:

- Pushed detail screens for plans, diffs, artifacts, runs, and runtime.
- Bottom sheets for quick permission review or compact plan actions when appropriate.

## Conversation Parity

iOS timeline supports:

- User messages.
- Agent messages.
- Orchestrator messages.
- Run events.
- Plan summary cards.
- Permission cards.
- Diff cards.
- Artifact cards.

Cards are narrower and more compact than Desktop/Web but must keep the same core fields and state names.

## Plan Mode on iOS

Plan summary appears in the conversation timeline.

Plan detail opens as:

- A pushed detail screen for full review.
- A bottom sheet for quick approve, revise, or cancel when the user opens from a notification or pending action.

Plan detail includes:

- Goal.
- Steps.
- Assigned agents.
- Dependencies.
- Risks.
- Expected artifacts.
- State and progress.
- Approve, ask to revise, cancel actions when valid.

## Permissions on iOS

Permission review surfaces:

- Inline permission card in conversation.
- Pending permissions list from workspace home.
- Header badge in active conversation.
- Optional notification deep link later.

Permission detail includes:

- Agent.
- Action type.
- Command or file summary.
- Workspace.
- Risk.
- Related run.
- Allow once and deny actions.
- Timeout or expired state.

If runtime is offline, permission actions are disabled or explained depending on request state.

## Diff Review on iOS

Flow:

1. Open diff card.
2. Show changed-file list and summary.
3. Open single file diff detail.
4. Return to file list or conversation.

The file list shows changed paths, line counts, and stale/offline/cache state.

The file detail uses monospace text, stable line wrapping or horizontal scrolling, and semantic added/removed/context colors.

## Runtime Limitation Messaging

When Desktop Runtime is offline:

- History remains visible.
- Plans can be reviewed.
- Permissions can show current state but may not be actionable if the runtime cannot receive the decision.
- Full diff content may be unavailable.
- New execution actions explain that the Desktop Runtime must be online.

Use direct copy such as: `Desktop Runtime is offline. Bring the workspace device online to run agents or load full diffs.`

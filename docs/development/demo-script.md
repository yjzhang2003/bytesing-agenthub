# AgentHub MVP Demo Script

## Goal

Show the complete MVP loop across Desktop, Web, and iOS surfaces using one personal account and one local Desktop Runtime.

## Script

1. Sign in to AgentHub.
2. Show the active workspace and online Desktop Runtime.
3. Open the AgentHub demo group conversation.
4. Mention Orchestrator and request a small code change.
5. Show Orchestrator Plan Mode with assigned agents and expected diff artifact.
6. Approve the plan.
7. Show worker run creation and active run state.
8. Show a permission request for file or command access.
9. Approve with `Allow once`.
10. Show code/diff artifact metadata in the conversation.
11. Open the diff review surface.
12. Show iOS mobile surfaces for workspace, conversation, plan, permission, and diff review.

## Demo Notes

- Desktop Runtime is the only local execution boundary.
- Web and iOS control the same workflow through account-backed state.
- Source files and durable full diffs remain local by default.
- Mock providers are not product core; test fakes live behind the provider adapter boundary.


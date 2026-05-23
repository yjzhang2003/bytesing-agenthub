## Why

Agents already have a contact-style detail surface, but creating a fresh conversation with a specific agent still requires the user to shift context back into the chat workbench and choose a target manually. AgentHub should make this feel like an IM contact experience: open an agent, choose "新对话", and immediately land in a new single-agent chat surface.

## What Changes

- Add a primary "新对话" affordance on the Agent detail surface for existing runnable agents.
- When the user chooses "新对话", always create a new single-agent conversation for that agent, even if other conversations with that agent already exist.
- Keep continuing existing conversations as a Chat concern: users find prior same-agent conversations through Chat search or the conversation list.
- Switch the workbench into the Chat view with the newly created conversation selected.
- Preselect the corresponding agent as the conversation participant and composer target so the user can send the first message directly.
- Preserve IM-style behavior: the conversation appears in the chat list, keeps ordered messages and run events, and exposes the single agent in chat information.

## Capabilities

### New Capabilities

- None

### Modified Capabilities

- `conversation-workbench`: Agents view gains a "新对话" path that creates a new single-agent conversation and moves the user into the active chat context.
- `agent-collaboration`: Single-agent conversation membership and routing must support multiple independent conversations with the same agent identity.
- `workbench-mvp-ui`: MVP UI must expose and verify the Agent detail new-conversation flow, Chat search/selection for continuing conversations, and resulting chat selection/composer state.

## Impact

- Desktop/Web Agent detail UI, left navigation conversation list, center Chat view selection, and composer targeting state.
- Control Plane conversation creation path for workspace-scoped single-agent conversations.
- Workbench snapshot/event refresh behavior after a new conversation is created for the same agent.
- Existing direct run routing remains provider-boundary driven; no new provider dependency is introduced.

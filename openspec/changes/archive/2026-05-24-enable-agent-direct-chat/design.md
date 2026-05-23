## Context

AgentHub already models agents as product identities and conversations as IM-style single-agent or group chats. The current Agents center view is contact-like, but it stops at configuration: the user can inspect and edit an agent, then must return to Chat and manually target that agent to begin work.

The change connects those surfaces. An existing runnable agent should behave like an IM contact for starting fresh work: selecting "新对话" from the Agent detail creates a new one-to-one conversation in the Chat view and prepares the composer for that agent. Continuing previous conversations should stay in the Chat surface, where users can search or select prior same-agent threads.

## Goals / Non-Goals

**Goals:**

- Let Desktop/Web users create a new independent single-agent conversation directly from an existing Agent detail through a primary "新对话" action.
- Always create a new single-agent conversation with explicit membership from the Agent detail action.
- Keep continuation of previous same-agent conversations discoverable through Chat search and the conversation list.
- Switch navigation state to Chat, select the conversation, and target the selected agent in the composer.
- Keep newly created and previous same-agent conversations visible in the normal chat list and chat information surface.

**Non-Goals:**

- Replacing group chat participant management.
- Changing Orchestrator invocation rules.
- Adding a new provider adapter or direct provider call from the UI.
- Starting execution automatically before the user sends a message.
- Enforcing a one-agent-one-conversation uniqueness rule.
- Designing mobile-native behavior beyond existing responsive workbench rules.

## Decisions

1. Make Agent detail creation-only for conversations.

   The Agent detail entry should be "新对话" and must always create a fresh single-agent conversation. Continuing old conversations belongs in Chat, because Chat owns conversation history, search, recency, and thread selection. Alternative considered: a primary "对话" action that opens the latest same-agent conversation; rejected because the Agent page is about agent identity/configuration and recency-based continuation can surprise users when multiple task threads exist.

2. Keep the workflow Control Plane-backed.

   The client action should ask Control Plane to create a new conversation for the agent, then consume the updated snapshot or response to select it. This keeps membership persistence, conversation identity, and future multi-client synchronization centralized. Alternative considered: create a local placeholder conversation in UI state first; rejected because it risks diverging from the authoritative conversation id and membership model.

3. Treat conversation open as navigation plus draft context, not execution.

   After the conversation opens, the composer is focused and targets the agent, but no run starts until the user sends a prompt. This preserves runtime-disabled behavior, permission flow, and explicit user intent. Alternative considered: open a chat and immediately send a templated first message; rejected because the user's first prompt is still unknown.

4. Surface the action only for existing runnable agents.

   The primary action belongs on existing agent details. Create flows and archived/non-runnable agents should not create conversations until the agent identity is saved and eligible for participation. Alternative considered: allow chat during agent creation using a draft agent; rejected because draft identities cannot be persisted as stable conversation members.

## Risks / Trade-offs

- The chat list can become ambiguous when several conversations have the same agent -> Show enough conversation title or recent-message context to distinguish threads while keeping the agent identity clear.
- Users may expect Agent detail to continue a previous conversation -> Keep Chat search and the conversation list as the explicit continuation path, and make the Agent detail label clearly "新对话".
- UI state can switch before the snapshot includes the new conversation -> Allow the response to provide the conversation id and refresh/merge the snapshot before selecting.
- Archived or disabled agents may still appear in old conversations -> Preserve existing history, but prevent creating new conversations from ineligible agent states.
- Runtime offline state may confuse users after opening chat -> Reuse existing composer disabled explanations so history remains readable while execution is blocked.

## Migration Plan

Existing conversations remain valid. No data migration is required. Direct single-agent conversations are not unique by agent id; the selected conversation id remains the durable identity, and agent id is membership.

Rollout can be incremental: add the Control Plane create-new path, wire the Agent detail action, then verify that existing Chat search/list, composer targeting, and chat information behavior remain unchanged for group chats and previous same-agent conversations.

## Open Questions

- Should newly created same-agent conversations receive an automatic topic-style title after the first user message, or should they remain agent-name based until explicit rename support exists?

## 1. Control Plane Agent Conversations

- [x] 1.1 Add a Control Plane method for the Agent detail "新对话" action that always creates a distinct `single-agent` conversation with explicit participant membership for the selected agent.
- [x] 1.2 Ensure the new conversation path does not reuse existing same-agent conversations.
- [x] 1.3 Ensure same-agent single-agent conversations can coexist and are distinguished by conversation id rather than agent id uniqueness.
- [x] 1.4 Reject or hide conversation creation for archived, unsaved, or non-runnable agents while preserving historical conversations.
- [x] 1.5 Add or update request/response schemas and API path exports for the "新对话" action.

## 2. Workbench State Integration

- [x] 2.1 Add a client action that calls the "新对话" endpoint from Agent detail and refreshes or merges the returned conversation into the workbench snapshot.
- [x] 2.2 Switch the active center view to Chat and select the returned conversation id after the action completes.
- [x] 2.3 Preselect the direct conversation's participating agent as the composer target without sending a prompt automatically.
- [x] 2.4 Ensure runtime-offline composer disabled behavior and draft preservation work after the new-conversation navigation.
- [x] 2.5 Ensure multiple same-agent single-agent conversations appear as separate threads in the normal conversation list and chat information inspector, and remain discoverable through Chat search/list selection.

## 3. Agent Detail UI

- [x] 3.1 Add a primary "新对话" affordance to existing runnable Agent detail surfaces in `packages/ui/src/components/agents.tsx`.
- [x] 3.2 Do not add an Agent detail action for continuing or reopening previous same-agent conversations.
- [x] 3.3 Keep create-mode, archived, or otherwise ineligible agent details from presenting conversation actions as primary available actions.
- [x] 3.4 Add loading, success navigation, and failure feedback for the new-conversation action using existing AgentHub UI patterns.
- [x] 3.5 Localize conversation labels and feedback in the existing English and Simplified Chinese product chrome.

## 4. Verification

- [x] 4.1 Add unit or integration coverage for same-agent new conversation creation and membership persistence.
- [x] 4.2 Add UI coverage for Agent detail "新对话" activation, Chat view selection, Chat search/list continuation path, and composer target readiness.
- [x] 4.3 Verify existing group chat membership management and Orchestrator invocation behavior remain unchanged.
- [x] 4.4 Capture rendered verification for agent conversation flows in online, runtime-offline, same-agent new conversation creation, prior conversation discovery from Chat, and Simplified Chinese states.

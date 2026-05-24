import { createRoot } from "react-dom/client";
import { AgentHubWorkbench } from "@agenthub/ui";
import { type WorkbenchSnapshot } from "@agenthub/contracts";
import {
  applyAgentHubEventToSnapshot,
  connectionCheckTimestamps,
  createRunRequestFromSnapshot,
  hasFreshConnectionCheckResults,
} from "./app-state.js";
import { createDefaultWebControlPlaneClient } from "./control-plane-client.js";
import React from "react";

const CONNECTION_CHECK_POLL_INTERVAL_MS = 500;
const CONNECTION_CHECK_MAX_POLLS = 20;

function wait(milliseconds: number): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, milliseconds));
}

function AgentHubWebApp(): React.ReactElement {
  const [snapshot, setSnapshot] = React.useState<WorkbenchSnapshot | undefined>();
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const client = React.useMemo(() => createDefaultWebControlPlaneClient(), []);

  const loadSnapshot = React.useCallback(
    async (options: { readonly showLoading?: boolean } = {}) => {
      if (options.showLoading) {
        setLoading(true);
      }
      setError(null);
      try {
        const nextSnapshot = await client.getSnapshot();
        setSnapshot(nextSnapshot);
        return nextSnapshot;
      } catch (caught) {
        setError(caught instanceof Error ? caught.message : "Unable to reach Control Plane");
        return undefined;
      } finally {
        setLoading(false);
      }
    },
    [client],
  );

  React.useEffect(() => {
    void loadSnapshot({ showLoading: true });
    const stream = client.openEvents((event) => {
      setSnapshot((current) => (current ? applyAgentHubEventToSnapshot(current, event) : current));
    });
    stream.onerror = () => {
      setError("Control Plane event stream disconnected");
      void loadSnapshot();
    };
    return () => stream.close();
  }, [client, loadSnapshot]);

  return (
    <AgentHubWorkbench
      error={error}
      loading={loading}
      onRetry={() => void loadSnapshot({ showLoading: true })}
      onSend={(message, target, claudeCode) => {
        const active = snapshot;
        if (!active) {
          return;
        }
        void client
          .createRun(createRunRequestFromSnapshot(active, target, message, claudeCode))
          .then(() => loadSnapshot());
      }}
      onCreateAgentRole={(input) => {
        const active = snapshot;
        if (!active) {
          return;
        }
        void client
          .createAgent({
            workspaceId: active.activeWorkspaceId,
            displayName: input.displayName,
            role: input.role,
            systemPrompt: input.systemPrompt,
            capabilityTags: input.capabilityTags,
            policy: input.policy,
          })
          .then(() => loadSnapshot());
      }}
      onUpdateAgentRole={(input) => {
        void client
          .updateAgent(input.agentId, {
            displayName: input.displayName,
            role: input.role,
            systemPrompt: input.systemPrompt,
            capabilityTags: input.capabilityTags,
            policy: input.policy,
          })
          .then(() => loadSnapshot());
      }}
      onArchiveAgentRole={(agentId) => {
        void client.archiveAgent(agentId).then(() => loadSnapshot());
      }}
      onCreateAgentConversation={(agentId) => {
        const active = snapshot;
        if (!active) {
          return;
        }
        return client
          .createAgentConversation({
            workspaceId: active.activeWorkspaceId,
            agentId,
          })
          .then(async () => {
            await loadSnapshot();
          });
      }}
      onOpenConversation={(conversationId) => {
        setSnapshot((current) =>
          current ? { ...current, activeConversationId: conversationId } : current,
        );
        void client.setActiveConversation(conversationId).then(() => loadSnapshot());
      }}
      onAddAgentToChat={(conversationId, agentId) => {
        void client.addAgentToConversation(conversationId, agentId).then(() => loadSnapshot());
      }}
      onRemoveAgentFromChat={(conversationId, agentId) => {
        void client.removeAgentFromConversation(conversationId, agentId).then(() => loadSnapshot());
      }}
      onCheckConnections={(targets) => {
        const active = snapshot;
        if (!active) {
          return;
        }
        const previous = connectionCheckTimestamps(active, targets);
        return client
          .checkConnections({
            workspaceId: active.activeWorkspaceId,
            targets,
          })
          .then(async () => {
            for (let attempt = 0; attempt < CONNECTION_CHECK_MAX_POLLS; attempt += 1) {
              const nextSnapshot = await loadSnapshot();
              if (nextSnapshot && hasFreshConnectionCheckResults(nextSnapshot, previous, targets)) {
                return;
              }
              await wait(CONNECTION_CHECK_POLL_INTERVAL_MS);
            }
            await loadSnapshot();
          });
      }}
      onRefreshConnections={() => void loadSnapshot()}
      {...(snapshot ? { snapshot } : {})}
    />
  );
}

const root = document.querySelector("#root");

if (root) {
  createRoot(root).render(<AgentHubWebApp />);
}

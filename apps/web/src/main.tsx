import { createRoot } from "react-dom/client";
import { AgentHubWorkbench } from "@agenthub/ui";
import { type WorkbenchSnapshot } from "@agenthub/contracts";
import { applyAgentHubEventToSnapshot, createRunRequestFromSnapshot } from "./app-state.js";
import { createDefaultWebControlPlaneClient } from "./control-plane-client.js";
import React from "react";

function AgentHubWebApp(): React.ReactElement {
  const [snapshot, setSnapshot] = React.useState<WorkbenchSnapshot | undefined>();
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const client = React.useMemo(() => createDefaultWebControlPlaneClient(), []);

  const loadSnapshot = React.useCallback(async (options: { readonly showLoading?: boolean } = {}) => {
    if (options.showLoading) {
      setLoading(true);
    }
    setError(null);
    try {
      setSnapshot(await client.getSnapshot());
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to reach Control Plane");
    } finally {
      setLoading(false);
    }
  }, [client]);

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
      onSend={(message, target) => {
        const active = snapshot;
        if (!active) {
          return;
        }
        void client
          .createRun(createRunRequestFromSnapshot(active, target, message))
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
      onRefreshConnections={() => void loadSnapshot()}
      {...(snapshot ? { snapshot } : {})}
    />
  );
}

const root = document.querySelector("#root");

if (root) {
  createRoot(root).render(<AgentHubWebApp />);
}

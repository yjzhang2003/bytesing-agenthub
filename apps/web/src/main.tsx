import { createRoot } from "react-dom/client";
import { AgentHubWorkbench } from "@agenthub/ui";
import { agentHubLocalDefaults, type WorkbenchSnapshot } from "@agenthub/contracts";
import { createDefaultWebControlPlaneClient } from "./control-plane-client.js";
import React from "react";

function AgentHubWebApp(): React.ReactElement {
  const [snapshot, setSnapshot] = React.useState<WorkbenchSnapshot | undefined>();
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const client = React.useMemo(() => createDefaultWebControlPlaneClient(), []);

  const loadSnapshot = React.useCallback(async () => {
    setLoading(true);
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
    void loadSnapshot();
    const stream = client.openEvents(() => {
      void loadSnapshot();
    });
    stream.onerror = () => {
      setError("Control Plane event stream disconnected");
    };
    return () => stream.close();
  }, [client, loadSnapshot]);

  return (
    <AgentHubWorkbench
      error={error}
      loading={loading}
      onRetry={() => void loadSnapshot()}
      onSend={(message) => {
        const active = snapshot;
        if (!active) {
          return;
        }
        void client
          .createRun({
            workspaceId: active.activeWorkspaceId,
            conversationId: active.activeConversationId,
            agentId: active.agents.find((agent) => agent.role === "worker")?.id ?? agentHubLocalDefaults.implementerAgentId,
            prompt: message,
          })
          .then(() => loadSnapshot());
      }}
      {...(snapshot ? { snapshot } : {})}
    />
  );
}

const root = document.querySelector("#root");

if (root) {
  createRoot(root).render(<AgentHubWebApp />);
}

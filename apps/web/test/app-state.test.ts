import { describe, expect, it } from "vitest";
import { agentHubLocalDefaults } from "@agenthub/contracts";
import {
  applyAgentHubEventToSnapshot,
  createDemoWorkspaceFlow,
  createRunRequestFromSnapshot,
} from "../src/app-state.js";
import { createDefaultWebControlPlaneClient } from "../src/control-plane-client.js";
import { readWebSupabaseConfig } from "../src/supabase.js";

describe("web app state", () => {
  it("creates a workspace-first authenticated demo flow", () => {
    const flow = createDemoWorkspaceFlow();
    expect(flow.state.authenticated).toBe(true);
    expect(flow.activeWorkspace.id).toBe(flow.state.activeWorkspaceId);
    expect(flow.state.agents.map((agent) => agent.displayName)).toContain("Orchestrator");
    expect(flow.state.pendingPermissions[0]?.status).toBe("pending");
    expect(flow.state.activeDiff?.files[0]?.path).toContain("packages/ui");
  });

  it("reads Supabase config from Vite env shape", () => {
    expect(
      readWebSupabaseConfig({
        VITE_SUPABASE_URL: "https://example.supabase.co",
        VITE_SUPABASE_ANON_KEY: "anon",
      } as ImportMetaEnv),
    ).toEqual({
      anonKey: "anon",
      url: "https://example.supabase.co",
    });
  });

  it("creates a default Control Plane client from Vite env shape", () => {
    const client = createDefaultWebControlPlaneClient({
      VITE_CONTROL_PLANE_URL: "http://127.0.0.1:5310",
      VITE_AGENTHUB_LOCAL_AUTH_TOKEN: agentHubLocalDefaults.authToken,
    } as ImportMetaEnv);

    expect(client).toBeTruthy();
  });

  it("creates direct run requests for the selected worker target", () => {
    const flow = createDemoWorkspaceFlow();
    const request = createRunRequestFromSnapshot(flow.state, "@Reviewer", "review this");

    expect(request).toEqual({
      workspaceId: flow.activeWorkspace.id,
      conversationId: flow.activeConversation.id,
      agentId: "agent_3",
      prompt: "review this",
    });
  });

  it("applies live run status and message delta events to a snapshot", () => {
    const flow = createDemoWorkspaceFlow();
    const queuedRun = {
      agentId: "agent_2",
      completedAt: null,
      conversationId: flow.activeConversation.id,
      createdAt: "2026-05-21T00:00:00.000Z",
      failureReason: null,
      id: "run_live",
      ownerUserId: "user_1",
      planId: null,
      startedAt: null,
      status: "queued" as const,
      updatedAt: "2026-05-21T00:00:00.000Z",
      workspaceId: flow.activeWorkspace.id,
    };
    const snapshot = {
      ...flow.state,
      activeConversationId: flow.activeConversation.id,
      activeWorkspaceId: flow.activeWorkspace.id,
      messages: [],
      runs: [queuedRun],
      userId: "user_1",
      availableActions: ["run.start"],
    };

    const running = applyAgentHubEventToSnapshot(snapshot, {
      id: "event_1",
      type: "agent.run.status_changed",
      ownerUserId: "user_1",
      workspaceId: flow.activeWorkspace.id,
      conversationId: flow.activeConversation.id,
      runId: "run_live",
      occurredAt: "2026-05-21T00:00:01.000Z",
      payload: {
        agentId: "agent_2",
        status: "streaming",
      },
    });
    const withMessage = applyAgentHubEventToSnapshot(running, {
      id: "event_2",
      type: "agent.run.message_delta",
      ownerUserId: "user_1",
      workspaceId: flow.activeWorkspace.id,
      conversationId: flow.activeConversation.id,
      runId: "run_live",
      occurredAt: "2026-05-21T00:00:02.000Z",
      payload: {
        agentId: "agent_2",
        delta: "hello",
      },
    });

    expect(withMessage.runs[0]).toMatchObject({
      id: "run_live",
      status: "streaming",
      startedAt: "2026-05-21T00:00:01.000Z",
    });
    expect(withMessage.messages[0]).toMatchObject({
      authorKind: "agent",
      authorId: "agent_2",
      parts: [{ type: "markdown", text: "hello", runId: "run_live" }],
    });
  });
});

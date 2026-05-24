import { afterEach, describe, expect, it, vi } from "vitest";
import { agentHubLocalDefaults } from "@agenthub/contracts";
import {
  applyAgentHubEventToSnapshot,
  connectionCheckTimestamps,
  createDemoWorkspaceFlow,
  createRunRequestFromSnapshot,
  hasFreshConnectionCheckResults,
} from "../src/app-state.js";
import { createDefaultWebControlPlaneClient } from "../src/control-plane-client.js";
import { readWebSupabaseConfig } from "../src/supabase.js";

describe("web app state", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });
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

  it("subscribes to named Control Plane event stream events", () => {
    const listeners = new Map<string, (event: MessageEvent<string>) => void>();
    class FakeEventSource {
      readonly url: string;
      onerror: ((event: Event) => void) | null = null;

      constructor(url: string) {
        this.url = url;
      }

      addEventListener(type: string, listener: EventListenerOrEventListenerObject) {
        listeners.set(type, listener as (event: MessageEvent<string>) => void);
      }

      close() {
        // Test fake.
      }
    }
    vi.stubGlobal("EventSource", FakeEventSource);
    const client = createDefaultWebControlPlaneClient({
      VITE_CONTROL_PLANE_URL: "http://127.0.0.1:5310",
      VITE_AGENTHUB_LOCAL_AUTH_TOKEN: agentHubLocalDefaults.authToken,
    } as ImportMetaEnv);
    const received: string[] = [];

    client.openEvents((event) => received.push(event.type));
    listeners.get("agent.run.message_delta")?.(
      new MessageEvent("agent.run.message_delta", {
        data: JSON.stringify({
          id: "event_1",
          type: "agent.run.message_delta",
          ownerUserId: "user_1",
          workspaceId: "workspace_1",
          conversationId: "conversation_1",
          runId: "run_1",
          occurredAt: "2026-05-21T00:00:00.000Z",
          payload: {
            agentId: "agent_1",
            delta: "done",
          },
        }),
      }),
    );

    expect(received).toEqual(["agent.run.message_delta"]);
    expect(listeners.has("agent.run.completed")).toBe(true);
  });

  it("calls Control Plane agent role APIs", async () => {
    const requests: { url: string; init: RequestInit }[] = [];
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: string, init: RequestInit = {}) => {
        requests.push({ url, init });
        return new Response(JSON.stringify({ agent: { id: "agent_new" }, agents: [] }), {
          status: 200,
        });
      }),
    );
    const client = createDefaultWebControlPlaneClient({
      VITE_CONTROL_PLANE_URL: "http://127.0.0.1:5310",
      VITE_AGENTHUB_LOCAL_AUTH_TOKEN: agentHubLocalDefaults.authToken,
    } as ImportMetaEnv);

    await client.createAgent({
      workspaceId: "workspace_1",
      displayName: "Researcher",
      role: "worker",
      systemPrompt: "Research carefully.",
      capabilityTags: ["research"],
      policy: {},
    });
    await client.updateAgent("agent_new", { systemPrompt: "Updated." });
    await client.archiveAgent("agent_new");
    await client.createAgentConversation({
      workspaceId: "workspace_1",
      agentId: "agent_new",
    });
    await client.setActiveConversation("conversation_new");
    await client.listAgents("workspace_1");

    expect(
      requests.map((request) => `${request.init.method ?? "GET"} ${new URL(request.url).pathname}`),
    ).toEqual([
      "POST /agents",
      "PATCH /agents/agent_new",
      "POST /agents/agent_new/archive",
      "POST /agents/agent_new/conversations",
      "POST /conversations/conversation_new/active",
      "GET /agents",
    ]);
  });

  it("calls Control Plane connection check APIs", async () => {
    const requests: { url: string; init: RequestInit }[] = [];
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: string, init: RequestInit = {}) => {
        requests.push({ url, init });
        return new Response(JSON.stringify({ acceptedTargets: ["provider"] }), { status: 202 });
      }),
    );
    const client = createDefaultWebControlPlaneClient({
      VITE_CONTROL_PLANE_URL: "http://127.0.0.1:5310",
      VITE_AGENTHUB_LOCAL_AUTH_TOKEN: agentHubLocalDefaults.authToken,
    } as ImportMetaEnv);

    await client.checkConnection({ workspaceId: "workspace_1", target: "provider" });
    await client.checkConnections({
      workspaceId: "workspace_1",
      targets: ["runtime", "provider", "memory"],
    });

    expect(
      requests.map((request) => `${request.init.method ?? "GET"} ${new URL(request.url).pathname}`),
    ).toEqual(["POST /connections/checks", "POST /connections/checks"]);
    expect(JSON.parse(String(requests[0]?.init.body))).toEqual({
      workspaceId: "workspace_1",
      targets: ["provider"],
    });
    expect(JSON.parse(String(requests[1]?.init.body))).toEqual({
      workspaceId: "workspace_1",
      targets: ["runtime", "provider", "memory"],
    });
  });

  it("tracks fresh connection check results by health timestamps", () => {
    const flow = createDemoWorkspaceFlow();
    const baseSnapshot = {
      ...flow.state,
      activeConversationId: flow.activeConversation.id,
      activeWorkspaceId: flow.activeWorkspace.id,
      availableActions: ["run.create"],
      memoryHealth: {
        checkedAt: "2026-05-21T00:00:00.000Z",
        enabled: true,
        failureReason: null,
        status: "connected" as const,
        url: "http://127.0.0.1:3111",
        viewerUrl: "http://127.0.0.1:3113",
      },
      providerHealth: {
        binaryPathLabel: "/usr/local/bin/claude",
        checkedAt: "2026-05-21T00:00:00.000Z",
        failureReason: null,
        providerMode: "claude-code" as const,
        status: "connected" as const,
      },
      userId: "user_1",
    };
    const previous = connectionCheckTimestamps(baseSnapshot, ["provider", "memory"]);

    expect(previous).toEqual({
      provider: "2026-05-21T00:00:00.000Z",
      memory: "2026-05-21T00:00:00.000Z",
    });
    expect(
      hasFreshConnectionCheckResults(
        {
          ...baseSnapshot,
          providerHealth: {
            ...baseSnapshot.providerHealth,
            checkedAt: "2026-05-21T00:00:01.000Z",
          },
        },
        previous,
        ["provider", "memory"],
      ),
    ).toBe(false);
    expect(
      hasFreshConnectionCheckResults(
        {
          ...baseSnapshot,
          memoryHealth: {
            ...baseSnapshot.memoryHealth,
            checkedAt: "2026-05-21T00:00:02.000Z",
          },
          providerHealth: {
            ...baseSnapshot.providerHealth,
            checkedAt: "2026-05-21T00:00:01.000Z",
          },
        },
        previous,
        ["provider", "memory"],
      ),
    ).toBe(true);
  });

  it("tracks fresh Claude Code discovery checks", () => {
    const flow = createDemoWorkspaceFlow();
    const baseSnapshot = {
      ...flow.state,
      activeConversationId: flow.activeConversation.id,
      activeWorkspaceId: flow.activeWorkspace.id,
      availableActions: ["run.create"],
      claudeCodeDiscovery: {
        binaryPathLabel: "/usr/local/bin/claude",
        checkedAt: "2026-05-21T00:00:00.000Z",
        profileRootLabel: "~/.agenthub/claude-code",
        plugins: [],
        skills: [],
        mcpServers: [],
        workspaceClaudeFiles: {
          claudeDir: false,
          settingsJson: false,
          settingsLocalJson: false,
          mcpJson: false,
          claudeMd: false,
        },
      },
      userId: "user_1",
    };
    const previous = connectionCheckTimestamps(baseSnapshot, ["claude-code"]);

    expect(previous).toEqual({ "claude-code": "2026-05-21T00:00:00.000Z" });
    expect(
      hasFreshConnectionCheckResults(
        {
          ...baseSnapshot,
          claudeCodeDiscovery: {
            ...baseSnapshot.claudeCodeDiscovery,
            checkedAt: "2026-05-21T00:00:01.000Z",
          },
        },
        previous,
        ["claude-code"],
      ),
    ).toBe(true);
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

  it("maps composer Claude Code controls into run requests", () => {
    const flow = createDemoWorkspaceFlow();
    const request = createRunRequestFromSnapshot(flow.state, "@Reviewer", "review this", {
      permissionPreset: "full-access",
      runtimeProfileId: "engineering",
      mcpProfileId: "project",
      pluginProfileId: "project",
      effort: "high",
      sessionBehavior: "continue",
      sessionId: "session_1",
      settingsSource: "isolated",
      hooksPolicy: "enabled",
      allowedTools: ["Read"],
      disallowedTools: ["Bash(rm:*)"],
    });

    expect(request.claudeCode).toEqual({
      permissionPreset: "full-access",
      runtimeProfileId: "engineering",
      mcpProfileId: "project",
      pluginProfileId: "project",
      effort: "high",
      session: {
        behavior: "continue",
        sessionId: "session_1",
      },
      settingsSource: "isolated",
      hooksPolicy: "enabled",
      allowedTools: ["Read"],
      disallowedTools: ["Bash(rm:*)"],
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
    const withMoreMessage = applyAgentHubEventToSnapshot(withMessage, {
      id: "event_3",
      type: "agent.run.message_delta",
      ownerUserId: "user_1",
      workspaceId: flow.activeWorkspace.id,
      conversationId: flow.activeConversation.id,
      runId: "run_live",
      occurredAt: "2026-05-21T00:00:03.000Z",
      payload: {
        agentId: "agent_2",
        delta: " world",
      },
    });

    expect(withMoreMessage.runs[0]).toMatchObject({
      id: "run_live",
      status: "streaming",
      startedAt: "2026-05-21T00:00:01.000Z",
    });
    expect(withMoreMessage.messages).toHaveLength(1);
    expect(withMoreMessage.messages[0]).toMatchObject({
      authorKind: "agent",
      authorId: "agent_2",
      parts: [{ type: "markdown", text: "hello world", runId: "run_live" }],
    });
  });
});

import { createHmac } from "node:crypto";
import { describe, expect, it } from "vitest";
import { agentHubLocalDefaults } from "@agenthub/contracts";
import { verifySupabaseJwt } from "../src/auth.js";
import { createControlPlaneServer } from "../src/http.js";
import { ControlPlaneRegistry } from "../src/runtime-registry.js";

function signTestJwt(userId: string, secret = "test-secret"): string {
  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
  const payload = Buffer.from(
    JSON.stringify({ sub: userId, exp: Math.floor(Date.now() / 1000) + 60 }),
  ).toString("base64url");
  const signature = createHmac("sha256", secret).update(`${header}.${payload}`).digest("base64url");
  return `${header}.${payload}.${signature}`;
}

describe("control plane auth", () => {
  it("verifies a Supabase-style HS256 JWT", () => {
    const auth = verifySupabaseJwt(signTestJwt("user_1"), "test-secret");
    expect(auth.userId).toBe("user_1");
  });

  it("rejects invalid JWT signatures", () => {
    expect(() => verifySupabaseJwt(signTestJwt("user_1"), "wrong-secret")).toThrow(
      "Invalid JWT signature",
    );
  });
});

describe("control plane registry", () => {
  function createRegisteredRunLoopRegistry() {
    const registry = new ControlPlaneRegistry();
    const device = registry.registerRuntimeDevice("user_1", {
      id: "runtime_1",
      displayName: "MacBook Pro",
      platform: "macos",
      appVersion: "0.1.0",
      capabilities: ["provider:smoke"],
      workspace: {
        workspaceId: "workspace_1",
        displayName: "Project",
        localPathLabel: "/tmp/project",
        gitBranch: "main",
        gitBaseCommit: "abc123",
        dirty: false,
        providerCapabilities: ["provider:smoke"],
      },
    });

    return { registry, device };
  }

  it("registers runtime devices and marks expired heartbeats offline", () => {
    let now = new Date("2026-05-21T00:00:00.000Z");
    const registry = new ControlPlaneRegistry({
      now: () => now,
      offlineTimeoutMs: 1_000,
    });

    const device = registry.registerRuntimeDevice("user_1", {
      displayName: "MacBook Pro",
      platform: "macos",
      appVersion: "0.1.0",
      capabilities: ["claude-code-local-process"],
    });

    expect(device.status).toBe("online");
    now = new Date("2026-05-21T00:00:02.000Z");
    const expired = registry.markExpiredDevicesOffline();
    expect(expired).toHaveLength(1);
    expect(expired[0]?.status).toBe("offline");
  });

  it("fails run creation when runtime is offline", () => {
    let now = new Date("2026-05-21T00:00:00.000Z");
    const registry = new ControlPlaneRegistry({
      now: () => now,
      offlineTimeoutMs: 1_000,
    });
    const device = registry.registerRuntimeDevice("user_1", {
      displayName: "MacBook Pro",
      platform: "macos",
      appVersion: "0.1.0",
      capabilities: ["claude-code-local-process"],
    });
    registry.bindWorkspace({
      workspaceId: "workspace_1",
      ownerUserId: "user_1",
      runtimeDeviceId: device.id,
      localPath: "/tmp/project",
    });

    now = new Date("2026-05-21T00:00:02.000Z");
    registry.markExpiredDevicesOffline();

    expect(() =>
      registry.createRun("user_1", {
        workspaceId: "workspace_1",
        conversationId: "conversation_1",
        agentId: "agent_1",
      }),
    ).toThrow("Workspace runtime is offline");
  });

  it("rejects unbound workspace runs without queueing runtime commands", () => {
    const registry = new ControlPlaneRegistry();
    const device = registry.registerRuntimeDevice("user_1", {
      id: "runtime_1",
      displayName: "MacBook Pro",
      platform: "macos",
      appVersion: "0.1.0",
      capabilities: ["provider:smoke"],
    });

    expect(() =>
      registry.createRun("user_1", {
        workspaceId: "workspace_missing",
        conversationId: "conversation_1",
        agentId: "agent_1",
        prompt: "hello",
      }),
    ).toThrow("Workspace is not bound to this user runtime");
    expect(registry.takeRuntimeCommands("user_1", device.id)).toHaveLength(0);
  });

  it("creates and cancels a routed run for an online workspace runtime", () => {
    const registry = new ControlPlaneRegistry();
    const device = registry.registerRuntimeDevice("user_1", {
      displayName: "MacBook Pro",
      platform: "macos",
      appVersion: "0.1.0",
      capabilities: ["claude-code-local-process"],
    });
    registry.bindWorkspace({
      workspaceId: "workspace_1",
      ownerUserId: "user_1",
      runtimeDeviceId: device.id,
      localPath: "/tmp/project",
    });

    const run = registry.createRun("user_1", {
      workspaceId: "workspace_1",
      conversationId: "conversation_1",
      agentId: "agent_1",
    });
    const cancelled = registry.cancelRun("user_1", run.id);

    expect(run.status).toBe("queued");
    expect(cancelled.status).toBe("cancelling");
  });

  it("records provider output into the workbench snapshot", () => {
    const { registry, device } = createRegisteredRunLoopRegistry();
    const run = registry.createRun("user_1", {
      workspaceId: "workspace_1",
      conversationId: agentHubLocalDefaults.conversationId,
      agentId: agentHubLocalDefaults.implementerAgentId,
      prompt: "hello",
    });
    expect(registry.takeRuntimeCommands("user_1", device.id)).toHaveLength(1);

    registry.recordProviderRuntimeEvent("user_1", {
      type: "message.delta",
      runId: run.id,
      agentId: agentHubLocalDefaults.implementerAgentId,
      delta: "done",
    });

    const snapshot = registry.createWorkbenchSnapshot("user_1");
    expect(snapshot.messages[0]?.parts[0]?.text).toBe("done");
  });

  it("normalizes provider terminal statuses into AgentHub terminal events", () => {
    const { registry } = createRegisteredRunLoopRegistry();
    const run = registry.createRun("user_1", {
      workspaceId: "workspace_1",
      conversationId: agentHubLocalDefaults.conversationId,
      agentId: agentHubLocalDefaults.implementerAgentId,
      prompt: "hello",
    });

    registry.recordProviderRuntimeEvent("user_1", {
      type: "run.status",
      runId: run.id,
      agentId: agentHubLocalDefaults.implementerAgentId,
      status: "completed",
      message: "done",
    });

    expect(registry.getRun("user_1", run.id).completedAt).not.toBeNull();
    expect(registry.events.snapshot().at(-1)).toMatchObject({
      type: "agent.run.completed",
      runId: run.id,
      payload: {
        status: "completed",
        message: "done",
      },
    });
  });

  it("records cancellation terminal status after runtime cancellation", () => {
    const { registry, device } = createRegisteredRunLoopRegistry();
    const run = registry.createRun("user_1", {
      workspaceId: "workspace_1",
      conversationId: agentHubLocalDefaults.conversationId,
      agentId: agentHubLocalDefaults.implementerAgentId,
      prompt: "hello",
    });
    registry.cancelRun("user_1", run.id);

    expect(registry.takeRuntimeCommands("user_1", device.id).at(-1)).toMatchObject({
      type: "run.cancel",
      payload: { runId: run.id },
    });

    registry.recordProviderRuntimeEvent("user_1", {
      type: "run.status",
      runId: run.id,
      agentId: agentHubLocalDefaults.implementerAgentId,
      status: "cancelled",
      message: "cancelled",
    });

    expect(registry.getRun("user_1", run.id)).toMatchObject({
      status: "cancelled",
      failureReason: "cancelled",
    });
  });
});

describe("control plane HTTP local mode", () => {
  it("serves health, registration, snapshot, commands, and runtime events", async () => {
    const registry = new ControlPlaneRegistry();
    const server = createControlPlaneServer({
      authMode: "local-demo",
      jwtSecret: "dev",
      localAuthToken: "local-token",
      localUserId: "user_local_demo",
      registry,
    });
    await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
    const address = server.address();
    if (!address || typeof address === "string") {
      throw new Error("Expected TCP server address");
    }
    const baseUrl = `http://127.0.0.1:${address.port}`;
    const headers = {
      authorization: "Bearer local-token",
      "content-type": "application/json",
    };

    try {
      const health = await fetch(`${baseUrl}/health`);
      expect(health.ok).toBe(true);
      expect(await health.json()).toMatchObject({ service: "@agenthub/control-plane" });

      const registration = await fetch(`${baseUrl}/runtime/register`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          deviceId: "runtime_local_demo",
          displayName: "AgentHub Desktop Runtime",
          platform: "macos",
          appVersion: "0.1.0",
          capabilities: ["provider:smoke"],
          workspace: {
            workspaceId: "workspace_local_demo",
            displayName: "AgentHub",
            localPathLabel: "/tmp/agenthub",
            gitBranch: "main",
            gitBaseCommit: "abc123",
            dirty: false,
            providerCapabilities: ["provider:smoke"],
          },
        }),
      });
      expect(registration.ok).toBe(true);

      const snapshot = await fetch(`${baseUrl}/workbench/snapshot`, { headers });
      const snapshotBody = await snapshot.json();
      expect(snapshotBody.runtimeDevices[0].status).toBe("online");

      const runResponse = await fetch(`${baseUrl}/runs`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          workspaceId: snapshotBody.activeWorkspaceId,
          conversationId: snapshotBody.activeConversationId,
          agentId: snapshotBody.agents[1].id,
          prompt: "smoke",
        }),
      });
      const runBody = await runResponse.json();
      expect(runBody.run.status).toBe("queued");

      const commands = await fetch(`${baseUrl}/runtime/commands?deviceId=runtime_local_demo`, {
        headers,
      });
      expect((await commands.json()).commands[0].type).toBe("run.start");

      const eventResponse = await fetch(`${baseUrl}/runtime/events`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          type: "run.status",
          runId: runBody.run.id,
          agentId: snapshotBody.agents[1].id,
          status: "completed",
        }),
      });
      expect(eventResponse.status).toBe(202);
    } finally {
      await new Promise<void>((resolve) => server.close(() => resolve()));
    }
  });
});

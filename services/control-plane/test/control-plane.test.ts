import { createHmac } from "node:crypto";
import { describe, expect, it } from "vitest";
import { verifySupabaseJwt } from "../src/auth.js";
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
});


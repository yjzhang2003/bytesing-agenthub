import { describe, expect, it } from "vitest";
import {
  isDiffMetadataStale,
  validateRuntimeRegistrationPayload,
  validateServiceHealth,
  validateWorkbenchSnapshot,
  validateWorkspaceMetadata,
  validateDiffMetadata,
  validateOrchestratorDispatchPlan,
  validateProviderRuntimeEvent,
} from "../src/index.js";

describe("contract validation", () => {
  it("rejects invalid orchestrator output without steps", () => {
    const result = validateOrchestratorDispatchPlan({
      id: "plan_1",
      conversationId: "conv_1",
      workspaceId: "workspace_1",
      goal: "Implement feature",
      status: "draft",
      steps: [],
    });

    expect(result.ok).toBe(false);
    expect(result.issues?.join("\n")).toContain("Too small");
  });

  it("rejects invalid provider runtime event type", () => {
    const result = validateProviderRuntimeEvent({
      type: "unknown.event",
      runId: "run_1",
      agentId: "agent_1",
    });

    expect(result.ok).toBe(false);
  });

  it("detects stale diff metadata fingerprints", () => {
    expect(isDiffMetadataStale("base:abc|dirty:1", "base:def|dirty:1")).toBe(true);
    expect(isDiffMetadataStale("base:abc|dirty:1", "base:abc|dirty:1")).toBe(false);
  });

  it("accepts valid diff metadata", () => {
    const result = validateDiffMetadata({
      workspaceId: "workspace_1",
      runId: "run_1",
      baseCommit: "abc123",
      workingTreeFingerprint: "base:abc123|dirty:1",
      cacheExpiresAt: null,
      changedFiles: [
        {
          path: "src/index.ts",
          status: "modified",
          insertions: 12,
          deletions: 3,
        },
      ],
    });

    expect(result.ok).toBe(true);
  });

  it("accepts local runnable health and runtime payloads", () => {
    const now = "2026-05-21T00:00:00.000Z";
    expect(
      validateServiceHealth({
        ok: true,
        service: "@agenthub/control-plane",
        version: "0.1.0",
        mode: "local-demo",
        timestamp: now,
        runtime: {
          online: true,
          deviceId: "runtime_local_demo",
          lastHeartbeatAt: now,
          capabilities: ["provider:smoke"],
        },
      }).ok,
    ).toBe(true);

    const workspace = {
      workspaceId: "workspace_local_demo",
      displayName: "AgentHub",
      localPathLabel: "/Users/example/agenthub",
      gitBranch: "main",
      gitBaseCommit: "abc123",
      dirty: false,
      providerCapabilities: ["provider:smoke"],
    };
    expect(validateWorkspaceMetadata(workspace).ok).toBe(true);
    expect(
      validateRuntimeRegistrationPayload({
        deviceId: "runtime_local_demo",
        displayName: "AgentHub Desktop Runtime",
        platform: "macos",
        appVersion: "0.1.0",
        capabilities: ["provider:smoke"],
        workspace,
      }).ok,
    ).toBe(true);
  });

  it("accepts a control-plane backed workbench snapshot", () => {
    const now = "2026-05-21T00:00:00.000Z";
    const result = validateWorkbenchSnapshot({
      authenticated: true,
      userId: "user_local_demo",
      activeWorkspaceId: "workspace_local_demo",
      activeConversationId: "conversation_local_demo",
      workspaces: [
        {
          id: "workspace_local_demo",
          ownerUserId: "user_local_demo",
          name: "AgentHub",
          runtimeKind: "local",
          runtimeDeviceId: "runtime_local_demo",
          localPath: null,
          repoUrl: null,
          defaultBranch: "main",
          createdAt: now,
          updatedAt: now,
        },
      ],
      runtimeDevices: [
        {
          id: "runtime_local_demo",
          ownerUserId: "user_local_demo",
          displayName: "AgentHub Desktop Runtime",
          platform: "macos",
          appVersion: "0.1.0",
          status: "online",
          capabilities: ["provider:smoke"],
          lastHeartbeatAt: now,
          createdAt: now,
          updatedAt: now,
        },
      ],
      workspaceMetadata: null,
      conversations: [
        {
          id: "conversation_local_demo",
          ownerUserId: "user_local_demo",
          workspaceId: "workspace_local_demo",
          kind: "group",
          title: "AgentHub local demo",
          archivedAt: null,
          createdAt: now,
          updatedAt: now,
        },
      ],
      agents: [],
      runs: [],
      messages: [],
      availableActions: ["run.start"],
    });

    expect(result.ok).toBe(true);
  });
});

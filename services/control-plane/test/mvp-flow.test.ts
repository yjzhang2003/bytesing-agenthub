import { describe, expect, it } from "vitest";
import { agentHubLocalDefaults } from "@agenthub/contracts";
import { DiffArtifactService, PermissionService } from "../src/index.js";
import { CollaborationService } from "../src/collaboration.js";
import { ControlPlaneRegistry } from "../src/runtime-registry.js";

describe("MVP integration flow", () => {
  it("covers login-equivalent owner scoping, runtime registration, workspace binding, and run sync", () => {
    const registry = new ControlPlaneRegistry();
    const device = registry.registerRuntimeDevice("user_1", {
      appVersion: "0.1.0",
      capabilities: ["claude-code-local-process"],
      displayName: "MacBook Pro",
      platform: "macos",
    });
    registry.bindWorkspace({
      localPath: "/tmp/agenthub",
      ownerUserId: "user_1",
      runtimeDeviceId: device.id,
      workspaceId: "workspace_1",
    });
    const run = registry.createRun("user_1", {
      agentId: agentHubLocalDefaults.implementerAgentId,
      conversationId: "conversation_1",
      workspaceId: "workspace_1",
    });

    expect(device.ownerUserId).toBe("user_1");
    expect(run.status).toBe("queued");
    expect(registry.events.snapshot().some((event) => event.type === "agent.run.status_changed")).toBe(
      true,
    );
  });

  it("covers Orchestrator Plan Mode and worker assignment", () => {
    const collaboration = new CollaborationService();
    const plan = collaboration.createDraftPlan("user_1", {
      conversationId: "conversation_1",
      goal: "Implement feature",
      id: "plan_1",
      status: "draft",
      steps: [
        {
          assignedAgentId: "agent_1",
          dependsOnStepIds: [],
          expectedArtifacts: ["diff"],
          id: "step_1",
          riskNotes: [],
          title: "Implement",
        },
      ],
      workspaceId: "workspace_1",
    });
    const assignments = collaboration.createTaskAssignments("user_1", plan.id, [
      {
        agentId: "agent_1",
        completedAt: null,
        conversationId: "conversation_1",
        createdAt: "2026-05-21T00:00:00.000Z",
        failureReason: null,
        id: "run_1",
        ownerUserId: "user_1",
        planId: "plan_1",
        startedAt: null,
        status: "queued",
        updatedAt: "2026-05-21T00:00:00.000Z",
        workspaceId: "workspace_1",
      },
    ]);

    expect(assignments[0]?.stepId).toBe("step_1");
  });

  it("covers permission approval and audit persistence", () => {
    const permissions = new PermissionService();
    const request = permissions.createRequest({
      actionKind: "file.write",
      agentId: "agent_1",
      conversationId: "conversation_1",
      ownerUserId: "user_1",
      paths: ["src/index.ts"],
      risk: "medium",
      runId: "run_1",
      summary: "Modify source",
      workspaceId: "workspace_1",
    });
    const allowed = permissions.allowOnce("user_1", request.id);

    expect(allowed.status).toBe("allowed-once");
    expect(permissions.auditLogs).toHaveLength(2);
  });

  it("covers diff summary persistence and on-demand full diff retrieval", async () => {
    const diffs = new DiffArtifactService();
    diffs.persistDiffMetadata({
      artifactId: "artifact_1",
      conversationId: "conversation_1",
      metadata: {
        baseCommit: "abc123",
        cacheExpiresAt: null,
        changedFiles: [{ deletions: 1, insertions: 2, path: "src/index.ts", status: "modified" }],
        runId: "run_1",
        workingTreeFingerprint: "base:abc123|dirty:1",
        workspaceId: "workspace_1",
      },
      ownerUserId: "user_1",
      summary: "1 file changed",
      title: "Diff",
    });

    const result = await diffs.getFullDiff("workspace_1", "run_1", {
      async getFullDiff() {
        return {
          content: "diff --git",
          workingTreeFingerprint: "base:abc123|dirty:1",
        };
      },
    });

    expect(result.state).toBe("available");
    expect(result.content).toBe("diff --git");
  });
});

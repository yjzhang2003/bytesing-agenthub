import { describe, expect, it } from "vitest";
import type { Agent, Run } from "@agenthub/contracts";
import { agentHubLocalDefaults } from "@agenthub/contracts";
import { CollaborationService, PermissionService } from "../src/index.js";

function agent(role: Agent["role"]): Agent {
  return {
    id: `${role}_agent`,
    ownerUserId: "user_1",
    workspaceId: "workspace_1",
    providerId: "provider_1",
    displayName: role,
    role,
    systemPrompt: "",
    capabilityTags: [],
    policy: {},
    createdAt: "2026-05-21T00:00:00.000Z",
    updatedAt: "2026-05-21T00:00:00.000Z",
  };
}

describe("CollaborationService", () => {
  it("routes orchestrator mentions to Plan Mode and workers directly", () => {
    const service = new CollaborationService();
    expect(service.routeMention(agent("orchestrator")).mode).toBe("orchestrator-plan");
    expect(service.routeMention(agent("worker")).mode).toBe("direct-agent");
  });

  it("resolves agent and user mentions with collaboration intent", () => {
    const service = new CollaborationService();
    const reviewer = { ...agent("worker"), id: "agent_reviewer", displayName: "Reviewer" };
    const implementer = { ...agent("worker"), id: "agent_implementer", displayName: "Implementer" };

    expect(
      service.resolveGroupMessageRoute({
        content: "@Reviewer please review the auth flow",
        ownerUserId: "user_1",
        agents: [reviewer, implementer],
      }),
    ).toMatchObject({
      mode: "agent-mention",
      agentId: "agent_reviewer",
      mentionPurpose: "review",
      requiresPlanApproval: false,
    });

    expect(
      service.resolveGroupMessageRoute({
        content: "@Implementer implement the storage adapter",
        ownerUserId: "user_1",
        agents: [reviewer, implementer],
      }),
    ).toMatchObject({
      mode: "agent-mention",
      agentId: "agent_implementer",
      mentionPurpose: "task-handoff",
      requiresPlanApproval: false,
    });

    expect(
      service.resolveGroupMessageRoute({
        content: "@user should we allow auto-dispatch?",
        ownerUserId: "user_1",
        agents: [reviewer, implementer],
      }),
    ).toMatchObject({
      mode: "user-question",
      userId: "user_1",
      mentionPurpose: "user-question",
      requiresPlanApproval: false,
    });
  });

  it("routes unaddressed group messages to Orchestrator without auto-dispatch", () => {
    const service = new CollaborationService();
    const orchestrator = {
      ...agent("orchestrator"),
      id: "agent_orchestrator",
      displayName: "Orchestrator",
    };
    const worker = { ...agent("worker"), id: "agent_worker", displayName: "Implementer" };

    expect(
      service.resolveGroupMessageRoute({
        content: "We need to coordinate the storage change",
        ownerUserId: "user_1",
        agents: [orchestrator, worker],
      }),
    ).toMatchObject({
      mode: "orchestrator-coordinate",
      agentId: "agent_orchestrator",
      requiresPlanApproval: true,
      autoDispatchAllowed: false,
    });

    expect(
      service.resolveGroupMessageRoute({
        content: "We need to coordinate the storage change",
        ownerUserId: "user_1",
        agents: [orchestrator, worker],
        allowAutoDispatch: true,
      }),
    ).toMatchObject({
      mode: "orchestrator-coordinate",
      requiresPlanApproval: false,
      autoDispatchAllowed: true,
    });
  });

  it("rejects unknown group mentions", () => {
    const service = new CollaborationService();

    expect(() =>
      service.resolveGroupMessageRoute({
        content: "@Missing please review this",
        ownerUserId: "user_1",
        agents: [{ ...agent("worker"), id: "agent_reviewer", displayName: "Reviewer" }],
      }),
    ).toThrow("Mention target not found");
  });

  it("validates dispatch plans and creates assignments", () => {
    const service = new CollaborationService();
    const plan = service.createDraftPlan("user_1", {
      id: "plan_1",
      workspaceId: "workspace_1",
      conversationId: agentHubLocalDefaults.conversationId,
      goal: "Build UI",
      assumptions: [],
      status: "draft",
      steps: [
        {
          id: "step_1",
          title: "Implement",
          assignedAgentId: "agent_1",
          dependsOnStepIds: [],
          expectedArtifacts: ["diff"],
          riskNotes: [],
        },
      ],
    });

    const run: Run = {
      id: "run_1",
      ownerUserId: "user_1",
      workspaceId: "workspace_1",
      conversationId: agentHubLocalDefaults.conversationId,
      agentId: "agent_1",
      planId: "plan_1",
      status: "completed",
      startedAt: null,
      completedAt: null,
      failureReason: null,
      createdAt: "2026-05-21T00:00:00.000Z",
      updatedAt: "2026-05-21T00:00:00.000Z",
    };

    const assignments = service.createTaskAssignments("user_1", plan.id, [run]);
    const summary = service.createSummary("user_1", plan.id, [run]);

    expect(assignments).toHaveLength(1);
    expect(summary).toContain("1 completed");
  });
});

describe("PermissionService", () => {
  it("creates permission requests, allows once, and records audit logs", () => {
    const service = new PermissionService();
    const request = service.createRequest({
      ownerUserId: "user_1",
      workspaceId: "workspace_1",
      conversationId: agentHubLocalDefaults.conversationId,
      runId: "run_1",
      agentId: "agent_1",
      actionKind: "command.run",
      risk: "high",
      summary: "Run pnpm test",
      command: "pnpm test",
    });
    const allowed = service.allowOnce("user_1", request.id);

    expect(allowed.status).toBe("allowed-once");
    expect(service.auditLogs.map((log) => log.eventType)).toEqual([
      "permission.requested",
      "permission.status_changed",
    ]);
  });

  it("expires timed out pending requests", () => {
    let now = new Date("2026-05-21T00:00:00.000Z");
    const service = new PermissionService({
      now: () => now,
      timeoutMs: 1_000,
    });
    service.createRequest({
      ownerUserId: "user_1",
      workspaceId: "workspace_1",
      conversationId: agentHubLocalDefaults.conversationId,
      runId: "run_1",
      agentId: "agent_1",
      actionKind: "file.write",
      risk: "medium",
      summary: "Modify files",
    });
    now = new Date("2026-05-21T00:00:02.000Z");

    expect(service.expireTimedOutRequests()[0]?.status).toBe("expired");
  });
});

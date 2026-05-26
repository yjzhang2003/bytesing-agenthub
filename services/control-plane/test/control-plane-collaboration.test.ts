import { describe, expect, it } from "vitest";
import type { CollaborationStatusSummary } from "@agenthub/contracts";
import { agentHubLocalDefaults } from "@agenthub/contracts";
import { ControlPlaneRegistry } from "../src/index.js";

const now = "2026-05-24T00:00:00.000Z";

function createRegistry(collaborationStatus?: CollaborationStatusSummary | null) {
  const registry = new ControlPlaneRegistry({
    now: () => new Date(now),
    collaborationStatusProvider: () => collaborationStatus ?? null,
  });
  const device = registry.registerRuntimeDevice("user_1", {
    id: "runtime_1",
    displayName: "Runtime",
    platform: "macos",
    appVersion: "0.1.0",
    capabilities: ["provider:smoke"],
    workspace: {
      workspaceId: "workspace_1",
      displayName: "Workspace",
      localPathLabel: "/tmp/workspace",
      gitBranch: "main",
      gitBaseCommit: null,
      dirty: false,
      providerCapabilities: [],
    },
  });
  registry.bindWorkspace({
    ownerUserId: "user_1",
    workspaceId: "workspace_1",
    runtimeDeviceId: device.id,
    localPath: "/tmp/workspace",
  });
  return { registry, device };
}

describe("ControlPlaneRegistry collaboration integration", () => {
  it("includes collaboration status in workbench snapshots when available", () => {
    const collaborationStatus: CollaborationStatusSummary = {
      conversationId: agentHubLocalDefaults.conversationId,
      projectId: "project_1",
      state: "available",
      agents: [
        {
          agentId: agentHubLocalDefaults.implementerAgentId,
          displayName: "Implementer",
          availability: "blocked",
          currentTaskId: "task_1",
          currentTaskTitle: "Implement storage",
          blockedQuestionCount: 1,
          stale: false,
        },
      ],
      openSpecLinks: [
        {
          changeName: "add-storage",
          artifact: "tasks",
          projectionStatus: "projected",
        },
      ],
      pendingUserQuestions: [
        {
          questionId: "question_1",
          requestingAgentId: agentHubLocalDefaults.implementerAgentId,
          taskId: "task_1",
          prompt: "Approve dispatch?",
          createdAt: now,
        },
      ],
    };
    const { registry } = createRegistry(collaborationStatus);

    expect(registry.createWorkbenchSnapshot("user_1").collaborationStatus).toEqual(
      collaborationStatus,
    );
  });

  it("publishes collaboration events for mention and user question updates", () => {
    const { registry } = createRegistry();

    registry.recordCollaborationMention("user_1", {
      workspaceId: "workspace_1",
      conversationId: agentHubLocalDefaults.conversationId,
      agentId: agentHubLocalDefaults.implementerAgentId,
      taskId: "task_1",
      questionId: null,
      purpose: "task-handoff",
    });
    registry.answerCollaborationUserQuestion("user_1", {
      workspaceId: "workspace_1",
      conversationId: agentHubLocalDefaults.conversationId,
      questionId: "question_1",
      agentId: agentHubLocalDefaults.implementerAgentId,
      taskId: "task_1",
    });
    registry.recordCollaborationOpenSpecProjection("user_1", {
      workspaceId: "workspace_1",
      conversationId: agentHubLocalDefaults.conversationId,
      openspecChangeName: "add-storage",
      projectionStatus: "projected",
    });

    expect(registry.events.snapshot().map((event) => event.type)).toEqual(
      expect.arrayContaining([
        "collaboration.mention.recorded",
        "collaboration.question.answered",
        "collaboration.openspec.updated",
      ]),
    );
  });

  it("keeps direct run behavior unchanged when collaboration status is absent", () => {
    const { registry, device } = createRegistry(null);
    const run = registry.createRun("user_1", {
      workspaceId: "workspace_1",
      conversationId: agentHubLocalDefaults.conversationId,
      agentId: agentHubLocalDefaults.implementerAgentId,
      prompt: "hello",
    });

    expect(registry.createWorkbenchSnapshot("user_1").collaborationStatus).toBeNull();
    expect(run.status).toBe("queued");
    expect(registry.takeRuntimeCommands("user_1", device.id).at(-1)).toMatchObject({
      type: "run.start",
      payload: {
        runId: run.id,
        prompt: "hello",
      },
    });
  });
});

import { mkdtemp, readFile, stat } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { describe, expect, it } from "vitest";
import type { Agent, ConversationParticipant } from "@agenthub/contracts";
import { CollaborationService, ProjectCollaborationRuntime } from "../src/index.js";

const now = "2026-05-24T00:00:00.000Z";

async function createRuntime() {
  const rootDir = await mkdtemp(join(tmpdir(), "agenthub-collaboration-"));
  let id = 0;
  return {
    rootDir,
    runtime: new ProjectCollaborationRuntime({
      rootDir,
      now: () => new Date(now),
      randomId: () => `id_${++id}`,
    }),
  };
}

function agent(id: string, displayName: string): Agent {
  return {
    id,
    ownerUserId: "user_1",
    workspaceId: "workspace_1",
    providerId: "provider_1",
    displayName,
    role: displayName === "Orchestrator" ? "orchestrator" : "worker",
    systemPrompt: `${displayName} system prompt`,
    capabilityTags: ["review"],
    policy: { runtime: { provider: "claude-code" } },
    createdAt: now,
    updatedAt: now,
  };
}

function participant(agentId: string, archivedAt: string | null = null): ConversationParticipant {
  return {
    id: `participant_${agentId}`,
    ownerUserId: "user_1",
    conversationId: "conversation_1",
    agentId,
    addedByUserId: "user_1",
    archivedAt,
    createdAt: now,
    updatedAt: now,
  };
}

const scope = {
  ownerUserId: "user_1",
  workspaceId: "workspace_1",
  projectId: "project_1",
  conversationId: "conversation_1",
};

describe("ProjectCollaborationRuntime", () => {
  it("initializes project-scoped collaboration state without returning raw paths in status", async () => {
    const { rootDir, runtime } = await createRuntime();
    const status = await runtime.initializeConversation(scope);

    await expect(stat(join(rootDir, ".agenthub/collaboration/conversation_1/agents.json"))).resolves.toBeTruthy();
    await expect(stat(join(rootDir, ".agenthub/collaboration/conversation_1/events.jsonl"))).resolves.toBeTruthy();
    await expect(stat(join(rootDir, ".agenthub/collaboration/conversation_1/tasks"))).resolves.toBeTruthy();
    await expect(stat(join(rootDir, ".agenthub/collaboration/conversation_1/inbox"))).resolves.toBeTruthy();
    await expect(stat(join(rootDir, ".agenthub/collaboration/conversation_1/outbox"))).resolves.toBeTruthy();
    await expect(stat(join(rootDir, ".agenthub/collaboration/conversation_1/questions"))).resolves.toBeTruthy();
    await expect(stat(join(rootDir, ".agenthub/collaboration/conversation_1/openspec-links.json"))).resolves.toBeTruthy();
    expect(JSON.stringify(status)).not.toContain(rootDir);
    expect(status).toMatchObject({
      conversationId: "conversation_1",
      projectId: "project_1",
      state: "available",
      agents: [],
    });
  });

  it("appends collaboration events and synchronizes roster history", async () => {
    const { rootDir, runtime } = await createRuntime();
    await runtime.initializeConversation(scope);
    await runtime.syncRoster(scope, {
      agents: [agent("agent_1", "Reviewer"), agent("agent_2", "Implementer")],
      participants: [participant("agent_1"), participant("agent_2", "2026-05-24T00:10:00.000Z")],
    });
    await runtime.appendEvent(scope, {
      type: "mention.recorded",
      agentId: "agent_1",
      taskId: null,
      questionId: null,
      openspecChangeName: null,
      payload: { content: "Please review this." },
    });

    const agentsRaw = await readFile(
      join(rootDir, ".agenthub/collaboration/conversation_1/agents.json"),
      "utf8",
    );
    const roster = JSON.parse(agentsRaw) as Array<{ agentId: string; removedAt: string | null }>;
    expect(roster).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ agentId: "agent_1", removedAt: null }),
        expect.objectContaining({ agentId: "agent_2", removedAt: "2026-05-24T00:10:00.000Z" }),
      ]),
    );

    const eventLines = (
      await readFile(join(rootDir, ".agenthub/collaboration/conversation_1/events.jsonl"), "utf8")
    )
      .trim()
      .split("\n");
    expect(eventLines.map((line) => JSON.parse(line))).toEqual([
      expect.objectContaining({ type: "mention.recorded", agentId: "agent_1" }),
    ]);
  });

  it("enforces task claim tokens and summarizes blocked agents", async () => {
    const { runtime } = await createRuntime();
    await runtime.initializeConversation(scope);
    await runtime.syncRoster(scope, {
      agents: [agent("agent_1", "Reviewer")],
      participants: [participant("agent_1")],
    });
    const task = await runtime.createTask(scope, {
      title: "Review auth flow",
      description: "Check auth for security issues.",
      assignedAgentId: "agent_1",
      openspecChangeName: "add-auth",
    });
    const claimed = await runtime.claimTask(scope, task.id, "agent_1", task.version, {
      leaseMs: 15 * 60 * 1000,
    });
    await expect(
      runtime.completeTask(scope, task.id, "wrong-token", "Reviewed auth flow."),
    ).rejects.toThrow("Task claim token does not match");

    const question = await runtime.createUserQuestion(scope, {
      requestingAgentId: "agent_1",
      taskId: task.id,
      prompt: "Should auto-dispatch be allowed?",
    });
    const blockedTask = await runtime.blockTask(scope, task.id, question.id);
    await runtime.recordHeartbeat(scope, {
      agentId: "agent_1",
      status: "blocked",
      currentTaskId: task.id,
    });

    const status = await runtime.summarizeStatus(scope);
    expect(claimed.status).toBe("in-progress");
    expect(status.agents).toEqual([
      expect.objectContaining({
        agentId: "agent_1",
        availability: "blocked",
        currentTaskId: task.id,
        currentTaskTitle: "Review auth flow",
        blockedQuestionCount: 1,
        stale: false,
      }),
    ]);
    expect(status.pendingUserQuestions).toEqual([
      expect.objectContaining({
        questionId: question.id,
        requestingAgentId: "agent_1",
        taskId: task.id,
      }),
    ]);
  });

  it("completes claimed tasks and marks stale heartbeat summaries", async () => {
    const { runtime } = await createRuntime();
    await runtime.initializeConversation(scope);
    await runtime.syncRoster(scope, {
      agents: [agent("agent_1", "Reviewer")],
      participants: [participant("agent_1")],
    });
    const task = await runtime.createTask(scope, {
      title: "Review auth flow",
      description: "Check auth for security issues.",
      assignedAgentId: "agent_1",
      openspecChangeName: "add-auth",
    });
    const claimed = await runtime.claimTask(scope, task.id, "agent_1", task.version, {
      leaseMs: 15 * 60 * 1000,
    });
    const completed = await runtime.completeTask(scope, task.id, claimed.claim?.token ?? "", "Done.");
    await runtime.recordHeartbeat(scope, {
      agentId: "agent_1",
      status: "idle",
      currentTaskId: null,
      lastSeenAt: "2026-05-23T00:00:00.000Z",
    });

    const status = await runtime.summarizeStatus(scope, { heartbeatFreshnessMs: 60_000 });
    expect(completed).toMatchObject({
      status: "completed",
      claim: null,
      resultSummary: "Done.",
    });
    expect(status.agents[0]).toMatchObject({
      availability: "stale",
      stale: true,
      currentTaskId: null,
    });
  });

  it("covers orchestrator handoff through blocking user answer and completion", async () => {
    const collaboration = new CollaborationService();
    const orchestrator = agent("agent_orchestrator", "Orchestrator");
    const implementer = agent("agent_implementer", "Implementer");
    const route = collaboration.resolveGroupMessageRoute({
      content: "We need to implement the OpenSpec collaboration sidebar",
      ownerUserId: "user_1",
      agents: [orchestrator, implementer],
    });
    const { runtime } = await createRuntime();
    await runtime.initializeConversation(scope);
    await runtime.syncRoster(scope, {
      agents: [orchestrator, implementer],
      participants: [participant(orchestrator.id), participant(implementer.id)],
    });

    expect(route).toMatchObject({
      mode: "orchestrator-coordinate",
      agentId: orchestrator.id,
      requiresPlanApproval: true,
    });

    const task = await runtime.createTask(scope, {
      assignedAgentId: implementer.id,
      description: "Build the collaboration status inspector.",
      openspecChangeName: "add-openspec-agent-collaboration-plugin",
      title: "Build collaboration status inspector",
    });
    await runtime.claimTask(scope, task.id, implementer.id, task.version, {
      leaseMs: 15 * 60 * 1000,
    });
    const question = await runtime.createUserQuestion(scope, {
      requestingAgentId: implementer.id,
      taskId: task.id,
      prompt: "Should blocked questions stay in the right sidebar?",
    });
    const blockedTask = await runtime.blockTask(scope, task.id, question.id);
    await runtime.recordHeartbeat(scope, {
      agentId: implementer.id,
      currentTaskId: task.id,
      status: "blocked",
    });

    const blocked = await runtime.summarizeStatus(scope);
    expect(blocked.agents.find((entry) => entry.agentId === implementer.id)).toMatchObject({
      availability: "blocked",
      blockedQuestionCount: 1,
      currentTaskTitle: "Build collaboration status inspector",
    });
    expect(blocked.pendingUserQuestions).toEqual([
      expect.objectContaining({ questionId: question.id, prompt: question.prompt }),
    ]);

    const answered = await runtime.answerUserQuestion(scope, question.id, "Keep them in the right sidebar.");
    const resumed = await runtime.claimTask(scope, task.id, implementer.id, blockedTask.version, {
      leaseMs: 15 * 60 * 1000,
    });
    const completed = await runtime.completeTask(
      scope,
      task.id,
      resumed.claim?.token ?? "",
      "Collaboration status inspector completed.",
    );
    const finalStatus = await runtime.summarizeStatus(scope);

    expect(answered).toMatchObject({ status: "answered", answer: "Keep them in the right sidebar." });
    expect(completed.status).toBe("completed");
    expect(finalStatus.pendingUserQuestions).toHaveLength(0);
    expect(finalStatus.agents.find((entry) => entry.agentId === implementer.id)).toMatchObject({
      availability: "completed",
      currentTaskId: null,
    });
  });
});

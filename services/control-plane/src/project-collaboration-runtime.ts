import { appendFile, mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join } from "node:path";
import type {
  Agent,
  CollaborationAgentAvailability,
  CollaborationAgentRosterEntry,
  CollaborationEvent,
  CollaborationEventType,
  CollaborationHeartbeat,
  CollaborationHeartbeatStatus,
  CollaborationOpenSpecLink,
  CollaborationStatusSummary,
  CollaborationTask,
  CollaborationUserQuestion,
  ConversationParticipant,
  Id,
} from "@agenthub/contracts";
import {
  validateCollaborationAgentRosterEntry,
  validateCollaborationEvent,
  validateCollaborationHeartbeat,
  validateCollaborationOpenSpecLink,
  validateCollaborationTask,
  validateCollaborationUserQuestion,
} from "@agenthub/contracts";

export interface CollaborationScope {
  readonly ownerUserId: Id;
  readonly workspaceId: Id;
  readonly projectId: Id;
  readonly conversationId: Id;
}

export interface ProjectCollaborationRuntimeOptions {
  readonly rootDir: string;
  readonly now?: () => Date;
  readonly randomId?: () => Id;
}

interface CreateTaskInput {
  readonly title: string;
  readonly description: string;
  readonly assignedAgentId: Id;
  readonly openspecChangeName?: string | null;
}

interface UserQuestionInput {
  readonly requestingAgentId: Id;
  readonly taskId?: Id | null;
  readonly prompt: string;
}

interface HeartbeatInput {
  readonly agentId: Id;
  readonly status: CollaborationHeartbeatStatus;
  readonly currentTaskId?: Id | null;
  readonly lastSeenAt?: string;
}

const DEFAULT_HEARTBEAT_FRESHNESS_MS = 60_000;

export class ProjectCollaborationRuntime {
  readonly #rootDir: string;
  readonly #now: () => Date;
  readonly #randomId: () => Id;

  constructor(options: ProjectCollaborationRuntimeOptions) {
    this.#rootDir = options.rootDir;
    this.#now = options.now ?? (() => new Date());
    this.#randomId = options.randomId ?? (() => crypto.randomUUID());
  }

  async initializeConversation(scope: CollaborationScope): Promise<CollaborationStatusSummary> {
    const root = this.#conversationRoot(scope.conversationId);
    await mkdir(join(root, "tasks"), { recursive: true });
    await mkdir(join(root, "inbox"), { recursive: true });
    await mkdir(join(root, "outbox"), { recursive: true });
    await mkdir(join(root, "questions"), { recursive: true });
    await mkdir(join(root, "heartbeats"), { recursive: true });
    await this.#writeJsonIfMissing(this.#agentsPath(scope), []);
    await this.#writeTextIfMissing(this.#eventsPath(scope), "");
    await this.#writeJsonIfMissing(this.#openSpecLinksPath(scope), []);
    return this.summarizeStatus(scope);
  }

  async syncRoster(
    scope: CollaborationScope,
    input: {
      readonly agents: readonly Agent[];
      readonly participants: readonly ConversationParticipant[];
    },
  ): Promise<readonly CollaborationAgentRosterEntry[]> {
    await this.initializeConversation(scope);
    const existing = await this.#readJson<CollaborationAgentRosterEntry[]>(
      this.#agentsPath(scope),
      [],
    );
    const byAgentId = new Map(existing.map((entry) => [entry.agentId, entry]));
    const now = this.#nowIso();

    for (const participant of input.participants) {
      const agent = input.agents.find((candidate) => candidate.id === participant.agentId);
      if (!agent) {
        continue;
      }
      const previous = byAgentId.get(agent.id);
      const entry: CollaborationAgentRosterEntry = {
        id: previous?.id ?? this.#randomId(),
        ownerUserId: scope.ownerUserId,
        workspaceId: scope.workspaceId,
        projectId: scope.projectId,
        conversationId: scope.conversationId,
        agentId: agent.id,
        displayName: agent.displayName,
        role: agent.role,
        capabilities: [...agent.capabilityTags],
        backend: this.#agentBackend(agent),
        availability: previous?.availability ?? "idle",
        currentTaskId: previous?.currentTaskId ?? null,
        removedAt: participant.archivedAt,
        createdAt: previous?.createdAt ?? now,
        updatedAt: now,
      };
      this.#assertValidRosterEntry(entry);
      byAgentId.set(agent.id, entry);
    }

    const roster = [...byAgentId.values()];
    await this.#writeJson(this.#agentsPath(scope), roster);
    return roster;
  }

  async appendEvent(
    scope: CollaborationScope,
    input: {
      readonly type: CollaborationEventType;
      readonly agentId?: Id | null;
      readonly taskId?: Id | null;
      readonly questionId?: Id | null;
      readonly openspecChangeName?: string | null;
      readonly payload?: Record<string, unknown>;
    },
  ): Promise<CollaborationEvent> {
    await this.initializeConversation(scope);
    const event: CollaborationEvent = {
      id: this.#randomId(),
      ownerUserId: scope.ownerUserId,
      workspaceId: scope.workspaceId,
      projectId: scope.projectId,
      conversationId: scope.conversationId,
      type: input.type,
      agentId: input.agentId ?? null,
      taskId: input.taskId ?? null,
      questionId: input.questionId ?? null,
      openspecChangeName: input.openspecChangeName ?? null,
      payload: input.payload ?? {},
      createdAt: this.#nowIso(),
    };
    const result = validateCollaborationEvent(event);
    if (!result.ok) {
      throw new Error(`Invalid collaboration event: ${result.issues?.join("; ")}`);
    }
    await appendFile(this.#eventsPath(scope), `${JSON.stringify(event)}\n`, "utf8");
    return event;
  }

  async createTask(scope: CollaborationScope, input: CreateTaskInput): Promise<CollaborationTask> {
    await this.initializeConversation(scope);
    const now = this.#nowIso();
    const task: CollaborationTask = {
      id: this.#randomId(),
      ownerUserId: scope.ownerUserId,
      workspaceId: scope.workspaceId,
      projectId: scope.projectId,
      conversationId: scope.conversationId,
      title: input.title,
      description: input.description,
      status: "pending",
      assignedAgentId: input.assignedAgentId,
      claim: null,
      version: 1,
      blockedByQuestionIds: [],
      openspecChangeName: input.openspecChangeName ?? null,
      resultSummary: null,
      failureReason: null,
      createdAt: now,
      updatedAt: now,
    };
    await this.#writeTask(scope, task);
    await this.appendEvent(scope, {
      type: "task.created",
      agentId: input.assignedAgentId,
      taskId: task.id,
      openspecChangeName: task.openspecChangeName,
    });
    return task;
  }

  async claimTask(
    scope: CollaborationScope,
    taskId: Id,
    agentId: Id,
    expectedVersion: number,
    options: { readonly leaseMs: number },
  ): Promise<CollaborationTask> {
    const task = await this.#requireTask(scope, taskId);
    if (task.version !== expectedVersion) {
      throw new Error("Task version does not match");
    }
    if (task.assignedAgentId !== agentId) {
      throw new Error("Task is assigned to another agent");
    }
    if (task.status !== "pending" && task.status !== "blocked") {
      throw new Error("Task is not claimable");
    }
    if (task.claim) {
      throw new Error("Task already has an active claim");
    }
    const updated: CollaborationTask = {
      ...task,
      status: "in-progress",
      claim: {
        token: this.#randomId(),
        agentId,
        leasedUntil: new Date(this.#now().getTime() + options.leaseMs).toISOString(),
      },
      version: task.version + 1,
      updatedAt: this.#nowIso(),
    };
    await this.#writeTask(scope, updated);
    await this.appendEvent(scope, { type: "task.claimed", agentId, taskId });
    return updated;
  }

  async blockTask(
    scope: CollaborationScope,
    taskId: Id,
    questionId: Id,
  ): Promise<CollaborationTask> {
    const task = await this.#requireTask(scope, taskId);
    const updated: CollaborationTask = {
      ...task,
      status: "blocked",
      claim: null,
      blockedByQuestionIds: [...new Set([...task.blockedByQuestionIds, questionId])],
      version: task.version + 1,
      updatedAt: this.#nowIso(),
    };
    await this.#writeTask(scope, updated);
    await this.appendEvent(scope, {
      type: "task.blocked",
      agentId: task.assignedAgentId,
      taskId,
      questionId,
    });
    return updated;
  }

  async completeTask(
    scope: CollaborationScope,
    taskId: Id,
    claimToken: Id,
    resultSummary: string,
  ): Promise<CollaborationTask> {
    const task = await this.#requireTask(scope, taskId);
    if (!task.claim || task.claim.token !== claimToken) {
      throw new Error("Task claim token does not match");
    }
    if (new Date(task.claim.leasedUntil).getTime() <= this.#now().getTime()) {
      throw new Error("Task claim lease has expired");
    }
    const updated: CollaborationTask = {
      ...task,
      status: "completed",
      claim: null,
      resultSummary,
      failureReason: null,
      version: task.version + 1,
      updatedAt: this.#nowIso(),
    };
    await this.#writeTask(scope, updated);
    await this.appendEvent(scope, {
      type: "task.completed",
      agentId: task.assignedAgentId,
      taskId,
      openspecChangeName: task.openspecChangeName,
      payload: { resultSummary },
    });
    return updated;
  }

  async failTask(
    scope: CollaborationScope,
    taskId: Id,
    claimToken: Id,
    failureReason: string,
  ): Promise<CollaborationTask> {
    const task = await this.#requireTask(scope, taskId);
    if (!task.claim || task.claim.token !== claimToken) {
      throw new Error("Task claim token does not match");
    }
    const updated: CollaborationTask = {
      ...task,
      status: "failed",
      claim: null,
      resultSummary: null,
      failureReason,
      version: task.version + 1,
      updatedAt: this.#nowIso(),
    };
    await this.#writeTask(scope, updated);
    await this.appendEvent(scope, {
      type: "task.failed",
      agentId: task.assignedAgentId,
      taskId,
      payload: { failureReason },
    });
    return updated;
  }

  async createUserQuestion(
    scope: CollaborationScope,
    input: UserQuestionInput,
  ): Promise<CollaborationUserQuestion> {
    await this.initializeConversation(scope);
    const now = this.#nowIso();
    const question: CollaborationUserQuestion = {
      id: this.#randomId(),
      ownerUserId: scope.ownerUserId,
      workspaceId: scope.workspaceId,
      projectId: scope.projectId,
      conversationId: scope.conversationId,
      requestingAgentId: input.requestingAgentId,
      taskId: input.taskId ?? null,
      status: "pending",
      prompt: input.prompt,
      answer: null,
      answeredAt: null,
      createdAt: now,
      updatedAt: now,
    };
    await this.#writeQuestion(scope, question);
    await this.appendEvent(scope, {
      type: "question.created",
      agentId: input.requestingAgentId,
      taskId: input.taskId ?? null,
      questionId: question.id,
    });
    return question;
  }

  async answerUserQuestion(
    scope: CollaborationScope,
    questionId: Id,
    answer: string,
  ): Promise<CollaborationUserQuestion> {
    const question = await this.#requireQuestion(scope, questionId);
    const updated: CollaborationUserQuestion = {
      ...question,
      status: "answered",
      answer,
      answeredAt: this.#nowIso(),
      updatedAt: this.#nowIso(),
    };
    await this.#writeQuestion(scope, updated);
    await this.appendEvent(scope, {
      type: "question.answered",
      agentId: question.requestingAgentId,
      taskId: question.taskId,
      questionId,
    });
    return updated;
  }

  async recordHeartbeat(scope: CollaborationScope, input: HeartbeatInput): Promise<CollaborationHeartbeat> {
    await this.initializeConversation(scope);
    const heartbeat: CollaborationHeartbeat = {
      id: this.#randomId(),
      ownerUserId: scope.ownerUserId,
      workspaceId: scope.workspaceId,
      projectId: scope.projectId,
      conversationId: scope.conversationId,
      agentId: input.agentId,
      status: input.status,
      currentTaskId: input.currentTaskId ?? null,
      lastSeenAt: input.lastSeenAt ?? this.#nowIso(),
    };
    const result = validateCollaborationHeartbeat(heartbeat);
    if (!result.ok) {
      throw new Error(`Invalid collaboration heartbeat: ${result.issues?.join("; ")}`);
    }
    await this.#writeJson(this.#heartbeatPath(scope, input.agentId), heartbeat);
    return heartbeat;
  }

  async summarizeStatus(
    scope: CollaborationScope,
    options: { readonly heartbeatFreshnessMs?: number } = {},
  ): Promise<CollaborationStatusSummary> {
    await this.initializeFilesOnly(scope);
    const freshnessMs = options.heartbeatFreshnessMs ?? DEFAULT_HEARTBEAT_FRESHNESS_MS;
    const roster = await this.#readJson<CollaborationAgentRosterEntry[]>(
      this.#agentsPath(scope),
      [],
    );
    const tasks = await this.#readTasks(scope);
    const questions = await this.#readQuestions(scope);
    const links = await this.#readOpenSpecLinks(scope);
    const nowMs = this.#now().getTime();

    return {
      conversationId: scope.conversationId,
      projectId: scope.projectId,
      state: "available",
      agents: await Promise.all(
        roster
          .filter((entry) => !entry.removedAt)
          .map(async (entry) => {
            const heartbeat = await this.#readJson<CollaborationHeartbeat | null>(
              this.#heartbeatPath(scope, entry.agentId),
              null,
            );
            const agentTasks = tasks.filter((task) => task.assignedAgentId === entry.agentId);
            const heartbeatTask = heartbeat?.currentTaskId
              ? tasks.find((task) => task.id === heartbeat.currentTaskId)
              : null;
            const activeTask =
              heartbeatTask ??
              agentTasks.find((task) => task.status === "in-progress" || task.status === "blocked") ??
              agentTasks.at(-1) ??
              null;
            const pendingQuestions = questions.filter(
              (question) =>
                question.status === "pending" &&
                question.requestingAgentId === entry.agentId &&
                (!activeTask || question.taskId === activeTask.id),
            );
            const stale = heartbeat
              ? nowMs - new Date(heartbeat.lastSeenAt).getTime() > freshnessMs
              : false;
            return {
              agentId: entry.agentId,
              displayName: entry.displayName,
              availability: this.#availability(entry, heartbeat, activeTask, pendingQuestions.length, stale),
              currentTaskId: activeTask && !this.#isTerminalTask(activeTask) ? activeTask.id : null,
              currentTaskTitle: activeTask && !this.#isTerminalTask(activeTask) ? activeTask.title : null,
              blockedQuestionCount: pendingQuestions.length,
              stale,
            };
          }),
      ),
      openSpecLinks: links.map((link) => ({
        changeName: link.openspecChangeName,
        artifact: link.artifact,
        projectionStatus: link.projectionStatus,
      })),
      pendingUserQuestions: questions
        .filter((question) => question.status === "pending")
        .map((question) => ({
          questionId: question.id,
          requestingAgentId: question.requestingAgentId,
          taskId: question.taskId,
          prompt: question.prompt,
          createdAt: question.createdAt,
        })),
    };
  }

  private async initializeFilesOnly(scope: CollaborationScope): Promise<void> {
    const root = this.#conversationRoot(scope.conversationId);
    await mkdir(join(root, "tasks"), { recursive: true });
    await mkdir(join(root, "inbox"), { recursive: true });
    await mkdir(join(root, "outbox"), { recursive: true });
    await mkdir(join(root, "questions"), { recursive: true });
    await mkdir(join(root, "heartbeats"), { recursive: true });
    await this.#writeJsonIfMissing(this.#agentsPath(scope), []);
    await this.#writeTextIfMissing(this.#eventsPath(scope), "");
    await this.#writeJsonIfMissing(this.#openSpecLinksPath(scope), []);
  }

  #availability(
    entry: CollaborationAgentRosterEntry,
    heartbeat: CollaborationHeartbeat | null,
    task: CollaborationTask | null,
    pendingQuestionCount: number,
    stale: boolean,
  ): CollaborationAgentAvailability {
    if (pendingQuestionCount > 0 || task?.status === "blocked") {
      return "blocked";
    }
    if (stale) {
      return "stale";
    }
    if (task?.status === "completed") {
      return "completed";
    }
    if (task?.status === "failed") {
      return "failed";
    }
    if (heartbeat?.status === "executing") {
      return "active";
    }
    if (heartbeat?.status === "blocked") {
      return "blocked";
    }
    return entry.availability === "active" ? "active" : "idle";
  }

  #isTerminalTask(task: CollaborationTask): boolean {
    return task.status === "completed" || task.status === "failed" || task.status === "cancelled";
  }

  #agentBackend(agent: Agent): CollaborationAgentRosterEntry["backend"] {
    const runtime = agent.policy["runtime"];
    const provider =
      runtime && typeof runtime === "object" && !Array.isArray(runtime)
        ? (runtime as Record<string, unknown>)["provider"]
        : agent.policy["runtimeProvider"];
    if (provider === "codex") return "codex";
    if (provider === "opencode") return "opencode";
    if (provider === "custom") return "custom";
    return "claude-code";
  }

  async #readTasks(scope: CollaborationScope): Promise<CollaborationTask[]> {
    const root = this.#conversationRoot(scope.conversationId);
    const tasks: CollaborationTask[] = [];
    const { readdir } = await import("node:fs/promises");
    for (const file of await readdir(join(root, "tasks")).catch(() => [])) {
      if (file.endsWith(".json")) {
        tasks.push(await this.#readJson<CollaborationTask>(join(root, "tasks", file), null as never));
      }
    }
    return tasks.filter(Boolean);
  }

  async #readQuestions(scope: CollaborationScope): Promise<CollaborationUserQuestion[]> {
    const root = this.#conversationRoot(scope.conversationId);
    const questions: CollaborationUserQuestion[] = [];
    const { readdir } = await import("node:fs/promises");
    for (const file of await readdir(join(root, "questions")).catch(() => [])) {
      if (file.endsWith(".json")) {
        questions.push(
          await this.#readJson<CollaborationUserQuestion>(join(root, "questions", file), null as never),
        );
      }
    }
    return questions.filter(Boolean);
  }

  async #readOpenSpecLinks(scope: CollaborationScope): Promise<CollaborationOpenSpecLink[]> {
    const links = await this.#readJson<CollaborationOpenSpecLink[]>(
      this.#openSpecLinksPath(scope),
      [],
    );
    return links.filter((link) => validateCollaborationOpenSpecLink(link).ok);
  }

  async #requireTask(scope: CollaborationScope, taskId: Id): Promise<CollaborationTask> {
    const task = await this.#readJson<CollaborationTask | null>(this.#taskPath(scope, taskId), null);
    if (!task) {
      throw new Error("Collaboration task not found");
    }
    return task;
  }

  async #requireQuestion(scope: CollaborationScope, questionId: Id): Promise<CollaborationUserQuestion> {
    const question = await this.#readJson<CollaborationUserQuestion | null>(
      this.#questionPath(scope, questionId),
      null,
    );
    if (!question) {
      throw new Error("Collaboration question not found");
    }
    return question;
  }

  async #writeTask(scope: CollaborationScope, task: CollaborationTask): Promise<void> {
    const result = validateCollaborationTask(task);
    if (!result.ok) {
      throw new Error(`Invalid collaboration task: ${result.issues?.join("; ")}`);
    }
    await this.#writeJson(this.#taskPath(scope, task.id), task);
  }

  async #writeQuestion(
    scope: CollaborationScope,
    question: CollaborationUserQuestion,
  ): Promise<void> {
    const result = validateCollaborationUserQuestion(question);
    if (!result.ok) {
      throw new Error(`Invalid collaboration question: ${result.issues?.join("; ")}`);
    }
    await this.#writeJson(this.#questionPath(scope, question.id), question);
  }

  #assertValidRosterEntry(entry: CollaborationAgentRosterEntry): void {
    const result = validateCollaborationAgentRosterEntry(entry);
    if (!result.ok) {
      throw new Error(`Invalid collaboration roster entry: ${result.issues?.join("; ")}`);
    }
  }

  async #readJson<T>(path: string, fallback: T): Promise<T> {
    if (!existsSync(path)) {
      return fallback;
    }
    try {
      return JSON.parse(await readFile(path, "utf8")) as T;
    } catch {
      return fallback;
    }
  }

  async #writeJsonIfMissing(path: string, value: unknown): Promise<void> {
    if (!existsSync(path)) {
      await this.#writeJson(path, value);
    }
  }

  async #writeTextIfMissing(path: string, value: string): Promise<void> {
    if (!existsSync(path)) {
      await mkdir(join(path, ".."), { recursive: true });
      await writeFile(path, value, "utf8");
    }
  }

  async #writeJson(path: string, value: unknown): Promise<void> {
    await mkdir(join(path, ".."), { recursive: true });
    const tmp = `${path}.${process.pid}.${Date.now()}.tmp`;
    await writeFile(tmp, `${JSON.stringify(value, null, 2)}\n`, "utf8");
    await rename(tmp, path);
  }

  #conversationRoot(conversationId: Id): string {
    return join(this.#rootDir, ".agenthub", "collaboration", this.#safeSegment(conversationId));
  }

  #agentsPath(scope: CollaborationScope): string {
    return join(this.#conversationRoot(scope.conversationId), "agents.json");
  }

  #eventsPath(scope: CollaborationScope): string {
    return join(this.#conversationRoot(scope.conversationId), "events.jsonl");
  }

  #taskPath(scope: CollaborationScope, taskId: Id): string {
    return join(this.#conversationRoot(scope.conversationId), "tasks", `${this.#safeSegment(taskId)}.json`);
  }

  #questionPath(scope: CollaborationScope, questionId: Id): string {
    return join(
      this.#conversationRoot(scope.conversationId),
      "questions",
      `${this.#safeSegment(questionId)}.json`,
    );
  }

  #heartbeatPath(scope: CollaborationScope, agentId: Id): string {
    return join(
      this.#conversationRoot(scope.conversationId),
      "heartbeats",
      `${this.#safeSegment(agentId)}.json`,
    );
  }

  #openSpecLinksPath(scope: CollaborationScope): string {
    return join(this.#conversationRoot(scope.conversationId), "openspec-links.json");
  }

  #safeSegment(value: string): string {
    if (!/^[A-Za-z0-9._-]+$/.test(value)) {
      throw new Error(`Unsafe collaboration path segment: ${value}`);
    }
    return value;
  }

  #nowIso(): string {
    return this.#now().toISOString();
  }
}

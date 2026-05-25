import type { Agent, Conversation, Id, ISODateTime, PlanStatus, Run } from "@agenthub/contracts";
import {
  type OrchestratorDispatchPlan,
  validateOrchestratorDispatchPlan,
} from "@agenthub/contracts";

export interface ConversationCreateInput {
  readonly ownerUserId: Id;
  readonly workspaceId: Id;
  readonly kind: Conversation["kind"];
  readonly title: string;
}

export interface MentionRoute {
  readonly mode: "direct-agent" | "orchestrator-plan";
  readonly agentId: Id;
}

export interface PlanRecord {
  readonly id: Id;
  readonly ownerUserId: Id;
  readonly workspaceId: Id;
  readonly conversationId: Id;
  readonly status: PlanStatus;
  readonly plan: OrchestratorDispatchPlan;
  readonly createdAt: ISODateTime;
  readonly updatedAt: ISODateTime;
}

export interface TaskAssignment {
  readonly id: Id;
  readonly planId: Id;
  readonly stepId: Id;
  readonly agentId: Id;
  readonly runId: Id;
}

export class CollaborationService {
  readonly #now: () => Date;
  readonly #conversations = new Map<Id, Conversation>();
  readonly #plans = new Map<Id, PlanRecord>();
  readonly #assignments: TaskAssignment[] = [];

  constructor(options: { readonly now?: () => Date } = {}) {
    this.#now = options.now ?? (() => new Date());
  }

  createConversation(input: ConversationCreateInput): Conversation {
    const now = this.#now().toISOString();
    const conversation: Conversation = {
      id: crypto.randomUUID(),
      ownerUserId: input.ownerUserId,
      workspaceId: input.workspaceId,
      kind: input.kind,
      title: input.title,
      pinnedAt: null,
      notificationsMuted: false,
      archivedAt: null,
      createdAt: now,
      updatedAt: now,
    };
    this.#conversations.set(conversation.id, conversation);
    return conversation;
  }

  routeMention(target: Agent): MentionRoute {
    return {
      mode: target.role === "orchestrator" ? "orchestrator-plan" : "direct-agent",
      agentId: target.id,
    };
  }

  createDraftPlan(ownerUserId: Id, value: unknown): PlanRecord {
    const validation = validateOrchestratorDispatchPlan(value);
    if (!validation.ok || !validation.data) {
      throw new Error(`Invalid dispatch plan: ${validation.issues?.join("; ") ?? "unknown issue"}`);
    }
    const now = this.#now().toISOString();
    const record: PlanRecord = {
      id: validation.data.id,
      ownerUserId,
      workspaceId: validation.data.workspaceId,
      conversationId: validation.data.conversationId,
      status: validation.data.status,
      plan: validation.data,
      createdAt: now,
      updatedAt: now,
    };
    this.#plans.set(record.id, record);
    return record;
  }

  updatePlanStatus(ownerUserId: Id, planId: Id, status: PlanStatus): PlanRecord {
    const plan = this.#requireOwnedPlan(ownerUserId, planId);
    const updated = {
      ...plan,
      status,
      plan: {
        ...plan.plan,
        status,
      },
      updatedAt: this.#now().toISOString(),
    };
    this.#plans.set(updated.id, updated);
    return updated;
  }

  createTaskAssignments(ownerUserId: Id, planId: Id, runs: readonly Run[]): readonly TaskAssignment[] {
    const plan = this.#requireOwnedPlan(ownerUserId, planId);
    const assignments = plan.plan.steps.map((step) => {
      const run = runs.find((candidate) => candidate.agentId === step.assignedAgentId);
      if (!run) {
        throw new Error(`Missing run for plan step ${step.id}`);
      }
      return {
        id: crypto.randomUUID(),
        planId,
        stepId: step.id,
        agentId: step.assignedAgentId,
        runId: run.id,
      };
    });
    this.#assignments.push(...assignments);
    this.updatePlanStatus(ownerUserId, planId, "dispatched");
    return assignments;
  }

  createSummary(ownerUserId: Id, planId: Id, runs: readonly Run[]): string {
    const plan = this.#requireOwnedPlan(ownerUserId, planId);
    const completed = runs.filter((run) => run.status === "completed").length;
    const failed = runs.filter((run) => run.status === "failed").length;
    this.updatePlanStatus(ownerUserId, planId, failed > 0 ? "failed" : "completed");
    return `${plan.plan.goal}: ${completed} completed, ${failed} failed.`;
  }

  #requireOwnedPlan(ownerUserId: Id, planId: Id): PlanRecord {
    const plan = this.#plans.get(planId);
    if (!plan || plan.ownerUserId !== ownerUserId) {
      throw new Error("Plan not found");
    }
    return plan;
  }
}

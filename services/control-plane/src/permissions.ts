import type {
  AuditLog,
  Id,
  PermissionActionKind,
  PermissionRequest,
  PermissionRisk,
  PermissionStatus,
} from "@agenthub/contracts";

export interface PermissionCreateInput {
  readonly ownerUserId: Id;
  readonly workspaceId: Id;
  readonly conversationId: Id;
  readonly runId: Id;
  readonly agentId: Id;
  readonly actionKind: PermissionActionKind;
  readonly risk: PermissionRisk;
  readonly summary: string;
  readonly command?: string | null;
  readonly paths?: readonly string[];
}

export class PermissionService {
  readonly #now: () => Date;
  readonly #timeoutMs: number;
  readonly #permissions = new Map<Id, PermissionRequest>();
  readonly #auditLogs: AuditLog[] = [];

  constructor(options: { readonly now?: () => Date; readonly timeoutMs?: number } = {}) {
    this.#now = options.now ?? (() => new Date());
    this.#timeoutMs = options.timeoutMs ?? 300_000;
  }

  createRequest(input: PermissionCreateInput): PermissionRequest {
    const now = this.#now().toISOString();
    const request: PermissionRequest = {
      id: crypto.randomUUID(),
      ownerUserId: input.ownerUserId,
      workspaceId: input.workspaceId,
      conversationId: input.conversationId,
      runId: input.runId,
      agentId: input.agentId,
      actionKind: input.actionKind,
      risk: input.risk,
      status: "pending",
      summary: input.summary,
      command: input.command ?? null,
      paths: input.paths ?? [],
      decidedAt: null,
      createdAt: now,
      updatedAt: now,
    };
    this.#permissions.set(request.id, request);
    this.#audit(request, "permission.requested", { status: request.status });
    return request;
  }

  allowOnce(ownerUserId: Id, permissionId: Id): PermissionRequest {
    return this.#decide(ownerUserId, permissionId, "allowed-once");
  }

  deny(ownerUserId: Id, permissionId: Id): PermissionRequest {
    return this.#decide(ownerUserId, permissionId, "denied");
  }

  expireTimedOutRequests(): readonly PermissionRequest[] {
    const now = this.#now().getTime();
    const expired: PermissionRequest[] = [];
    for (const request of this.#permissions.values()) {
      if (request.status !== "pending") {
        continue;
      }
      if (now - Date.parse(request.createdAt) > this.#timeoutMs) {
        const updated = this.#update(request, "expired");
        expired.push(updated);
      }
    }
    return expired;
  }

  get auditLogs(): readonly AuditLog[] {
    return this.#auditLogs;
  }

  #decide(ownerUserId: Id, permissionId: Id, status: "allowed-once" | "denied"): PermissionRequest {
    const request = this.#permissions.get(permissionId);
    if (!request || request.ownerUserId !== ownerUserId) {
      throw new Error("Permission request not found");
    }
    if (request.status !== "pending") {
      throw new Error("Permission request is not pending");
    }
    return this.#update(request, status);
  }

  #update(request: PermissionRequest, status: PermissionStatus): PermissionRequest {
    const now = this.#now().toISOString();
    const updated: PermissionRequest = {
      ...request,
      status,
      decidedAt: status === "allowed-once" || status === "denied" ? now : request.decidedAt,
      updatedAt: now,
    };
    this.#permissions.set(updated.id, updated);
    this.#audit(updated, "permission.status_changed", { status });
    return updated;
  }

  #audit(request: PermissionRequest, eventType: string, payload: Record<string, unknown>): void {
    const now = this.#now().toISOString();
    this.#auditLogs.push({
      id: crypto.randomUUID(),
      ownerUserId: request.ownerUserId,
      workspaceId: request.workspaceId,
      conversationId: request.conversationId,
      runId: request.runId,
      agentId: request.agentId,
      eventType,
      payload: {
        permissionId: request.id,
        actionKind: request.actionKind,
        risk: request.risk,
        ...payload,
      },
      createdAt: now,
      updatedAt: now,
    });
  }
}


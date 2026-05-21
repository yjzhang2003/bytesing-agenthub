import type { Id, RuntimeDevice, Run, RunStatus } from "@agenthub/contracts";
import type { AgentHubEvent } from "@agenthub/contracts";
import { ControlPlaneEventBus } from "./events.js";

export interface RegisterRuntimeDeviceInput {
  readonly displayName: string;
  readonly platform: RuntimeDevice["platform"];
  readonly appVersion: string;
  readonly capabilities: readonly string[];
}

export interface WorkspaceBinding {
  readonly workspaceId: Id;
  readonly ownerUserId: Id;
  readonly runtimeDeviceId: Id;
  readonly localPath: string;
}

export interface CreateRunInput {
  readonly workspaceId: Id;
  readonly conversationId: Id;
  readonly agentId: Id;
  readonly planId?: Id | null;
}

export class ControlPlaneRegistry {
  readonly #events: ControlPlaneEventBus;
  readonly #now: () => Date;
  readonly #offlineTimeoutMs: number;
  readonly #devices = new Map<Id, RuntimeDevice>();
  readonly #workspaceBindings = new Map<Id, WorkspaceBinding>();
  readonly #runs = new Map<Id, Run>();

  constructor(options: {
    readonly events?: ControlPlaneEventBus;
    readonly now?: () => Date;
    readonly offlineTimeoutMs?: number;
  } = {}) {
    this.#events = options.events ?? new ControlPlaneEventBus();
    this.#now = options.now ?? (() => new Date());
    this.#offlineTimeoutMs = options.offlineTimeoutMs ?? 45_000;
  }

  get events(): ControlPlaneEventBus {
    return this.#events;
  }

  registerRuntimeDevice(ownerUserId: Id, input: RegisterRuntimeDeviceInput): RuntimeDevice {
    const existing = [...this.#devices.values()].find(
      (device) => device.ownerUserId === ownerUserId && device.displayName === input.displayName,
    );
    const now = this.#now().toISOString();
    const device: RuntimeDevice = {
      id: existing?.id ?? crypto.randomUUID(),
      ownerUserId,
      displayName: input.displayName,
      platform: input.platform,
      appVersion: input.appVersion,
      status: "online",
      capabilities: input.capabilities,
      lastHeartbeatAt: now,
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
    };

    this.#devices.set(device.id, device);
    this.#events.publish(this.#deviceStatusEvent(device));
    return device;
  }

  recordHeartbeat(ownerUserId: Id, runtimeDeviceId: Id): RuntimeDevice {
    const device = this.#requireOwnedDevice(ownerUserId, runtimeDeviceId);
    const updated = {
      ...device,
      status: "online" as const,
      lastHeartbeatAt: this.#now().toISOString(),
      updatedAt: this.#now().toISOString(),
    };
    this.#devices.set(updated.id, updated);
    this.#events.publish(this.#deviceStatusEvent(updated));
    return updated;
  }

  markExpiredDevicesOffline(): readonly RuntimeDevice[] {
    const now = this.#now().getTime();
    const changed: RuntimeDevice[] = [];
    for (const device of this.#devices.values()) {
      if (!device.lastHeartbeatAt || device.status === "offline") {
        continue;
      }
      const ageMs = now - Date.parse(device.lastHeartbeatAt);
      if (ageMs > this.#offlineTimeoutMs) {
        const updated = { ...device, status: "offline" as const, updatedAt: this.#now().toISOString() };
        this.#devices.set(updated.id, updated);
        changed.push(updated);
        this.#events.publish(this.#deviceStatusEvent(updated));
      }
    }
    return changed;
  }

  bindWorkspace(binding: WorkspaceBinding): WorkspaceBinding {
    this.#requireOwnedDevice(binding.ownerUserId, binding.runtimeDeviceId);
    this.#workspaceBindings.set(binding.workspaceId, binding);
    return binding;
  }

  createRun(ownerUserId: Id, input: CreateRunInput): Run {
    const binding = this.#workspaceBindings.get(input.workspaceId);
    if (!binding || binding.ownerUserId !== ownerUserId) {
      throw new Error("Workspace is not bound to this user runtime");
    }

    const device = this.#requireOwnedDevice(ownerUserId, binding.runtimeDeviceId);
    if (device.status === "offline") {
      throw new Error("Workspace runtime is offline");
    }

    const now = this.#now().toISOString();
    const run: Run = {
      id: crypto.randomUUID(),
      ownerUserId,
      workspaceId: input.workspaceId,
      conversationId: input.conversationId,
      agentId: input.agentId,
      planId: input.planId ?? null,
      status: "queued",
      startedAt: null,
      completedAt: null,
      failureReason: null,
      createdAt: now,
      updatedAt: now,
    };
    this.#runs.set(run.id, run);
    this.#publishRunStatus(run, "agent.run.status_changed");
    return run;
  }

  updateRunStatus(ownerUserId: Id, runId: Id, status: RunStatus, failureReason?: string): Run {
    const run = this.#requireOwnedRun(ownerUserId, runId);
    const now = this.#now().toISOString();
    const updated: Run = {
      ...run,
      status,
      startedAt: run.startedAt ?? (status === "running" || status === "streaming" ? now : null),
      completedAt:
        status === "completed" || status === "failed" || status === "cancelled" ? now : run.completedAt,
      failureReason: failureReason ?? run.failureReason,
      updatedAt: now,
    };
    this.#runs.set(updated.id, updated);
    this.#publishRunStatus(updated, status === "failed" ? "agent.run.failed" : "agent.run.status_changed");
    return updated;
  }

  cancelRun(ownerUserId: Id, runId: Id): Run {
    return this.updateRunStatus(ownerUserId, runId, "cancelling");
  }

  getRun(ownerUserId: Id, runId: Id): Run {
    return this.#requireOwnedRun(ownerUserId, runId);
  }

  #requireOwnedDevice(ownerUserId: Id, runtimeDeviceId: Id): RuntimeDevice {
    const device = this.#devices.get(runtimeDeviceId);
    if (!device || device.ownerUserId !== ownerUserId) {
      throw new Error("Runtime device not found");
    }
    return device;
  }

  #requireOwnedRun(ownerUserId: Id, runId: Id): Run {
    const run = this.#runs.get(runId);
    if (!run || run.ownerUserId !== ownerUserId) {
      throw new Error("Run not found");
    }
    return run;
  }

  #deviceStatusEvent(device: RuntimeDevice): AgentHubEvent {
    return {
      id: crypto.randomUUID(),
      type: "runtime.device.status_changed",
      ownerUserId: device.ownerUserId,
      workspaceId: null,
      conversationId: null,
      runId: null,
      occurredAt: this.#now().toISOString(),
      payload: {
        runtimeDeviceId: device.id,
        status: device.status,
      },
    };
  }

  #publishRunStatus(run: Run, type: "agent.run.status_changed" | "agent.run.failed"): void {
    const payload = {
      status: run.status,
      agentId: run.agentId,
      ...(run.failureReason ? { message: run.failureReason } : {}),
    };

    this.#events.publish({
      id: crypto.randomUUID(),
      type,
      ownerUserId: run.ownerUserId,
      workspaceId: run.workspaceId,
      conversationId: run.conversationId,
      runId: run.id,
      occurredAt: this.#now().toISOString(),
      payload,
    });
  }
}

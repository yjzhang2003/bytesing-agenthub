import type {
  Agent,
  AgentHubProviderMode,
  Id,
  Message,
  ProviderRuntimeEvent,
  RuntimeCommand,
  RuntimeDevice,
  Run,
  RunStatus,
  WorkbenchSnapshot,
  Workspace,
  WorkspaceMetadata,
} from "@agenthub/contracts";
import { agentHubLocalDefaults } from "@agenthub/contracts";
import type { AgentHubEvent } from "@agenthub/contracts";
import { ControlPlaneEventBus } from "./events.js";

export interface RegisterRuntimeDeviceInput {
  readonly id?: Id;
  readonly displayName: string;
  readonly platform: RuntimeDevice["platform"];
  readonly appVersion: string;
  readonly capabilities: readonly string[];
  readonly workspace?: WorkspaceMetadata;
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
  readonly prompt?: string;
  readonly planId?: Id | null;
}

export class ControlPlaneRegistry {
  readonly #events: ControlPlaneEventBus;
  readonly #now: () => Date;
  readonly #offlineTimeoutMs: number;
  readonly #devices = new Map<Id, RuntimeDevice>();
  readonly #workspaceBindings = new Map<Id, WorkspaceBinding>();
  readonly #workspaceMetadata = new Map<Id, WorkspaceMetadata>();
  readonly #runs = new Map<Id, Run>();
  readonly #messages = new Map<Id, Message>();
  readonly #commands = new Map<Id, RuntimeCommand[]>();

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
      id: input.id ?? existing?.id ?? crypto.randomUUID(),
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
    if (input.workspace) {
      this.#workspaceMetadata.set(input.workspace.workspaceId, input.workspace);
      this.bindWorkspace({
        workspaceId: input.workspace.workspaceId,
        ownerUserId,
        runtimeDeviceId: device.id,
        localPath: input.workspace.localPathLabel,
      });
    }
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

  markRuntimeOffline(ownerUserId: Id, runtimeDeviceId: Id): RuntimeDevice {
    const device = this.#requireOwnedDevice(ownerUserId, runtimeDeviceId);
    const updated = {
      ...device,
      status: "offline" as const,
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

  createRun(
    ownerUserId: Id,
    input: CreateRunInput,
    providerMode: AgentHubProviderMode = "smoke",
  ): Run {
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
    this.#enqueueCommand(binding.runtimeDeviceId, {
      id: crypto.randomUUID(),
      type: "run.start",
      runtimeDeviceId: binding.runtimeDeviceId,
      createdAt: now,
      payload: {
        runId: run.id,
        workspaceId: run.workspaceId,
        conversationId: run.conversationId,
        agentId: run.agentId,
        workspacePath: binding.localPath,
        prompt: input.prompt ?? "Run AgentHub local smoke task",
        systemPrompt: this.#agentSystemPrompt(input.agentId),
        providerMode,
      },
    });
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
    const run = this.updateRunStatus(ownerUserId, runId, "cancelling");
    const binding = this.#workspaceBindings.get(run.workspaceId);
    if (binding) {
      this.#enqueueCommand(binding.runtimeDeviceId, {
        id: crypto.randomUUID(),
        type: "run.cancel",
        runtimeDeviceId: binding.runtimeDeviceId,
        createdAt: this.#now().toISOString(),
        payload: { runId },
      });
    }
    return run;
  }

  getRun(ownerUserId: Id, runId: Id): Run {
    return this.#requireOwnedRun(ownerUserId, runId);
  }

  takeRuntimeCommands(ownerUserId: Id, runtimeDeviceId: Id): readonly RuntimeCommand[] {
    this.#requireOwnedDevice(ownerUserId, runtimeDeviceId);
    const commands = this.#commands.get(runtimeDeviceId) ?? [];
    this.#commands.set(runtimeDeviceId, []);
    return commands;
  }

  recordProviderRuntimeEvent(ownerUserId: Id, event: ProviderRuntimeEvent): void {
    const run = this.#requireOwnedRun(ownerUserId, event.runId);
    if (event.type === "run.status") {
      this.updateRunStatus(ownerUserId, event.runId, event.status, event.message);
      return;
    }

    if (event.type === "message.delta") {
      const now = this.#now().toISOString();
      const message: Message = {
        id: crypto.randomUUID(),
        ownerUserId,
        conversationId: run.conversationId,
        authorKind: "agent",
        authorId: event.agentId,
        parts: [{ type: "markdown", text: event.delta, runId: event.runId }],
        replyToMessageId: null,
        createdAt: now,
        updatedAt: now,
      };
      this.#messages.set(message.id, message);
      this.#events.publish({
        id: crypto.randomUUID(),
        type: "agent.run.message_delta",
        ownerUserId,
        workspaceId: run.workspaceId,
        conversationId: run.conversationId,
        runId: run.id,
        occurredAt: now,
        payload: {
          agentId: event.agentId,
          delta: event.delta,
        },
      });
    }
  }

  latestRuntimeStatus(ownerUserId: Id): {
    readonly online: boolean;
    readonly deviceId: Id | null;
    readonly lastHeartbeatAt: string | null;
    readonly capabilities: readonly string[];
  } {
    const devices = [...this.#devices.values()].filter((device) => device.ownerUserId === ownerUserId);
    const latest = devices.at(-1);
    return {
      online: latest?.status === "online" || latest?.status === "active-running",
      deviceId: latest?.id ?? null,
      lastHeartbeatAt: latest?.lastHeartbeatAt ?? null,
      capabilities: latest?.capabilities ?? [],
    };
  }

  createWorkbenchSnapshot(ownerUserId: Id): WorkbenchSnapshot {
    const now = this.#now().toISOString();
    const metadata =
      this.#workspaceMetadata.get(agentHubLocalDefaults.workspaceId) ??
      this.#workspaceMetadata.values().next().value ??
      null;
    const runtimeDeviceId = this.#devices.values().next().value?.id ?? null;
    const workspace: Workspace = {
      id: metadata?.workspaceId ?? agentHubLocalDefaults.workspaceId,
      ownerUserId,
      name: metadata?.displayName ?? "AgentHub local workspace",
      runtimeKind: "local",
      runtimeDeviceId,
      localPath: null,
      repoUrl: null,
      defaultBranch: metadata?.gitBranch ?? null,
      createdAt: now,
      updatedAt: now,
    };

    return {
      authenticated: true,
      userId: ownerUserId,
      activeWorkspaceId: workspace.id,
      activeConversationId: agentHubLocalDefaults.conversationId,
      workspaces: [workspace],
      runtimeDevices: [...this.#devices.values()].filter((device) => device.ownerUserId === ownerUserId),
      workspaceMetadata: metadata,
      conversations: [
        {
          id: agentHubLocalDefaults.conversationId,
          ownerUserId,
          workspaceId: workspace.id,
          kind: "group",
          title: "AgentHub local runnable demo",
          archivedAt: null,
          createdAt: now,
          updatedAt: now,
        },
      ],
      agents: this.#defaultAgents(ownerUserId, workspace.id, now),
      runs: [...this.#runs.values()].filter((run) => run.ownerUserId === ownerUserId),
      messages: [...this.#messages.values()].filter((message) => message.ownerUserId === ownerUserId),
      availableActions: runtimeDeviceId ? ["run.start"] : [],
    };
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

  #enqueueCommand(runtimeDeviceId: Id, command: RuntimeCommand): void {
    const current = this.#commands.get(runtimeDeviceId) ?? [];
    this.#commands.set(runtimeDeviceId, [...current, command]);
  }

  #defaultAgents(ownerUserId: Id, workspaceId: Id, now: string): readonly Agent[] {
    return [
      {
        id: agentHubLocalDefaults.orchestratorAgentId,
        ownerUserId,
        providerId: "provider_local",
        workspaceId,
        displayName: "Orchestrator",
        role: "orchestrator",
        systemPrompt: "Coordinate local AgentHub work through Plan Mode.",
        capabilityTags: ["planning", "coordination"],
        policy: {},
        createdAt: now,
        updatedAt: now,
      },
      {
        id: agentHubLocalDefaults.implementerAgentId,
        ownerUserId,
        providerId: "provider_local",
        workspaceId,
        displayName: "Implementer",
        role: "worker",
        systemPrompt: "Implement local AgentHub tasks through the configured provider.",
        capabilityTags: ["code", "local-runtime"],
        policy: {},
        createdAt: now,
        updatedAt: now,
      },
    ];
  }

  #agentSystemPrompt(agentId: Id): string {
    return agentId === agentHubLocalDefaults.orchestratorAgentId
      ? "You are the AgentHub Orchestrator."
      : "You are the AgentHub Implementer.";
  }
}

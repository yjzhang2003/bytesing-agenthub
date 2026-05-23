import type {
  Agent,
  AgentMemoryConfig,
  AgentHubProviderMode,
  Conversation,
  ConversationParticipant,
  CreateAgentConversationRequest,
  CreateAgentRequest,
  Id,
  MemoryHealth,
  Message,
  ProviderHealth,
  ProviderRuntimeEvent,
  RuntimeCommand,
  RuntimeDevice,
  Run,
  RunStatus,
  UpdateAgentRequest,
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
  readonly providerHealth?: ProviderHealth;
  readonly memoryHealth?: MemoryHealth;
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
  readonly #agents = new Map<Id, Agent>();
  readonly #conversations = new Map<Id, Conversation>();
  readonly #activeConversationIds = new Map<Id, Id>();
  readonly #archivedAgentIds = new Set<Id>();
  readonly #conversationParticipants = new Map<Id, ConversationParticipant>();
  readonly #providerHealth = new Map<Id, ProviderHealth>();
  readonly #memoryHealth = new Map<Id, MemoryHealth>();

  constructor(
    options: {
      readonly events?: ControlPlaneEventBus;
      readonly now?: () => Date;
      readonly offlineTimeoutMs?: number;
    } = {},
  ) {
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
    if (input.providerHealth) {
      this.#providerHealth.set(ownerUserId, input.providerHealth);
    }
    if (input.memoryHealth) {
      this.#memoryHealth.set(ownerUserId, input.memoryHealth);
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
        const updated = {
          ...device,
          status: "offline" as const,
          updatedAt: this.#now().toISOString(),
        };
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
    const conversation = this.#requireConversationAvailable(ownerUserId, input.conversationId);
    if (conversation && conversation.workspaceId !== input.workspaceId) {
      throw new Error("Conversation is not available in this local workspace");
    }
    const binding = this.#workspaceBindings.get(input.workspaceId);
    if (!binding || binding.ownerUserId !== ownerUserId) {
      throw new Error("Workspace is not bound to this user runtime");
    }

    const device = this.#requireOwnedDevice(ownerUserId, binding.runtimeDeviceId);
    if (device.status === "offline") {
      throw new Error("Workspace runtime is offline");
    }
    const agent = this.#requireRunnableAgent(ownerUserId, input.workspaceId, input.agentId);
    if (conversation) {
      const activeParticipants = this.listConversationParticipants(ownerUserId, conversation.id);
      if (!activeParticipants.some((participant) => participant.agentId === agent.id)) {
        throw new Error("Agent is not a participant in this conversation");
      }
    }

    const now = this.#now().toISOString();
    const userMessage: Message = {
      id: crypto.randomUUID(),
      ownerUserId,
      conversationId: input.conversationId,
      authorKind: "user",
      authorId: ownerUserId,
      parts: [{ type: "text", text: input.prompt ?? "Run AgentHub local smoke task" }],
      replyToMessageId: null,
      createdAt: now,
      updatedAt: now,
    };
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
    this.#messages.set(userMessage.id, userMessage);
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
        systemPrompt: agent.systemPrompt,
        providerMode,
        memory: this.#agentMemoryConfig(ownerUserId, run.workspaceId, input.agentId),
      },
    });
    return run;
  }

  createAgent(ownerUserId: Id, input: CreateAgentRequest): Agent {
    this.#requireWorkspaceAvailable(ownerUserId, input.workspaceId);
    const now = this.#now().toISOString();
    const agent: Agent = {
      id: crypto.randomUUID(),
      ownerUserId,
      providerId: "provider_local",
      workspaceId: input.workspaceId,
      displayName: input.displayName,
      role: input.role,
      systemPrompt: input.systemPrompt,
      capabilityTags: [...(input.capabilityTags ?? [])],
      policy: input.policy ?? {},
      createdAt: now,
      updatedAt: now,
    };
    this.#agents.set(agent.id, agent);
    return agent;
  }

  createAgentConversation(
    ownerUserId: Id,
    input: CreateAgentConversationRequest,
  ): {
    readonly conversation: Conversation;
    readonly participant: ConversationParticipant;
  } {
    this.#requireWorkspaceAvailable(ownerUserId, input.workspaceId);
    const agent = this.#requireRunnableAgent(ownerUserId, input.workspaceId, input.agentId);
    const now = this.#now().toISOString();
    const conversation: Conversation = {
      id: crypto.randomUUID(),
      ownerUserId,
      workspaceId: input.workspaceId,
      kind: "single-agent",
      title: agent.displayName,
      archivedAt: null,
      createdAt: now,
      updatedAt: now,
    };
    const participant: ConversationParticipant = {
      id: crypto.randomUUID(),
      ownerUserId,
      conversationId: conversation.id,
      agentId: agent.id,
      addedByUserId: ownerUserId,
      archivedAt: null,
      createdAt: now,
      updatedAt: now,
    };
    this.#conversations.set(conversation.id, conversation);
    this.#conversationParticipants.set(
      this.#participantKey(conversation.id, agent.id),
      participant,
    );
    this.#activeConversationIds.set(ownerUserId, conversation.id);
    this.#publishMembershipChanged(participant, "added");
    return { conversation, participant };
  }

  setActiveConversation(ownerUserId: Id, conversationId: Id): Conversation | null {
    const conversation = this.#requireConversationAvailable(ownerUserId, conversationId);
    this.#activeConversationIds.set(ownerUserId, conversationId);
    return conversation;
  }

  updateAgent(ownerUserId: Id, agentId: Id, input: UpdateAgentRequest): Agent {
    const existing = this.#requireOwnedAgent(ownerUserId, agentId);
    const updated: Agent = {
      ...existing,
      ...(input.displayName ? { displayName: input.displayName } : {}),
      ...(input.role ? { role: input.role } : {}),
      ...(input.systemPrompt !== undefined ? { systemPrompt: input.systemPrompt } : {}),
      ...(input.capabilityTags ? { capabilityTags: [...input.capabilityTags] } : {}),
      ...(input.policy ? { policy: input.policy } : {}),
      updatedAt: this.#now().toISOString(),
    };
    this.#agents.set(updated.id, updated);
    return updated;
  }

  archiveAgent(ownerUserId: Id, agentId: Id): Agent {
    const agent = this.#requireOwnedAgent(ownerUserId, agentId);
    this.#archivedAgentIds.add(agent.id);
    for (const participant of this.#conversationParticipants.values()) {
      if (
        participant.ownerUserId === ownerUserId &&
        participant.agentId === agent.id &&
        !participant.archivedAt
      ) {
        this.removeAgentFromConversation(ownerUserId, participant.conversationId, agent.id);
      }
    }
    return { ...agent, updatedAt: this.#now().toISOString() };
  }

  listAgents(ownerUserId: Id, workspaceId?: Id): readonly Agent[] {
    const agents = this.#allAgents(ownerUserId, workspaceId);
    return agents.filter((agent) => !this.#archivedAgentIds.has(agent.id));
  }

  listConversationParticipants(
    ownerUserId: Id,
    conversationId: Id,
  ): readonly ConversationParticipant[] {
    this.#ensureDefaultConversationMembership(ownerUserId, conversationId);
    return [...this.#conversationParticipants.values()].filter(
      (participant) =>
        participant.ownerUserId === ownerUserId &&
        participant.conversationId === conversationId &&
        !participant.archivedAt,
    );
  }

  addAgentToConversation(
    ownerUserId: Id,
    conversationId: Id,
    agentId: Id,
  ): ConversationParticipant {
    this.#requireConversationAvailable(ownerUserId, conversationId);
    const agent = this.#requireOwnedAgent(ownerUserId, agentId);
    const now = this.#now().toISOString();
    const key = this.#participantKey(conversationId, agent.id);
    const existing = this.#conversationParticipants.get(key);
    const participant: ConversationParticipant = {
      id: existing?.id ?? crypto.randomUUID(),
      ownerUserId,
      conversationId,
      agentId: agent.id,
      addedByUserId: ownerUserId,
      archivedAt: null,
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
    };
    this.#conversationParticipants.set(key, participant);
    this.#publishMembershipChanged(participant, "added");
    return participant;
  }

  removeAgentFromConversation(
    ownerUserId: Id,
    conversationId: Id,
    agentId: Id,
  ): ConversationParticipant {
    this.#requireConversationAvailable(ownerUserId, conversationId);
    this.#requireOwnedAgent(ownerUserId, agentId);
    this.#ensureDefaultConversationMembership(ownerUserId, conversationId);
    const key = this.#participantKey(conversationId, agentId);
    const existing = this.#conversationParticipants.get(key);
    if (!existing || existing.ownerUserId !== ownerUserId || existing.archivedAt) {
      throw new Error("Conversation participant not found");
    }
    const updated: ConversationParticipant = {
      ...existing,
      archivedAt: this.#now().toISOString(),
      updatedAt: this.#now().toISOString(),
    };
    this.#conversationParticipants.set(key, updated);
    this.#publishMembershipChanged(updated, "removed");
    return updated;
  }

  latestProviderHealth(ownerUserId: Id): ProviderHealth | null {
    return this.#providerHealth.get(ownerUserId) ?? null;
  }

  latestMemoryHealth(ownerUserId: Id): MemoryHealth | null {
    return this.#memoryHealth.get(ownerUserId) ?? null;
  }

  updateRunStatus(ownerUserId: Id, runId: Id, status: RunStatus, failureReason?: string): Run {
    const run = this.#requireOwnedRun(ownerUserId, runId);
    const now = this.#now().toISOString();
    const updated: Run = {
      ...run,
      status,
      startedAt: run.startedAt ?? (status === "running" || status === "streaming" ? now : null),
      completedAt:
        status === "completed" || status === "failed" || status === "cancelled"
          ? now
          : run.completedAt,
      failureReason: failureReason ?? run.failureReason,
      updatedAt: now,
    };
    this.#runs.set(updated.id, updated);
    this.#publishRunStatus(updated, this.#runEventTypeForStatus(status));
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
      const existing = [...this.#messages.values()].find(
        (message) =>
          message.ownerUserId === ownerUserId &&
          message.authorKind === "agent" &&
          message.authorId === event.agentId &&
          message.parts.some((part) => part.runId === event.runId),
      );
      const message: Message = existing
        ? {
            ...existing,
            parts: existing.parts.map((part, index) =>
              index === 0 ? { ...part, text: `${part.text ?? ""}${event.delta}` } : part,
            ),
            updatedAt: now,
          }
        : {
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
    const devices = [...this.#devices.values()].filter(
      (device) => device.ownerUserId === ownerUserId,
    );
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

    const defaultConversation: Conversation = {
      id: agentHubLocalDefaults.conversationId,
      ownerUserId,
      workspaceId: workspace.id,
      kind: "group",
      title: "AgentHub local runnable demo",
      archivedAt: null,
      createdAt: now,
      updatedAt: now,
    };
    this.#ensureDefaultConversationMembership(ownerUserId, defaultConversation.id);
    const conversations = [
      defaultConversation,
      ...[...this.#conversations.values()].filter(
        (conversation) => conversation.ownerUserId === ownerUserId && !conversation.archivedAt,
      ),
    ];
    const activeConversationId = conversations.some(
      (conversation) => conversation.id === this.#activeConversationIds.get(ownerUserId),
    )
      ? (this.#activeConversationIds.get(ownerUserId) ?? defaultConversation.id)
      : defaultConversation.id;

    return {
      authenticated: true,
      userId: ownerUserId,
      activeWorkspaceId: workspace.id,
      activeConversationId,
      workspaces: [workspace],
      runtimeDevices: [...this.#devices.values()].filter(
        (device) => device.ownerUserId === ownerUserId,
      ),
      workspaceMetadata: metadata,
      providerHealth: this.latestProviderHealth(ownerUserId),
      memoryHealth: this.latestMemoryHealth(ownerUserId),
      conversations,
      conversationParticipants: [...this.#conversationParticipants.values()].filter(
        (participant) => participant.ownerUserId === ownerUserId && !participant.archivedAt,
      ),
      agents: this.listAgents(ownerUserId, workspace.id),
      runs: [...this.#runs.values()].filter((run) => run.ownerUserId === ownerUserId),
      messages: [...this.#messages.values()].filter(
        (message) => message.ownerUserId === ownerUserId,
      ),
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

  #requireOwnedAgent(ownerUserId: Id, agentId: Id): Agent {
    const agent =
      this.#agents.get(agentId) ??
      this.#defaultAgents(
        ownerUserId,
        agentHubLocalDefaults.workspaceId,
        this.#now().toISOString(),
      ).find((candidate) => candidate.id === agentId);
    if (!agent || agent.ownerUserId !== ownerUserId || this.#archivedAgentIds.has(agent.id)) {
      throw new Error("Agent not found");
    }
    return agent;
  }

  #requireRunnableAgent(ownerUserId: Id, workspaceId: Id, agentId: Id): Agent {
    const agent = this.#allAgents(ownerUserId, workspaceId).find(
      (candidate) => candidate.id === agentId,
    );
    if (!agent) {
      throw new Error("Agent not found");
    }
    return agent;
  }

  #requireWorkspaceAvailable(ownerUserId: Id, workspaceId: Id): void {
    const binding = this.#workspaceBindings.get(workspaceId);
    const metadata = this.#workspaceMetadata.get(workspaceId);
    if (binding?.ownerUserId === ownerUserId || metadata?.workspaceId === workspaceId) {
      return;
    }
    if (workspaceId === agentHubLocalDefaults.workspaceId) {
      return;
    }
    throw new Error("Workspace not found");
  }

  #requireConversationAvailable(ownerUserId: Id, conversationId: Id): Conversation | null {
    if (conversationId === agentHubLocalDefaults.conversationId) {
      return null;
    }
    const conversation = this.#conversations.get(conversationId);
    if (!conversation || conversation.ownerUserId !== ownerUserId || conversation.archivedAt) {
      throw new Error("Conversation is not available in this local workspace");
    }
    return conversation;
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

  #publishRunStatus(
    run: Run,
    type: "agent.run.status_changed" | "agent.run.completed" | "agent.run.failed",
  ): void {
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

  #participantKey(conversationId: Id, agentId: Id): Id {
    return `${conversationId}:${agentId}`;
  }

  #ensureDefaultConversationMembership(ownerUserId: Id, conversationId: Id): void {
    if (conversationId !== agentHubLocalDefaults.conversationId) {
      return;
    }
    const hasMembership = [...this.#conversationParticipants.values()].some(
      (participant) =>
        participant.ownerUserId === ownerUserId && participant.conversationId === conversationId,
    );
    if (hasMembership) {
      return;
    }
    const now = this.#now().toISOString();
    for (const agent of this.#defaultAgents(ownerUserId, agentHubLocalDefaults.workspaceId, now)) {
      if (this.#archivedAgentIds.has(agent.id)) {
        continue;
      }
      const participant: ConversationParticipant = {
        id: crypto.randomUUID(),
        ownerUserId,
        conversationId,
        agentId: agent.id,
        addedByUserId: ownerUserId,
        archivedAt: null,
        createdAt: now,
        updatedAt: now,
      };
      this.#conversationParticipants.set(
        this.#participantKey(conversationId, agent.id),
        participant,
      );
    }
  }

  #publishMembershipChanged(
    participant: ConversationParticipant,
    action: "added" | "removed",
  ): void {
    this.#events.publish({
      id: crypto.randomUUID(),
      type: "conversation.membership_changed",
      ownerUserId: participant.ownerUserId,
      workspaceId: agentHubLocalDefaults.workspaceId,
      conversationId: participant.conversationId,
      runId: null,
      occurredAt: this.#now().toISOString(),
      payload: {
        agentId: participant.agentId,
        action,
      },
    });
  }

  #runEventTypeForStatus(
    status: RunStatus,
  ): "agent.run.status_changed" | "agent.run.completed" | "agent.run.failed" {
    if (status === "completed") {
      return "agent.run.completed";
    }
    if (status === "failed") {
      return "agent.run.failed";
    }
    return "agent.run.status_changed";
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

  #allAgents(ownerUserId: Id, workspaceId?: Id): readonly Agent[] {
    const now = this.#now().toISOString();
    const targetWorkspaceId =
      workspaceId ??
      this.#workspaceMetadata.values().next().value?.workspaceId ??
      agentHubLocalDefaults.workspaceId;
    const customAgents = [...this.#agents.values()].filter(
      (agent) =>
        agent.ownerUserId === ownerUserId &&
        (!workspaceId || agent.workspaceId === workspaceId) &&
        !this.#archivedAgentIds.has(agent.id),
    );
    const defaultAgents = this.#defaultAgents(ownerUserId, targetWorkspaceId, now).filter(
      (agent) =>
        !this.#archivedAgentIds.has(agent.id) &&
        !customAgents.some((custom) => custom.id === agent.id),
    );
    return [...defaultAgents, ...customAgents];
  }

  #agentMemoryConfig(ownerUserId: Id, workspaceId: Id, agentId: Id): AgentMemoryConfig {
    return {
      enabled: true,
      namespace: `agenthub:${ownerUserId}:${workspaceId}:${agentId}`,
    };
  }
}

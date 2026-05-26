import type {
  Agent,
  AgentMemoryConfig,
  AgentHubProviderMode,
  ClaudeCodeDiscoverySummary,
  ClaudeCodeRunOptions,
  Conversation,
  ConversationAgentClaudeSession,
  ConversationParticipant,
  CreateConnectionCheckRequest,
  CreateAgentConversationRequest,
  CreateAgentRequest,
  Id,
  LocalConnectionCheckTarget,
  MemoryHealth,
  Message,
  Project,
  ProviderHealth,
  ProviderRuntimeEvent,
  RuntimeConnectionCheckResult,
  RuntimeCommand,
  RuntimeDevice,
  Run,
  RunStatus,
  UpdateAgentRequest,
  UpdateConversationAgentSettingsRequest,
  UpdateConversationRequest,
  WorkbenchSnapshot,
  Workspace,
  WorkspaceMetadata,
} from "@agenthub/contracts";
import {
  agentHubLocalDefaults,
  claudeCodeRunOptionsSchema,
  conversationAgentSettingsSchema,
} from "@agenthub/contracts";
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
  readonly claudeCodeDiscovery?: ClaudeCodeDiscoverySummary;
}

export interface WorkspaceBinding {
  readonly workspaceId: Id;
  readonly ownerUserId: Id;
  readonly runtimeDeviceId: Id;
  readonly localPath: string;
}

export interface CreateRunInput {
  readonly workspaceId: Id;
  readonly projectId?: Id;
  readonly conversationId: Id;
  readonly agentId: Id;
  readonly prompt?: string;
  readonly planId?: Id | null;
  readonly claudeCode?: ClaudeCodeRunOptions;
}

export interface ConnectionCheckRequestResult {
  readonly acceptedTargets: readonly CreateConnectionCheckRequest["targets"][number][];
  readonly queuedTargets: readonly LocalConnectionCheckTarget[];
  readonly runtimeOnline: boolean;
}

export class ControlPlaneRegistry {
  readonly #events: ControlPlaneEventBus;
  readonly #now: () => Date;
  readonly #offlineTimeoutMs: number;
  readonly #devices = new Map<Id, RuntimeDevice>();
  readonly #workspaceBindings = new Map<Id, WorkspaceBinding>();
  readonly #workspaceMetadata = new Map<Id, WorkspaceMetadata>();
  readonly #projects = new Map<Id, Project>();
  readonly #runs = new Map<Id, Run>();
  readonly #messages = new Map<Id, Message>();
  readonly #commands = new Map<Id, RuntimeCommand[]>();
  readonly #agents = new Map<Id, Agent>();
  readonly #conversations = new Map<Id, Conversation>();
  readonly #activeConversationIds = new Map<Id, Id>();
  readonly #archivedAgentIds = new Set<Id>();
  readonly #conversationParticipants = new Map<Id, ConversationParticipant>();
  readonly #conversationAgentClaudeSessions = new Map<Id, ConversationAgentClaudeSession>();
  readonly #providerHealth = new Map<Id, ProviderHealth>();
  readonly #memoryHealth = new Map<Id, MemoryHealth>();
  readonly #claudeCodeDiscovery = new Map<Id, ClaudeCodeDiscoverySummary>();

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
      this.#ensureDefaultProject(ownerUserId, device.id, input.workspace);
    }
    if (input.providerHealth) {
      this.#providerHealth.set(ownerUserId, input.providerHealth);
    }
    if (input.memoryHealth) {
      this.#memoryHealth.set(ownerUserId, input.memoryHealth);
    }
    if (input.claudeCodeDiscovery) {
      this.#claudeCodeDiscovery.set(ownerUserId, input.claudeCodeDiscovery);
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
    this.#ensureDefaultProject(binding.ownerUserId, binding.runtimeDeviceId, {
      workspaceId: binding.workspaceId,
      displayName: binding.workspaceId,
      localPathLabel: binding.localPath,
      gitBranch: null,
      gitBaseCommit: null,
      dirty: false,
      providerCapabilities: [],
    });
    return binding;
  }

  createRun(
    ownerUserId: Id,
    input: CreateRunInput,
    providerMode: AgentHubProviderMode = "claude-code",
  ): Run {
    const conversation = this.#requireConversationAvailable(ownerUserId, input.conversationId);
    if (conversation && conversation.workspaceId !== input.workspaceId) {
      throw new Error("Conversation is not available in this local workspace");
    }
    const workspaceBinding = this.#workspaceBindings.get(input.workspaceId);
    if (!workspaceBinding || workspaceBinding.ownerUserId !== ownerUserId) {
      throw new Error("Workspace is not bound to this user runtime");
    }
    const project = this.#requireRunProject(ownerUserId, input.workspaceId, conversation, input.projectId);
    const device = this.#requireOwnedDevice(ownerUserId, project.runtimeDeviceId);
    if (device.status === "offline") {
      throw new Error("Workspace runtime is offline");
    }
    const agent = this.#requireRunnableAgent(ownerUserId, input.workspaceId, input.agentId);
    const effectiveProviderMode = this.#effectiveProviderMode(agent, providerMode);
    const activeParticipants = this.listConversationParticipants(ownerUserId, input.conversationId);
    const conversationParticipant =
      activeParticipants.find((participant) => participant.agentId === agent.id) ?? null;
    if (!conversationParticipant) {
      throw new Error("Agent is not a participant in this conversation");
    }
    if (conversationParticipant.conversationAgentSettings?.enabled === false) {
      throw new Error("Agent is disabled in this conversation");
    }

    const now = this.#now().toISOString();
    const claudeCodeOptions = this.#effectiveClaudeCodeOptions(agent, input.claudeCode);
    let claudeSession =
      effectiveProviderMode === "claude-code"
        ? this.#ensureConversationAgentClaudeSession({
            ownerUserId,
            workspaceId: input.workspaceId,
            conversationId: input.conversationId,
            agent,
            ...(claudeCodeOptions?.options
              ? { claudeCodeOptions: claudeCodeOptions.options }
              : {}),
          })
        : null;
    if (claudeSession && !claudeSession.sessionId && claudeCodeOptions?.options) {
      claudeSession = this.#touchConversationAgentClaudeSession(claudeSession, {
        claudeCode: this.#sessionDefiningClaudeCodeOptions(claudeCodeOptions.options),
      });
    }
    const effectiveClaudeCodeRunOptions = this.#effectiveRunClaudeCodeOptions(
      claudeCodeOptions?.options,
      claudeSession,
    );
    const claudeCodeOverrideSource = effectiveClaudeCodeRunOptions
      ? (claudeCodeOptions?.overrideSource ?? "agent-default")
      : null;
    const userMessage: Message = {
      id: crypto.randomUUID(),
      ownerUserId,
      conversationId: input.conversationId,
      authorKind: "user",
      authorId: ownerUserId,
      parts: [{ type: "text", text: input.prompt ?? "Run AgentHub local task" }],
      replyToMessageId: null,
      createdAt: now,
      updatedAt: now,
    };
    const run: Run = {
      id: crypto.randomUUID(),
      ownerUserId,
      workspaceId: input.workspaceId,
      projectId: project.id,
      conversationId: input.conversationId,
      agentId: input.agentId,
      planId: input.planId ?? null,
      status: "queued",
      startedAt: null,
      completedAt: null,
      failureReason: null,
      ...(effectiveClaudeCodeRunOptions && claudeCodeOverrideSource
        ? {
            claudeCode: {
              ...effectiveClaudeCodeRunOptions,
              overrideSource: claudeCodeOverrideSource,
              ...(effectiveClaudeCodeRunOptions.permissionPreset
                ? { effectivePermissionPreset: effectiveClaudeCodeRunOptions.permissionPreset }
                : {}),
              ...(effectiveClaudeCodeRunOptions.settingsSource
                ? { effectiveSettingsSource: effectiveClaudeCodeRunOptions.settingsSource }
                : {}),
            },
          }
        : {}),
      createdAt: now,
      updatedAt: now,
    };
    this.#messages.set(userMessage.id, userMessage);
    this.#runs.set(run.id, run);
    this.#publishRunStatus(run, "agent.run.status_changed");
    this.#enqueueCommand(project.runtimeDeviceId, {
      id: crypto.randomUUID(),
      type: "run.start",
      runtimeDeviceId: project.runtimeDeviceId,
      createdAt: now,
      payload: {
        runId: run.id,
        workspaceId: run.workspaceId,
        projectId: project.id,
        conversationId: run.conversationId,
        agentId: run.agentId,
        workspacePath: project.localPath ?? project.localPathLabel,
        prompt: input.prompt ?? "Run AgentHub local task",
        systemPrompt: this.#scopedSystemPrompt(agent, conversationParticipant),
        providerMode: effectiveProviderMode,
        memory: this.#agentMemoryConfig(ownerUserId, run.workspaceId, input.agentId),
        ...(effectiveClaudeCodeRunOptions ? { claudeCode: effectiveClaudeCodeRunOptions } : {}),
      },
    });
    if (claudeSession) {
      this.#touchConversationAgentClaudeSession(claudeSession, { lastRunId: run.id });
    }
    return run;
  }

  #effectiveClaudeCodeOptions(
    agent: Agent,
    override: ClaudeCodeRunOptions | undefined,
  ):
    | {
        readonly options: ClaudeCodeRunOptions;
        readonly overrideSource: "agent-default" | "run-override";
      }
    | undefined {
    if (override) {
      return { options: override, overrideSource: "run-override" };
    }
    const parsed = claudeCodeRunOptionsSchema.safeParse(agent.policy["claudeCode"]);
    return parsed.success
      ? { options: parsed.data as ClaudeCodeRunOptions, overrideSource: "agent-default" }
      : undefined;
  }

  #effectiveProviderMode(agent: Agent, fallback: AgentHubProviderMode): AgentHubProviderMode {
    if (fallback === "smoke") {
      return fallback;
    }
    const runtime = agent.policy["runtime"];
    const provider =
      runtime && typeof runtime === "object" && !Array.isArray(runtime)
        ? (runtime as Record<string, unknown>)["provider"]
        : agent.policy["runtimeProvider"];
    if (provider === "codex") {
      throw new Error("Codex runtime is not configured yet");
    }
    return "claude-code";
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
    readonly participants: readonly ConversationParticipant[];
  } {
    this.#requireWorkspaceAvailable(ownerUserId, input.workspaceId);
    const project = this.#createOrRequireProject(ownerUserId, input);
    if (project.workspaceId !== input.workspaceId) {
      throw new Error("Project is not available in this workspace");
    }
    const inputAgentIds = (input as { readonly agentIds?: readonly Id[] }).agentIds ?? [];
    const requestedAgentIds =
      inputAgentIds.length > 0
        ? inputAgentIds
        : ((input as unknown as { readonly agentId?: Id }).agentId
            ? [(input as unknown as { readonly agentId: Id }).agentId]
            : []);
    const agents = requestedAgentIds.map((agentId) =>
      this.#requireRunnableAgent(ownerUserId, input.workspaceId, agentId),
    );
    if (agents.length === 0) {
      throw new Error("At least one agent is required");
    }
    const now = this.#now().toISOString();
    const conversation: Conversation = {
      id: crypto.randomUUID(),
      ownerUserId,
      workspaceId: input.workspaceId,
      projectId: project.id,
      kind: agents.length === 1 ? "single-agent" : "group",
      title: agents.length === 1 ? agents[0]?.displayName ?? "New conversation" : "New group chat",
      pinnedAt: null,
      notificationsMuted: false,
      archivedAt: null,
      createdAt: now,
      updatedAt: now,
    };
    this.#conversations.set(conversation.id, conversation);
    const participants = agents.map((agent) => {
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
      this.#conversationParticipants.set(
        this.#participantKey(conversation.id, agent.id),
        participant,
      );
      this.#ensureConversationAgentClaudeSession({
        ownerUserId,
        workspaceId: conversation.workspaceId,
        conversationId: conversation.id,
        agent,
      });
      this.#publishMembershipChanged(participant, "added");
      return participant;
    });
    this.#activeConversationIds.set(ownerUserId, conversation.id);
    this.#touchProject(project.id);
    return { conversation, participant: participants[0]!, participants };
  }

  setActiveConversation(ownerUserId: Id, conversationId: Id): Conversation | null {
    const conversation = this.#requireConversationAvailable(ownerUserId, conversationId);
    this.#activeConversationIds.set(ownerUserId, conversationId);
    return conversation;
  }

  updateConversation(
    ownerUserId: Id,
    conversationId: Id,
    input: UpdateConversationRequest,
  ): Conversation {
    const existing = this.#requireMutableConversation(ownerUserId, conversationId);
    const now = this.#now().toISOString();
    const updated: Conversation = {
      ...existing,
      ...(input.title !== undefined ? { title: input.title.trim() } : {}),
      ...(input.pinned !== undefined ? { pinnedAt: input.pinned ? (existing.pinnedAt ?? now) : null } : {}),
      ...(input.notificationsMuted !== undefined
        ? { notificationsMuted: input.notificationsMuted }
        : {}),
      updatedAt: now,
    };
    this.#conversations.set(updated.id, updated);
    this.#publishConversationUpdated(updated);
    return updated;
  }

  archiveConversation(ownerUserId: Id, conversationId: Id): Conversation {
    const existing = this.#requireMutableConversation(ownerUserId, conversationId);
    const now = this.#now().toISOString();
    const updated: Conversation = {
      ...existing,
      archivedAt: now,
      updatedAt: now,
    };
    this.#conversations.set(updated.id, updated);
    for (const participant of this.#conversationParticipants.values()) {
      if (
        participant.ownerUserId === ownerUserId &&
        participant.conversationId === conversationId &&
        !participant.archivedAt
      ) {
        this.#conversationParticipants.set(this.#participantKey(conversationId, participant.agentId), {
          ...participant,
          archivedAt: now,
          updatedAt: now,
        });
      }
    }
    if (this.#activeConversationIds.get(ownerUserId) === conversationId) {
      this.#activeConversationIds.set(ownerUserId, agentHubLocalDefaults.conversationId);
    }
    this.#publishConversationUpdated(updated);
    return updated;
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
    const conversation = this.#requireConversationAvailable(ownerUserId, conversationId);
    this.#ensureConversationAgentClaudeSession({
      ownerUserId,
      workspaceId: conversation?.workspaceId ?? agentHubLocalDefaults.workspaceId,
      conversationId,
      agent,
    });
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

  updateConversationAgentSettings(
    ownerUserId: Id,
    conversationId: Id,
    agentId: Id,
    input: UpdateConversationAgentSettingsRequest,
  ): ConversationParticipant {
    this.#requireConversationAvailable(ownerUserId, conversationId);
    this.#requireOwnedAgent(ownerUserId, agentId);
    this.#ensureDefaultConversationMembership(ownerUserId, conversationId);
    const key = this.#participantKey(conversationId, agentId);
    const existing = this.#conversationParticipants.get(key);
    if (!existing || existing.ownerUserId !== ownerUserId || existing.archivedAt) {
      throw new Error("Conversation participant not found");
    }
    const parsed = conversationAgentSettingsSchema.parse(input);
    const updated: ConversationParticipant = {
      ...existing,
      conversationAgentSettings: {
        ...(existing.conversationAgentSettings ?? {}),
        ...parsed,
      },
      updatedAt: this.#now().toISOString(),
    };
    this.#conversationParticipants.set(key, updated);
    this.#publishMembershipChanged(updated, "settings-updated");
    return updated;
  }

  latestProviderHealth(ownerUserId: Id): ProviderHealth | null {
    return this.#providerHealth.get(ownerUserId) ?? null;
  }

  latestMemoryHealth(ownerUserId: Id): MemoryHealth | null {
    return this.#memoryHealth.get(ownerUserId) ?? null;
  }

  latestClaudeCodeDiscovery(ownerUserId: Id): ClaudeCodeDiscoverySummary | null {
    return this.#claudeCodeDiscovery.get(ownerUserId) ?? null;
  }

  requestConnectionChecks(
    ownerUserId: Id,
    input: CreateConnectionCheckRequest,
  ): ConnectionCheckRequestResult {
    this.#requireWorkspaceAvailable(ownerUserId, input.workspaceId);
    const binding = this.#workspaceBindings.get(input.workspaceId);
    if (!binding || binding.ownerUserId !== ownerUserId) {
      throw new Error("Workspace is not bound to this user runtime");
    }

    const device = this.#requireOwnedDevice(ownerUserId, binding.runtimeDeviceId);
    const runtimeOnline = device.status === "online" || device.status === "active-running";
    const queuedTargets = input.targets.filter(
      (target): target is LocalConnectionCheckTarget =>
        target === "provider" || target === "memory" || target === "claude-code",
    );
    if (queuedTargets.length > 0 && !runtimeOnline) {
      throw new Error("Desktop Runtime must be online to check local connections");
    }
    if (queuedTargets.length > 0) {
      this.#enqueueCommand(binding.runtimeDeviceId, {
        id: crypto.randomUUID(),
        type: "connection.check",
        runtimeDeviceId: binding.runtimeDeviceId,
        createdAt: this.#now().toISOString(),
        payload: {
          workspaceId: input.workspaceId,
          targets: [...new Set(queuedTargets)],
        },
      });
    }
    return {
      acceptedTargets: input.targets,
      queuedTargets: [...new Set(queuedTargets)],
      runtimeOnline,
    };
  }

  recordRuntimeConnectionCheckResult(ownerUserId: Id, result: RuntimeConnectionCheckResult): void {
    this.#requireOwnedDevice(ownerUserId, result.runtimeDeviceId);
    if (result.providerHealth) {
      this.#providerHealth.set(ownerUserId, result.providerHealth);
    }
    if (result.memoryHealth) {
      this.#memoryHealth.set(ownerUserId, result.memoryHealth);
    }
    if (result.claudeCodeDiscovery) {
      this.#claudeCodeDiscovery.set(ownerUserId, result.claudeCodeDiscovery);
    }
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
      failureReason:
        status === "failed" || status === "cancelled" ? (failureReason ?? run.failureReason) : null,
      updatedAt: now,
    };
    this.#runs.set(updated.id, updated);
    this.#publishRunStatus(updated, this.#runEventTypeForStatus(status));
    return updated;
  }

  cancelRun(ownerUserId: Id, runId: Id): Run {
    const run = this.updateRunStatus(ownerUserId, runId, "cancelling");
    const project = run.projectId ? this.#projects.get(run.projectId) : null;
    if (project?.ownerUserId === ownerUserId) {
      this.#enqueueCommand(project.runtimeDeviceId, {
        id: crypto.randomUUID(),
        type: "run.cancel",
        runtimeDeviceId: project.runtimeDeviceId,
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
    const run = this.#runs.get(event.runId);
    if (!run || run.ownerUserId !== ownerUserId) {
      if (event.type === "provider.session") {
        return;
      }
      throw new Error("Run not found");
    }
    if (event.type === "provider.session") {
      const session = this.#conversationAgentClaudeSessions.get(
        this.#claudeSessionKey(run.workspaceId, run.conversationId, run.agentId),
      );
      if (session) {
        this.#touchConversationAgentClaudeSession(session, {
          sessionId: event.sessionId,
          lastRunId: run.id,
        });
      }
      return;
    }
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
    const defaultProject = runtimeDeviceId
      ? this.#ensureDefaultProject(ownerUserId, runtimeDeviceId, metadata ?? {
          workspaceId: workspace.id,
          displayName: workspace.name,
          localPathLabel: workspace.localPath ?? "AgentHub default project",
          gitBranch: workspace.defaultBranch,
          gitBaseCommit: null,
          dirty: false,
          providerCapabilities: [],
        })
      : null;

    const defaultConversation: Conversation = {
      id: agentHubLocalDefaults.conversationId,
      ownerUserId,
      workspaceId: workspace.id,
      projectId: defaultProject?.id ?? null,
      kind: "group",
      title: "AgentHub local runnable demo",
      pinnedAt: null,
      notificationsMuted: false,
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
    ].sort(this.#compareConversations);
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
      projects: [...this.#projects.values()].filter(
        (project) => project.ownerUserId === ownerUserId && !project.archivedAt,
      ),
      runtimeDevices: [...this.#devices.values()].filter(
        (device) => device.ownerUserId === ownerUserId,
      ),
      workspaceMetadata: metadata,
      providerHealth: this.latestProviderHealth(ownerUserId),
      memoryHealth: this.latestMemoryHealth(ownerUserId),
      claudeCodeDiscovery: this.latestClaudeCodeDiscovery(ownerUserId),
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

  #createOrRequireProject(ownerUserId: Id, input: CreateAgentConversationRequest): Project {
    if (input.desktopProjectRegistration) {
      const existing = this.#projects.get(input.projectId);
      if (existing && existing.ownerUserId !== ownerUserId) {
        throw new Error("Project not found");
      }
      const now = this.#now().toISOString();
      const project: Project = {
        id: input.projectId,
        ownerUserId,
        workspaceId: input.workspaceId,
        name: input.desktopProjectRegistration.displayName,
        runtimeDeviceId: input.desktopProjectRegistration.runtimeDeviceId,
        localPath: input.desktopProjectRegistration.localPath,
        localPathLabel: input.desktopProjectRegistration.localPathLabel,
        repoUrl: null,
        gitBranch: input.desktopProjectRegistration.gitBranch ?? null,
        gitBaseCommit: input.desktopProjectRegistration.gitBaseCommit ?? null,
        dirty: input.desktopProjectRegistration.dirty ?? false,
        isDefault: input.desktopProjectRegistration.source === "desktop-default",
        lastUsedAt: now,
        archivedAt: null,
        createdAt: existing?.createdAt ?? now,
        updatedAt: now,
      };
      this.#requireOwnedDevice(ownerUserId, project.runtimeDeviceId);
      this.#projects.set(project.id, project);
      return project;
    }
    return input.projectId
      ? this.#requireProjectAvailable(ownerUserId, input.projectId)
      : this.#requireDefaultProjectForWorkspace(ownerUserId, input.workspaceId);
  }

  #requireProjectAvailable(ownerUserId: Id, projectId: Id): Project {
    const project = this.#projects.get(projectId);
    if (!project || project.ownerUserId !== ownerUserId || project.archivedAt) {
      throw new Error("Project not found");
    }
    return project;
  }

  #requireRunProject(
    ownerUserId: Id,
    workspaceId: Id,
    conversation: Conversation | null,
    projectId: Id | undefined,
  ): Project {
    const resolvedProjectId = projectId ?? conversation?.projectId;
    if (!resolvedProjectId) {
      if (!conversation) {
        return this.#requireDefaultProjectForWorkspace(ownerUserId, workspaceId);
      }
      throw new Error("Project selection is required before starting a local run");
    }
    const project = this.#requireProjectAvailable(ownerUserId, resolvedProjectId);
    if (conversation && project.id !== conversation.projectId) {
      throw new Error("Run project does not match the conversation project");
    }
    return project;
  }

  #ensureDefaultProject(
    ownerUserId: Id,
    runtimeDeviceId: Id,
    metadata: WorkspaceMetadata,
  ): Project {
    const existing = [...this.#projects.values()].find(
      (project) =>
        project.ownerUserId === ownerUserId &&
        project.workspaceId === metadata.workspaceId &&
        project.isDefault,
    );
    const now = this.#now().toISOString();
    const project: Project = {
      id: existing?.id ?? `${metadata.workspaceId}_default_project`,
      ownerUserId,
      workspaceId: metadata.workspaceId,
      name: metadata.displayName,
      runtimeDeviceId,
      localPath: metadata.localPathLabel,
      localPathLabel: metadata.localPathLabel,
      repoUrl: null,
      gitBranch: metadata.gitBranch,
      gitBaseCommit: metadata.gitBaseCommit,
      dirty: metadata.dirty,
      isDefault: true,
      lastUsedAt: existing?.lastUsedAt ?? null,
      archivedAt: null,
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
    };
    this.#projects.set(project.id, project);
    return project;
  }

  #requireDefaultProjectForWorkspace(ownerUserId: Id, workspaceId: Id): Project {
    const project = [...this.#projects.values()].find(
      (candidate) =>
        candidate.ownerUserId === ownerUserId &&
        candidate.workspaceId === workspaceId &&
        candidate.isDefault &&
        !candidate.archivedAt,
    );
    if (!project) {
      throw new Error("Project selection is required before starting a local run");
    }
    return project;
  }

  #touchProject(projectId: Id): void {
    const project = this.#projects.get(projectId);
    if (!project) {
      return;
    }
    this.#projects.set(projectId, {
      ...project,
      lastUsedAt: this.#now().toISOString(),
      updatedAt: this.#now().toISOString(),
    });
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

  #requireMutableConversation(ownerUserId: Id, conversationId: Id): Conversation {
    if (conversationId === agentHubLocalDefaults.conversationId) {
      throw new Error("Default conversation settings are managed by AgentHub");
    }
    const conversation = this.#requireConversationAvailable(ownerUserId, conversationId);
    if (!conversation) {
      throw new Error("Conversation is not available in this local workspace");
    }
    return conversation;
  }

  #compareConversations(a: Conversation, b: Conversation): number {
    if (a.pinnedAt && b.pinnedAt && a.pinnedAt !== b.pinnedAt) {
      return b.pinnedAt.localeCompare(a.pinnedAt);
    }
    if (a.pinnedAt && !b.pinnedAt) {
      return -1;
    }
    if (!a.pinnedAt && b.pinnedAt) {
      return 1;
    }
    return b.updatedAt.localeCompare(a.updatedAt);
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

  #claudeSessionKey(workspaceId: Id, conversationId: Id, agentId: Id): Id {
    return `${workspaceId}:${conversationId}:${agentId}`;
  }

  #isClaudeCodeBackedAgent(agent: Agent): boolean {
    const runtime = agent.policy["runtime"];
    const provider =
      runtime && typeof runtime === "object" && !Array.isArray(runtime)
        ? (runtime as Record<string, unknown>)["provider"]
        : agent.policy["runtimeProvider"];
    return provider !== "codex";
  }

  #ensureConversationAgentClaudeSession(input: {
    readonly ownerUserId: Id;
    readonly workspaceId: Id;
    readonly conversationId: Id;
    readonly agent: Agent;
    readonly claudeCodeOptions?: ClaudeCodeRunOptions;
  }): ConversationAgentClaudeSession | null {
    if (!this.#isClaudeCodeBackedAgent(input.agent)) {
      return null;
    }
    const key = this.#claudeSessionKey(input.workspaceId, input.conversationId, input.agent.id);
    const existing = this.#conversationAgentClaudeSessions.get(key);
    if (existing) {
      return existing;
    }
    const parsed = claudeCodeRunOptionsSchema.safeParse(input.agent.policy["claudeCode"]);
    const snapshot = this.#sessionDefiningClaudeCodeOptions(
      input.claudeCodeOptions ?? (parsed.success ? (parsed.data as ClaudeCodeRunOptions) : {}),
    );
    const now = this.#now().toISOString();
    const session: ConversationAgentClaudeSession = {
      id: crypto.randomUUID(),
      ownerUserId: input.ownerUserId,
      workspaceId: input.workspaceId,
      conversationId: input.conversationId,
      agentId: input.agent.id,
      providerMode: "claude-code",
      sessionId: null,
      lastRunId: null,
      claudeCode: snapshot,
      createdAt: now,
      updatedAt: now,
    };
    this.#conversationAgentClaudeSessions.set(key, session);
    return session;
  }

  #touchConversationAgentClaudeSession(
    session: ConversationAgentClaudeSession,
    patch: Pick<
      Partial<ConversationAgentClaudeSession>,
      "sessionId" | "lastRunId" | "claudeCode"
    >,
  ): ConversationAgentClaudeSession {
    const updated: ConversationAgentClaudeSession = {
      ...session,
      ...(patch.sessionId !== undefined ? { sessionId: patch.sessionId } : {}),
      ...(patch.lastRunId !== undefined ? { lastRunId: patch.lastRunId } : {}),
      ...(patch.claudeCode !== undefined ? { claudeCode: patch.claudeCode } : {}),
      updatedAt: this.#now().toISOString(),
    };
    this.#conversationAgentClaudeSessions.set(
      this.#claudeSessionKey(updated.workspaceId, updated.conversationId, updated.agentId),
      updated,
    );
    return updated;
  }

  #sessionDefiningClaudeCodeOptions(
    options: ClaudeCodeRunOptions,
  ): ConversationAgentClaudeSession["claudeCode"] {
    return {
      ...(options.permissionPreset ? { permissionPreset: options.permissionPreset } : {}),
      ...(options.settingsSource ? { settingsSource: options.settingsSource } : {}),
      ...(options.runtimeProfileId !== undefined
        ? { runtimeProfileId: options.runtimeProfileId }
        : {}),
      ...(options.mcpProfileId !== undefined ? { mcpProfileId: options.mcpProfileId } : {}),
      ...(options.pluginProfileId !== undefined
        ? { pluginProfileId: options.pluginProfileId }
        : {}),
      ...(options.hooksPolicy ? { hooksPolicy: options.hooksPolicy } : {}),
      ...(options.allowedTools ? { allowedTools: [...options.allowedTools] } : {}),
      ...(options.disallowedTools ? { disallowedTools: [...options.disallowedTools] } : {}),
    };
  }

  #effectiveRunClaudeCodeOptions(
    runOptions: ClaudeCodeRunOptions | undefined,
    session: ConversationAgentClaudeSession | null,
  ): ClaudeCodeRunOptions | undefined {
    if (!session) {
      return runOptions;
    }
    const effective: ClaudeCodeRunOptions = {
      ...session.claudeCode,
      ...(runOptions?.effort ? { effort: runOptions.effort } : {}),
      ...(session.sessionId
        ? { session: { behavior: "continue" as const, sessionId: session.sessionId } }
        : {}),
    };
    return Object.keys(effective).length > 0 ? effective : undefined;
  }

  #scopedSystemPrompt(
    agent: Agent,
    participant: ConversationParticipant | null,
  ): string {
    const settings = participant?.conversationAgentSettings;
    const additions = [
      settings?.responsibilityOverride
        ? `Conversation responsibility: ${settings.responsibilityOverride}`
        : null,
      settings?.scopedInstructions
        ? `Conversation-scoped instructions: ${settings.scopedInstructions}`
        : null,
    ].filter(Boolean);
    return additions.length ? [agent.systemPrompt, "", ...additions].join("\n") : agent.systemPrompt;
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
      this.#ensureConversationAgentClaudeSession({
        ownerUserId,
        workspaceId: agentHubLocalDefaults.workspaceId,
        conversationId,
        agent,
      });
    }
  }

  #publishMembershipChanged(
    participant: ConversationParticipant,
    action: "added" | "removed" | "settings-updated",
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

  #publishConversationUpdated(conversation: Conversation): void {
    this.#events.publish({
      id: crypto.randomUUID(),
      type: "conversation.updated",
      ownerUserId: conversation.ownerUserId,
      workspaceId: conversation.workspaceId,
      conversationId: conversation.id,
      runId: null,
      occurredAt: this.#now().toISOString(),
      payload: conversation,
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

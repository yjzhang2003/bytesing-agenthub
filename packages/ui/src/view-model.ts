import type {
  Agent,
  Artifact,
  Conversation,
  ConversationParticipant,
  Message,
  MessagePart,
  PermissionRequest,
  Run,
  RuntimeDevice,
  WorkbenchSnapshot,
  Workspace,
} from "@agenthub/contracts";
import { agentHubLocalDefaults } from "@agenthub/contracts";
import type { OrchestratorDispatchPlan } from "@agenthub/contracts";
import type {
  ArtifactViewModel,
  AgentInChatViewModel,
  ChatInfoParticipantViewModel,
  ChatInfoViewModel,
  ComposerClaudeCodeControls,
  DiffViewModel,
  InspectorSelection,
  PermissionViewModel,
  PlanViewModel,
  RunViewModel,
  RuntimeSummaryViewModel,
  TimelineItemViewModel,
  WorkbenchLayoutMode,
  WorkbenchViewModel,
  WorkspaceNavigationViewModel,
} from "./types.js";

function agentRuntimeProvider(policy: Record<string, unknown>): "claude-code" | "codex" {
  const runtime = policy["runtime"];
  const candidate =
    runtime && typeof runtime === "object" && !Array.isArray(runtime)
      ? (runtime as Record<string, unknown>)["provider"]
      : policy["runtimeProvider"];
  return candidate === "codex" ? "codex" : "claude-code";
}

function runtimeProviderLabel(provider: "claude-code" | "codex"): string {
  return provider === "codex" ? "Codex" : "Claude Code";
}

export function workbenchLayoutForWidth(width: number): WorkbenchLayoutMode {
  if (width >= 1280) {
    return "wide";
  }
  if (width >= 960) {
    return "standard";
  }
  if (width >= 640) {
    return "narrow";
  }
  return "mobile-web";
}

function shortDate(value: string | null): string {
  if (!value) {
    return "Unavailable";
  }
  return value.replace("T", " ").replace(".000Z", " UTC");
}

function agentName(agentId: string, agents: readonly Agent[]): string {
  return agents.find((agent) => agent.id === agentId)?.displayName ?? "Unknown agent";
}

function agentInitials(displayName: string): string {
  const words = displayName.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) {
    return "?";
  }
  if (words.length === 1) {
    return words[0]?.slice(0, 2).toUpperCase() ?? "?";
  }
  return words
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
}

function firstWorkspace(snapshot: WorkbenchSnapshot | undefined): Workspace | undefined {
  return (
    snapshot?.workspaces.find((workspace) => workspace.id === snapshot.activeWorkspaceId) ??
    snapshot?.workspaces[0]
  );
}

function firstRuntime(
  snapshot: WorkbenchSnapshot | undefined,
  workspace: Workspace | undefined,
): RuntimeDevice | undefined {
  return (
    snapshot?.runtimeDevices.find((runtime) => runtime.id === workspace?.runtimeDeviceId) ??
    snapshot?.runtimeDevices[0]
  );
}

function activeConversationTitle(snapshot: WorkbenchSnapshot | undefined): string {
  return (
    snapshot?.conversations.find(
      (conversation) => conversation.id === snapshot.activeConversationId,
    )?.title ?? "No active conversation"
  );
}

function activeConversation(snapshot: WorkbenchSnapshot | undefined): Conversation | undefined {
  return (
    snapshot?.conversations.find(
      (conversation) => conversation.id === snapshot.activeConversationId,
    ) ?? snapshot?.conversations[0]
  );
}

function conversationParticipants(
  snapshot: WorkbenchSnapshot | undefined,
  conversationId: string | undefined,
): readonly ConversationParticipant[] | null {
  if (!snapshot?.conversationParticipants || !conversationId) {
    return null;
  }
  return snapshot.conversationParticipants.filter(
    (participant) => participant.conversationId === conversationId && !participant.archivedAt,
  );
}

function participantForAgent(
  snapshot: WorkbenchSnapshot | undefined,
  conversationId: string | undefined,
  agentId: string,
): ConversationParticipant | undefined {
  return (
    conversationParticipants(snapshot, conversationId)?.find(
      (participant) => participant.agentId === agentId,
    ) ?? undefined
  );
}

function participantAgents(
  snapshot: WorkbenchSnapshot | undefined,
  conversationId: string | undefined,
): readonly Agent[] {
  if (!snapshot) {
    return [];
  }
  const participants = conversationParticipants(snapshot, conversationId);
  if (!participants) {
    return snapshot.agents;
  }
  const participantIds = new Set(participants.map((participant) => participant.agentId));
  return snapshot.agents.filter((agent) => participantIds.has(agent.id));
}

function agentScopedLabel(
  agent: Agent,
  participant: ConversationParticipant | undefined,
): string {
  return participant?.conversationAgentSettings?.displayNameOverride ?? agent.displayName;
}

function participantEnabled(participant: ConversationParticipant | undefined): boolean {
  return participant?.conversationAgentSettings?.enabled !== false;
}

function toChatParticipant(
  agent: Agent,
  participant?: ConversationParticipant,
): ChatInfoParticipantViewModel {
  const runtimeProvider = agentRuntimeProvider(agent.policy);
  const label = agentScopedLabel(agent, participant);
  return {
    capabilityTags: agent.capabilityTags,
    claudeCodeControls:
      runtimeProvider === "claude-code" ? claudeCodeDefaultsFromPolicy(agent.policy) : null,
    id: agent.id,
    initials: agentInitials(label),
    label,
    providerLabel: runtimeProviderLabel(runtimeProvider),
    runtimeProvider,
    role: agent.role,
    target: `@${label}`,
  };
}

function conversationAgentSelectionId(conversationId: string, agentId: string): string {
  return `${conversationId}:${agentId}`;
}

function agentInChatFromSnapshot(
  snapshot: WorkbenchSnapshot | undefined,
  selection: InspectorSelection | null | undefined,
): AgentInChatViewModel | null {
  if (!snapshot || selection?.mode !== "conversation-agent") {
    return null;
  }
  const [conversationId, agentId] = selection.id.split(":");
  if (!conversationId || !agentId) {
    return null;
  }
  const participant = participantForAgent(snapshot, conversationId, agentId);
  const agent = snapshot.agents.find((candidate) => candidate.id === agentId);
  if (!participant || !agent) {
    return null;
  }
  const settings = participant.conversationAgentSettings;
  const chatParticipant = toChatParticipant(agent, participant);
  const runtimeProvider = agentRuntimeProvider(agent.policy);
  return {
    ...chatParticipant,
    agentId: agent.id,
    allowAutoDispatch: settings?.allowAutoDispatch ?? true,
    contextScope: settings?.contextScope ?? "conversation",
    conversationId,
    enabled: settings?.enabled ?? true,
    globalCapabilityTags: agent.capabilityTags,
    globalLabel: agent.displayName,
    globalRuntimeProvider: runtimeProvider,
    globalSystemPrompt: agent.systemPrompt,
    id: conversationAgentSelectionId(conversationId, agent.id),
    includeHistorySummary: settings?.includeHistorySummary ?? true,
    notes: settings?.notes ?? null,
    participationMode: settings?.participationMode ?? "orchestrated",
    priority: settings?.priority ?? "normal",
    quietMode: settings?.quietMode ?? false,
    requireRunConfirmation: settings?.requireRunConfirmation ?? false,
    responsibility: settings?.responsibilityOverride ?? null,
    scopedInstructions: settings?.scopedInstructions ?? null,
  };
}

function agentInChatDetailsFromSnapshot(
  snapshot: WorkbenchSnapshot | undefined,
): readonly AgentInChatViewModel[] {
  const conversation = activeConversation(snapshot);
  if (!snapshot || !conversation) {
    return [];
  }
  return participantAgents(snapshot, conversation.id).flatMap((agent) => {
    const selection: InspectorSelection = {
      id: conversationAgentSelectionId(conversation.id, agent.id),
      mode: "conversation-agent",
    };
    const detail = agentInChatFromSnapshot(snapshot, selection);
    return detail ? [detail] : [];
  });
}

function messageBody(parts: readonly MessagePart[]): readonly string[] {
  return parts.map((part) => {
    if (part.text) {
      return part.text;
    }
    if (part.artifactId) {
      return `Artifact reference: ${part.artifactId}`;
    }
    if (part.runId) {
      return `Run event: ${part.runId}`;
    }
    return part.type;
  });
}

function messageTitle(message: Message, snapshot: WorkbenchSnapshot): string {
  if (message.authorKind === "agent") {
    const agent = snapshot.agents.find((candidate) => candidate.id === message.authorId);
    return agent
      ? agentScopedLabel(
          agent,
          participantForAgent(snapshot, message.conversationId, message.authorId ?? ""),
        )
      : "Agent";
  }
  if (message.authorKind === "user") {
    return "You";
  }
  return "System";
}

function labelFromId(value: string | null | undefined, fallback: string): string {
  return value && value !== "none" ? value : fallback;
}

function claudeCodePermissionLabel(run: Run): string | null {
  const preset = run.claudeCode?.effectivePermissionPreset ?? run.claudeCode?.permissionPreset;
  if (!preset) {
    return null;
  }
  return {
    "plan-only": "Plan only",
    "ask-first": "Ask first",
    "auto-edits": "Auto edits",
    "full-access": "Full access",
  }[preset];
}

function runFailureCategory(
  failureReason: string | null,
): RunViewModel["failureCategory"] {
  if (!failureReason) {
    return null;
  }
  if (/not logged in|please run \/login|run \/login/iu.test(failureReason)) {
    return "claude-code-auth-required";
  }
  return "provider-failure";
}

function runFailureSummary(failureReason: string | null): string | null {
  const category = runFailureCategory(failureReason);
  if (category === "claude-code-auth-required") {
    return "Claude Code CLI needs login. Authenticate the local CLI before running again.";
  }
  if (category === "provider-failure") {
    return "Provider run failed. Open diagnostics for the original failure text.";
  }
  return null;
}

function displayFailureReason(failureReason: string | null | undefined): string | null {
  return runFailureSummary(failureReason ?? null) ?? failureReason ?? null;
}

function activeRunMessage(run: Run, snapshot: WorkbenchSnapshot): TimelineItemViewModel | null {
  const agent = snapshot.agents.find((candidate) => candidate.id === run.agentId);
  const title = agent
    ? agentScopedLabel(agent, participantForAgent(snapshot, run.conversationId, run.agentId))
    : agentName(run.agentId, snapshot.agents);
  if (run.status === "completed" || run.status === "cancelled" || run.status === "failed") {
    return null;
  }
  if (run.status === "blocked") {
    return {
      authorId: run.agentId,
      authorKind: "agent",
      body: ["Waiting for approval before continuing."],
      id: `run-message-${run.id}`,
      inspectorSelection: { id: run.id, mode: "run" },
      kind: "message",
      state: "warning",
      subtitle: "agent message",
      title,
    };
  }
  return {
    authorId: run.agentId,
    authorKind: "agent",
    body: [],
    id: `run-message-${run.id}`,
    inspectorSelection: { id: run.id, mode: "run" },
    kind: "message",
    state: "loading",
    subtitle: "agent message",
    title,
  };
}

function isProviderSetupFailureMessage(
  message: Message,
  runsById: ReadonlyMap<string, Run>,
): boolean {
  if (message.authorKind !== "agent") {
    return false;
  }
  return message.parts.some((part) => {
    if (!part.text) {
      return false;
    }
    if (!part.runId) {
      return runFailureCategory(part.text) === "claude-code-auth-required";
    }
    const run = runsById.get(part.runId);
    return (
      runFailureCategory(run?.failureReason ?? null) === "claude-code-auth-required" &&
      runFailureCategory(part.text) === "claude-code-auth-required"
    );
  });
}

function timelineItemsFromSnapshot(
  snapshot: WorkbenchSnapshot | undefined,
): readonly TimelineItemViewModel[] {
  if (!snapshot) {
    return [
      {
        body: ["Waiting for Control Plane snapshot."],
        id: "loading",
        kind: "empty",
        state: "loading",
        subtitle: "Loading",
        title: "Loading workbench",
      },
    ];
  }

  const activeConversationId = activeConversation(snapshot)?.id;
  const activeMessages = snapshot.messages.filter(
    (message) => message.conversationId === activeConversationId,
  );
  const activeRuns = snapshot.runs.filter((run) => run.conversationId === activeConversationId);
  const activeRunsById = new Map(activeRuns.map((run) => [run.id, run]));

  const messageItems = activeMessages
    .filter((message) => !isProviderSetupFailureMessage(message, activeRunsById))
    .map((message) => ({
      authorId: message.authorId,
      authorKind: message.authorKind,
      body: messageBody(message.parts),
      id: message.id,
      kind: "message" as const,
      state: "success" as const,
      subtitle: `${message.authorKind} message`,
      title: messageTitle(message, snapshot),
    }));

  const runIdsWithMessages = new Set(
    activeMessages.flatMap((message) =>
      message.parts.map((part) => part.runId).filter((runId): runId is string => Boolean(runId)),
    ),
  );
  const runItems = activeRuns
    .map((run) => ({ item: activeRunMessage(run, snapshot), run }))
    .filter(
      ({ item, run }) =>
        item !== null && !(item.state === "loading" && runIdsWithMessages.has(run.id)),
    )
    .map(({ item }) => item)
    .filter((item): item is TimelineItemViewModel => item !== null);
  const items = [...messageItems, ...runItems];
  if (items.length > 0) {
    return items;
  }

  return [
    {
      body: ["No messages or run events yet. Select an agent target and start from the composer."],
      id: "empty-conversation",
      kind: "empty",
      state: "empty",
      subtitle: activeConversationTitle(snapshot),
      title: "Empty conversation",
    },
  ];
}

function navigationFromSnapshot(
  snapshot: WorkbenchSnapshot | undefined,
  workspace: Workspace | undefined,
  runtime: RuntimeDevice | undefined,
): WorkspaceNavigationViewModel {
  const metadata = snapshot?.workspaceMetadata;
  const activeRunByConversation = new Map<string, Run["status"]>();
  for (const run of snapshot?.runs ?? []) {
    if (run.status !== "completed" && run.status !== "failed" && run.status !== "cancelled") {
      activeRunByConversation.set(run.conversationId, run.status);
    }
  }

  return {
    agents: (snapshot?.agents ?? []).map((agent) => ({
      capabilityTags: agent.capabilityTags,
      id: agent.id,
      label: agent.displayName,
      providerLabel: runtimeProviderLabel(agentRuntimeProvider(agent.policy)),
      runtimeProvider: agentRuntimeProvider(agent.policy),
      role: agent.role,
      target: `@${agent.displayName}`,
    })),
    branchLabel: metadata?.gitBranch ?? workspace?.defaultBranch ?? "No branch",
    conversations: [...(snapshot?.conversations ?? [])]
      .sort(compareConversations)
      .map((conversation) => {
        const activeRunStatus = activeRunByConversation.get(conversation.id);
        return {
          active: conversation.id === snapshot?.activeConversationId,
          ...(activeRunStatus ? { activeRunStatus } : {}),
          id: conversation.id,
          notificationsMuted: conversation.notificationsMuted,
          participants: participantAgents(snapshot, conversation.id).map(
            (agent) => agent.displayName,
          ),
          pendingPermissions: 0,
          pinned: Boolean(conversation.pinnedAt),
          title: conversation.title,
        };
      }),
    pendingPermissionCount: 0,
    runCount: snapshot?.runs.length ?? 0,
    runtimeLabel: runtime?.displayName ?? "No Desktop Runtime",
    runtimeStatus: runtime?.status ?? "offline",
    workspaceName: metadata?.displayName ?? workspace?.name ?? "AgentHub",
    workspacePathLabel: metadata?.localPathLabel ?? workspace?.localPath ?? "No workspace path",
  };
}

function compareConversations(
  a: NonNullable<WorkbenchSnapshot["conversations"][number]>,
  b: NonNullable<WorkbenchSnapshot["conversations"][number]>,
): number {
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

function runtimeFromSnapshot(
  runtime: RuntimeDevice | undefined,
  snapshot: WorkbenchSnapshot | undefined,
): RuntimeSummaryViewModel {
  const status = runtime?.status ?? "offline";
  const providerHealth = snapshot?.providerHealth ?? null;
  const providerExecutable =
    !providerHealth || providerHealth.status === "connected";
  const canExecute = (status === "online" || status === "active-running") && providerExecutable;
  const memoryHealth = snapshot?.memoryHealth ?? null;
  const claudeCodeDiscovery = snapshot?.claudeCodeDiscovery ?? null;
  const providerBlockedReason =
    providerHealth && !providerExecutable
      ? (displayFailureReason(providerHealth.failureReason) ??
        `${providerHealth.providerMode === "claude-code" ? "Claude Code" : "Smoke provider"} is ${providerHealth.status}.`)
      : null;
  return {
    appVersion: runtime?.appVersion ?? "Unavailable",
    capabilities: runtime?.capabilities ?? [],
    canExecute,
    explanation: canExecute
      ? "Runtime can receive local execution requests."
      : (providerBlockedReason ??
        "Desktop Runtime must be online before local execution can start."),
    id: runtime?.id ?? null,
    label: runtime?.displayName ?? "No Desktop Runtime",
    lastHeartbeatLabel: shortDate(runtime?.lastHeartbeatAt ?? null),
    memoryHealth,
    memoryStatusLabel: memoryHealth ? `Memory ${memoryHealth.status}` : "Memory unknown",
    claudeCodeDiscovery,
    platform: runtime?.platform ?? "unknown",
    providerHealth,
    providerStatusLabel: providerHealth
      ? `${providerHealth.providerMode === "claude-code" ? "Claude Code" : "Smoke provider"} ${providerHealth.status}`
      : "Provider unknown",
    status,
  };
}

function composerFromSnapshot(
  snapshot: WorkbenchSnapshot | undefined,
  runtimeSummary: RuntimeSummaryViewModel,
): WorkbenchViewModel["composer"] {
  const activeAgents = participantAgents(snapshot, snapshot?.activeConversationId);
  const targets = activeAgents.flatMap((agent) => {
    const participant = participantForAgent(snapshot, snapshot?.activeConversationId, agent.id);
    if (!participantEnabled(participant)) {
      return [];
    }
    const runtimeProvider = agentRuntimeProvider(agent.policy);
    const label = agentScopedLabel(agent, participant);
    return {
      capabilityTags: agent.capabilityTags,
      claudeCodeControls:
        runtimeProvider === "claude-code" ? claudeCodeDefaultsFromPolicy(agent.policy) : null,
      id: agent.id,
      label,
      providerLabel: runtimeProviderLabel(runtimeProvider),
      runtimeProvider,
      role: agent.role,
      target: `@${label}`,
    };
  });
  const selected = targets.find((target) => target.role === "orchestrator") ??
    targets[0] ?? {
      capabilityTags: [],
      claudeCodeControls: null,
      id: "target-unavailable",
      label: "Orchestrator",
      providerLabel: "Unavailable",
      runtimeProvider: "claude-code" as const,
      role: "orchestrator" as const,
      target: "@Orchestrator",
    };
  const selectedAgent = activeAgents.find((agent) => agent.id === selected.id);
  const selectedClaudeCodeDefaults = selectedAgent
    ? claudeCodeDefaultsFromPolicy(selectedAgent.policy)
    : null;
  return {
    claudeCodeControls:
      selected.runtimeProvider === "claude-code"
        ? (selectedClaudeCodeDefaults ?? {
            permissionPreset: "ask-first",
            runtimeProfileId: "default",
            mcpProfileId: "none",
            pluginProfileId: "default",
            effort: "medium",
            settingsSource: "inherit",
            hooksPolicy: "disabled",
          })
        : null,
    disabled: !runtimeSummary.canExecute,
    disabledReason: runtimeSummary.canExecute ? null : runtimeSummary.explanation,
    modeLabel: selected.role === "orchestrator" ? "Plan Mode" : "Direct agent message",
    selectedRole: selected.role,
    selectedTarget: selected.target,
    targets,
  };
}

function chatInfoFromSnapshot(
  snapshot: WorkbenchSnapshot | undefined,
  workspace: Workspace | undefined,
  runtimeSummary: RuntimeSummaryViewModel,
): ChatInfoViewModel | null {
  const conversation = activeConversation(snapshot);
  if (!snapshot || !conversation) {
    return null;
  }
  const participants = participantAgents(snapshot, conversation.id);
  const participantIds = new Set(participants.map((agent) => agent.id));
  const availableAgents = snapshot.agents.filter((agent) => !participantIds.has(agent.id));
  return {
    announcement: null,
    availableAgents: availableAgents.map((agent) => toChatParticipant(agent)),
    createdAtLabel: shortDate(conversation.createdAt),
    id: conversation.id,
    kind: conversation.kind,
    mutable: conversation.id !== agentHubLocalDefaults.conversationId,
    note: null,
    notificationsMuted: conversation.notificationsMuted,
    participantCount: participants.length,
    participants: participants.map((agent) =>
      toChatParticipant(agent, participantForAgent(snapshot, conversation.id, agent.id)),
    ),
    pinned: Boolean(conversation.pinnedAt),
    runtimeLabel: runtimeSummary.label,
    title: conversation.title,
    updatedAtLabel: shortDate(conversation.updatedAt),
    workspaceName: workspace?.name ?? snapshot.workspaceMetadata?.displayName ?? "AgentHub",
  };
}

function isDefaultAgent(agent: Agent): boolean {
  return (
    agent.id === agentHubLocalDefaults.orchestratorAgentId ||
    agent.id === agentHubLocalDefaults.implementerAgentId ||
    agent.displayName === "Orchestrator" ||
    agent.displayName === "Implementer"
  );
}

function agentsPageFromSnapshot(
  snapshot: WorkbenchSnapshot | undefined,
): WorkbenchViewModel["agentsPage"] {
  const workspaceId = snapshot?.activeWorkspaceId ?? "workspace_unavailable";
  return {
    agents: (snapshot?.agents ?? []).map((agent) => ({
      capabilityTags: agent.capabilityTags,
      defaultAgent: isDefaultAgent(agent),
      id: agent.id,
      label: agent.displayName,
      memoryNamespace: `agenthub:${snapshot?.userId ?? "user_unavailable"}:${workspaceId}:${agent.id}`,
      policyJson: JSON.stringify(agent.policy, null, 2),
      providerLabel: runtimeProviderLabel(agentRuntimeProvider(agent.policy)),
      runtimeProvider: agentRuntimeProvider(agent.policy),
      role: agent.role,
      systemPrompt: agent.systemPrompt,
      claudeCodeDefaults: claudeCodeDefaultsFromPolicy(agent.policy),
      highRiskClaudeCode:
        claudeCodeDefaultsFromPolicy(agent.policy)?.permissionPreset === "full-access",
      hooksEnabled: claudeCodeDefaultsFromPolicy(agent.policy)?.hooksPolicy === "enabled",
    })),
    selectedAgentId: snapshot?.agents[0]?.id ?? null,
  };
}

function connectionTone(status: string, disabled = false): "connected" | "warning" | "disabled" {
  if (disabled) {
    return "disabled";
  }
  return status === "connected" || status === "online" ? "connected" : "warning";
}

function connectionsFromSnapshot(
  runtimeSummary: RuntimeSummaryViewModel,
  checkingConnectionIds: readonly string[] = [],
): WorkbenchViewModel["connections"] {
  const providerHealth = runtimeSummary.providerHealth;
  const memoryHealth = runtimeSummary.memoryHealth;
  const discovery = runtimeSummary.claudeCodeDiscovery;
  const runtimeOnline =
    runtimeSummary.status === "online" || runtimeSummary.status === "active-running";
  const localDisabledReason = runtimeOnline
    ? null
    : "Desktop Runtime must be online to check this connection.";
  const providerDisabledReason = localDisabledReason;
  const items = [
    {
      checkTarget: "provider" as const,
      checkable: runtimeOnline,
      checkedAt: providerHealth?.checkedAt ?? "Unavailable",
      checking: checkingConnectionIds.includes("provider"),
      description: "Local provider connection",
      disabledReason: providerDisabledReason,
      failureReason: displayFailureReason(providerHealth?.failureReason),
      id: "provider",
      kind: "provider" as const,
      label: "Claude Code",
      metadata: [
        { label: "Mode", value: providerHealth?.providerMode ?? "claude-code" },
        { label: "Binary", value: providerHealth?.binaryPathLabel ?? "Unavailable" },
        ...(providerHealth?.failureReason
          ? [{ label: "Diagnostics", value: providerHealth.failureReason }]
          : []),
      ],
      status: providerHealth?.status ?? "unknown",
      statusTone: connectionTone(providerHealth?.status ?? "unknown"),
    },
    {
      checkTarget: "claude-code" as const,
      checkable: runtimeOnline,
      checkedAt: discovery?.checkedAt ?? "Unavailable",
      checking: checkingConnectionIds.includes("claude-code"),
      description: "Claude Code plugins, skills, MCP, hooks, and managed profiles",
      disabledReason: localDisabledReason,
      failureReason: null,
      id: "claude-code-discovery",
      kind: "claude-code-discovery" as const,
      label: "Claude Code capabilities",
      metadata: [
        { label: "Profile root", value: discovery?.profileRootLabel ?? "Unavailable" },
        { label: "Binary", value: discovery?.binaryPathLabel ?? "Unavailable" },
        { label: "Plugins", value: String(discovery?.plugins.length ?? 0) },
        {
          label: "Plugin names",
          value: discovery?.plugins.map((plugin) => plugin.name).join(", ") || "None",
        },
        { label: "Skills", value: String(discovery?.skills.length ?? 0) },
        {
          label: "Skill names",
          value:
            discovery?.skills
              .slice(0, 6)
              .map((skill) => skill.name)
              .join(", ") || "None",
        },
        { label: "MCP servers", value: String(discovery?.mcpServers.length ?? 0) },
        {
          label: "MCP names",
          value:
            discovery?.mcpServers
              .map((server) => `${server.name} (${server.transport})`)
              .join(", ") || "None",
        },
        { label: "Hooks", value: "Controlled by selected profile policy" },
        {
          label: "Workspace files",
          value: discovery
            ? [
                discovery.workspaceClaudeFiles.claudeDir ? ".claude/" : null,
                discovery.workspaceClaudeFiles.settingsJson ? "settings.json" : null,
                discovery.workspaceClaudeFiles.settingsLocalJson ? "settings.local.json" : null,
                discovery.workspaceClaudeFiles.mcpJson ? ".mcp.json" : null,
                discovery.workspaceClaudeFiles.claudeMd ? "CLAUDE.md" : null,
              ]
                .filter(Boolean)
                .join(", ") || "None"
            : "Unavailable",
        },
      ],
      status: discovery ? "available" : "unknown",
      statusTone: discovery ? ("connected" as const) : ("warning" as const),
    },
    {
      checkTarget: null,
      checkable: false,
      checkedAt: "Unavailable",
      checking: false,
      description: "Future provider slot",
      disabledReason: "Not configured yet.",
      failureReason: null,
      id: "codex",
      kind: "future-provider" as const,
      label: "Codex",
      metadata: [
        { label: "Mode", value: "codex" },
        { label: "Binary", value: "Not configured" },
      ],
      status: "disabled",
      statusTone: "disabled" as const,
    },
  ];
  return {
    checkableIds: items.filter((item) => item.checkable).map((item) => item.id),
    items,
    memory: {
      checkedAt: memoryHealth?.checkedAt ?? "Unavailable",
      enabled: memoryHealth?.enabled ?? false,
      failureReason: memoryHealth?.failureReason ?? null,
      status: memoryHealth?.status ?? "unknown",
      url: memoryHealth?.url ?? "Unavailable",
      viewerUrl: memoryHealth?.viewerUrl ?? "Unavailable",
    },
    providers: [
      {
        binaryPathLabel: providerHealth?.binaryPathLabel ?? "Unavailable",
        checkedAt: providerHealth?.checkedAt ?? "Unavailable",
        comingSoon: false,
        failureReason: displayFailureReason(providerHealth?.failureReason),
        id: "claude-code",
        label: "Claude Code",
        providerMode: providerHealth?.providerMode ?? "claude-code",
        status: providerHealth?.status ?? "unknown",
        statusTone: providerHealth?.status === "connected" ? "connected" : "warning",
      },
      {
        binaryPathLabel: "Not configured",
        checkedAt: "Unavailable",
        comingSoon: true,
        failureReason: null,
        id: "codex",
        label: "Codex",
        providerMode: "codex",
        status: "Coming soon",
        statusTone: "disabled",
      },
    ],
  };
}

function claudeCodeDefaultsFromPolicy(
  policy: Record<string, unknown>,
): ComposerClaudeCodeControls | null {
  const candidate = policy["claudeCode"];
  if (!candidate || typeof candidate !== "object" || Array.isArray(candidate)) {
    return null;
  }
  const value = candidate as Record<string, unknown>;
  return {
    permissionPreset:
      value["permissionPreset"] === "full-access" ||
      value["permissionPreset"] === "plan-only" ||
      value["permissionPreset"] === "auto-edits"
        ? value["permissionPreset"]
        : "ask-first",
    runtimeProfileId:
      typeof value["runtimeProfileId"] === "string" ? value["runtimeProfileId"] : "default",
    mcpProfileId: typeof value["mcpProfileId"] === "string" ? value["mcpProfileId"] : "none",
    pluginProfileId:
      typeof value["pluginProfileId"] === "string" ? value["pluginProfileId"] : "default",
    effort:
      value["effort"] === "low" ||
      value["effort"] === "high" ||
      value["effort"] === "xhigh" ||
      value["effort"] === "max"
        ? value["effort"]
        : "medium",
    settingsSource:
      value["settingsSource"] === "managed" || value["settingsSource"] === "isolated"
        ? value["settingsSource"]
        : "inherit",
    hooksPolicy:
      value["hooksPolicy"] === "inherit" || value["hooksPolicy"] === "enabled"
        ? value["hooksPolicy"]
        : "disabled",
    allowedTools: Array.isArray(value["allowedTools"])
      ? value["allowedTools"].filter((tool): tool is string => typeof tool === "string")
      : [],
    disallowedTools: Array.isArray(value["disallowedTools"])
      ? value["disallowedTools"].filter((tool): tool is string => typeof tool === "string")
      : [],
  };
}

function runsFromSnapshot(snapshot: WorkbenchSnapshot | undefined): readonly RunViewModel[] {
  return (snapshot?.runs ?? []).map((run) => ({
    agentName: agentName(run.agentId, snapshot?.agents ?? []),
    claudeCodeEffortLabel: run.claudeCode?.effort ?? null,
    claudeCodeMcpLabel: run.claudeCode ? labelFromId(run.claudeCode.mcpProfileId, "none") : null,
    claudeCodeOverrideSource: run.claudeCode?.overrideSource ?? null,
    claudeCodePermissionLabel: claudeCodePermissionLabel(run),
    claudeCodeProfileLabel: run.claudeCode
      ? labelFromId(run.claudeCode.runtimeProfileId, "default")
      : null,
    claudeCodeSettingsLabel:
      run.claudeCode?.effectiveSettingsSource ?? run.claudeCode?.settingsSource ?? null,
    completedAt: shortDate(run.completedAt),
    failureCategory: runFailureCategory(run.failureReason),
    failureReason: run.failureReason,
    failureSummary: runFailureSummary(run.failureReason),
    highRiskClaudeCode:
      (run.claudeCode?.effectivePermissionPreset ?? run.claudeCode?.permissionPreset) ===
      "full-access",
    id: run.id,
    startedAt: shortDate(run.startedAt),
    status: run.status,
  }));
}

export function normalizeSelection(
  selection: InspectorSelection | null,
  data: {
    readonly plan: PlanViewModel | null;
    readonly permissions: readonly PermissionViewModel[];
    readonly diff: DiffViewModel | null;
    readonly artifacts: readonly ArtifactViewModel[];
    readonly runs: readonly RunViewModel[];
    readonly chatInfo?: ChatInfoViewModel | null;
    readonly agentInChat?: AgentInChatViewModel | null;
    readonly agentInChatDetails?: readonly AgentInChatViewModel[];
  },
): InspectorSelection | null {
  if (!selection) {
    return null;
  }
  if (selection.mode === "runtime") {
    return selection;
  }
  if (selection.mode === "chat-info" && data.chatInfo?.id === selection.id) {
    return selection;
  }
  if (
    selection.mode === "conversation-agent" &&
    (data.agentInChat?.id === selection.id ||
      data.agentInChatDetails?.some((detail) => detail.id === selection.id))
  ) {
    return selection;
  }
  if (selection.mode === "plan" && data.plan?.id === selection.id) {
    return selection;
  }
  if (
    selection.mode === "permission" &&
    data.permissions.some((permission) => permission.id === selection.id)
  ) {
    return selection;
  }
  if (selection.mode === "diff" && data.diff?.id === selection.id) {
    return selection;
  }
  if (
    selection.mode === "artifact" &&
    data.artifacts.some((artifact) => artifact.id === selection.id)
  ) {
    return selection;
  }
  if (selection.mode === "run" && data.runs.some((run) => run.id === selection.id)) {
    return selection;
  }
  return null;
}

export function createWorkbenchViewModel(
  snapshot?: WorkbenchSnapshot,
  options: {
    readonly activePlan?: OrchestratorDispatchPlan | null;
    readonly pendingPermissions?: readonly PermissionRequest[];
    readonly activeDiff?: DiffViewModel | null;
    readonly artifacts?: readonly Artifact[];
    readonly selection?: InspectorSelection | null;
    readonly checkingConnectionIds?: readonly string[];
  } = {},
): WorkbenchViewModel {
  const workspace = firstWorkspace(snapshot);
  const runtime = firstRuntime(snapshot, workspace);
  const runtimeSummary = runtimeFromSnapshot(runtime, snapshot);
  const navigation = navigationFromSnapshot(snapshot, workspace, runtime);
  const composer = composerFromSnapshot(snapshot, runtimeSummary);
  const chatInfo = chatInfoFromSnapshot(snapshot, workspace, runtimeSummary);
  const agentInChatDetails = agentInChatDetailsFromSnapshot(snapshot);
  const agentInChat = agentInChatFromSnapshot(snapshot, options.selection ?? null);
  const agentsPage = agentsPageFromSnapshot(snapshot);
  const connections = connectionsFromSnapshot(runtimeSummary, options.checkingConnectionIds ?? []);
  const plan = options.activePlan
    ? {
        agents: options.activePlan.steps.map((step) =>
          agentName(step.assignedAgentId, snapshot?.agents ?? []),
        ),
        assumptions: options.activePlan.assumptions,
        goal: options.activePlan.goal,
        id: options.activePlan.id,
        progressLabel: `${options.activePlan.steps.length} steps`,
        risks: options.activePlan.steps.flatMap((step) => step.riskNotes),
        status: options.activePlan.status,
        steps: options.activePlan.steps.map((step) => ({
          assignedAgent: agentName(step.assignedAgentId, snapshot?.agents ?? []),
          expectedArtifacts: step.expectedArtifacts,
          id: step.id,
          risks: step.riskNotes,
          title: step.title,
        })),
        title: options.activePlan.goal,
      }
    : null;
  const permissions = (options.pendingPermissions ?? []).map((permission) => ({
    actionKind: permission.actionKind,
    command: permission.command,
    id: permission.id,
    paths: permission.paths,
    relatedPlanId: snapshot?.runs.find((run) => run.id === permission.runId)?.planId ?? null,
    relatedRunId: permission.runId,
    requestingAgent: agentName(permission.agentId, snapshot?.agents ?? []),
    risk: permission.risk,
    status: permission.status,
    summary: permission.summary,
    workspaceName: navigation.workspaceName,
  }));
  const artifacts = (options.artifacts ?? []).map((artifact) => ({
    id: artifact.id,
    runId: artifact.runId,
    summary: artifact.summary,
    title: artifact.title,
    type: artifact.type,
  }));
  const timeline: TimelineItemViewModel[] = [
    ...(plan
      ? [
          {
            body: [plan.goal],
            id: plan.id,
            inspectorSelection: { id: plan.id, mode: "plan" as const },
            kind: "plan" as const,
            state: plan.status === "draft" ? ("blocked" as const) : ("success" as const),
            subtitle: plan.progressLabel,
            title: `Plan ${plan.status}`,
          },
        ]
      : []),
    ...timelineItemsFromSnapshot(snapshot),
    ...permissions.map((permission) => ({
      body: [permission.summary],
      id: permission.id,
      inspectorSelection: { id: permission.id, mode: "permission" as const },
      kind: "permission" as const,
      state: permission.status === "pending" ? ("blocked" as const) : ("success" as const),
      subtitle: `${permission.risk} risk`,
      title: `Permission ${permission.status}`,
    })),
    ...(options.activeDiff
      ? [
          {
            body: [`${options.activeDiff.files.length} files changed`],
            id: options.activeDiff.id,
            inspectorSelection: { id: options.activeDiff.id, mode: "diff" as const },
            kind: "diff" as const,
            state:
              options.activeDiff.state === "offline"
                ? ("offline" as const)
                : ("metadata-only" as const),
            subtitle: options.activeDiff.state,
            title: "Diff review",
          },
        ]
      : []),
    ...artifacts.map((artifact) => ({
      body: [artifact.summary],
      id: artifact.id,
      inspectorSelection: { id: artifact.id, mode: "artifact" as const },
      kind: "artifact" as const,
      state: "success" as const,
      subtitle: artifact.type,
      title: artifact.title,
    })),
  ];

  const selected = normalizeSelection(options.selection ?? null, {
    artifacts,
    diff: options.activeDiff ?? null,
    permissions,
    plan,
    runs: runsFromSnapshot(snapshot),
    chatInfo,
    agentInChat,
    agentInChatDetails,
  });

  return {
    activeConversationTitle: activeConversationTitle(snapshot),
    agentsPage,
    composer,
    connections,
    inspector: {
      artifacts,
      chatInfo,
      diff: options.activeDiff ?? null,
      permissions,
      plan,
      runs: runsFromSnapshot(snapshot),
      agentInChat,
      agentInChatDetails,
      selection: selected,
    },
    runtime: runtimeSummary,
    states: [
      snapshot ? "success" : "loading",
      ...(runtimeSummary.canExecute ? [] : (["offline", "disabled"] as const)),
      ...(timeline.some((item) => item.state === "empty") ? (["empty"] as const) : []),
    ],
    timeline,
    workspace: {
      ...navigation,
      pendingPermissionCount: permissions.filter((permission) => permission.status === "pending")
        .length,
    },
  };
}

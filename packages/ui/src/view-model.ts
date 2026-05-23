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
  ChatInfoParticipantViewModel,
  ChatInfoViewModel,
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

function toChatParticipant(agent: Agent): ChatInfoParticipantViewModel {
  return {
    capabilityTags: agent.capabilityTags,
    id: agent.id,
    initials: agentInitials(agent.displayName),
    label: agent.displayName,
    providerLabel: "Claude Code",
    role: agent.role,
    target: `@${agent.displayName}`,
  };
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

function messageTitle(message: Message, agents: readonly Agent[]): string {
  if (message.authorKind === "agent") {
    return agentName(message.authorId, agents);
  }
  if (message.authorKind === "user") {
    return "You";
  }
  return "System";
}

function activeRunMessage(run: Run, agents: readonly Agent[]): TimelineItemViewModel | null {
  const title = agentName(run.agentId, agents);
  if (run.status === "completed" || run.status === "cancelled") {
    return null;
  }
  if (run.status === "failed") {
    return {
      authorId: run.agentId,
      authorKind: "agent",
      body: [run.failureReason ?? "The run failed before the agent could finish replying."],
      id: `run-message-${run.id}`,
      kind: "message",
      state: "error",
      subtitle: "agent message",
      title,
    };
  }
  if (run.status === "blocked") {
    return {
      authorId: run.agentId,
      authorKind: "agent",
      body: ["Waiting for approval before continuing."],
      id: `run-message-${run.id}`,
      kind: "message",
      state: "warning",
      subtitle: "agent message",
      title,
    };
  }
  return {
    authorId: run.agentId,
    authorKind: "agent",
    body: ["Writing a reply..."],
    id: `run-message-${run.id}`,
    kind: "message",
    state: "loading",
    subtitle: "agent message",
    title,
  };
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

  const messageItems = snapshot.messages.map((message) => ({
    authorId: message.authorId,
    authorKind: message.authorKind,
    body: messageBody(message.parts),
    id: message.id,
    kind: "message" as const,
    state: "success" as const,
    subtitle: `${message.authorKind} message`,
    title: messageTitle(message, snapshot.agents),
  }));

  const runIdsWithMessages = new Set(
    snapshot.messages.flatMap((message) =>
      message.parts.map((part) => part.runId).filter((runId): runId is string => Boolean(runId)),
    ),
  );
  const runItems = snapshot.runs
    .map((run) => ({ item: activeRunMessage(run, snapshot.agents), run }))
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
      providerLabel: "Claude Code",
      role: agent.role,
      target: `@${agent.displayName}`,
    })),
    branchLabel: metadata?.gitBranch ?? workspace?.defaultBranch ?? "No branch",
    conversations: (snapshot?.conversations ?? []).map((conversation) => {
      const activeRunStatus = activeRunByConversation.get(conversation.id);
      return {
        active: conversation.id === snapshot?.activeConversationId,
        ...(activeRunStatus ? { activeRunStatus } : {}),
        id: conversation.id,
        participants: participantAgents(snapshot, conversation.id).map(
          (agent) => agent.displayName,
        ),
        pendingPermissions: 0,
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

function runtimeFromSnapshot(
  runtime: RuntimeDevice | undefined,
  snapshot: WorkbenchSnapshot | undefined,
): RuntimeSummaryViewModel {
  const status = runtime?.status ?? "offline";
  const canExecute = status === "online" || status === "active-running";
  const providerHealth = snapshot?.providerHealth ?? null;
  const memoryHealth = snapshot?.memoryHealth ?? null;
  return {
    appVersion: runtime?.appVersion ?? "Unavailable",
    capabilities: runtime?.capabilities ?? [],
    canExecute,
    explanation: canExecute
      ? "Runtime can receive local execution requests."
      : "Desktop Runtime must be online before local execution can start.",
    id: runtime?.id ?? null,
    label: runtime?.displayName ?? "No Desktop Runtime",
    lastHeartbeatLabel: shortDate(runtime?.lastHeartbeatAt ?? null),
    memoryHealth,
    memoryStatusLabel: memoryHealth ? `Memory ${memoryHealth.status}` : "Memory unknown",
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
  const targets = participantAgents(snapshot, snapshot?.activeConversationId).map((agent) => ({
    capabilityTags: agent.capabilityTags,
    id: agent.id,
    label: agent.displayName,
    providerLabel: "Claude Code",
    role: agent.role,
    target: `@${agent.displayName}`,
  }));
  const selected = targets.find((target) => target.role === "orchestrator") ??
    targets[0] ?? {
      capabilityTags: [],
      id: "target-unavailable",
      label: "Orchestrator",
      providerLabel: "Unavailable",
      role: "orchestrator" as const,
      target: "@Orchestrator",
    };
  return {
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
    availableAgents: availableAgents.map(toChatParticipant),
    createdAtLabel: shortDate(conversation.createdAt),
    id: conversation.id,
    kind: conversation.kind,
    note: null,
    participantCount: participants.length,
    participants: participants.map(toChatParticipant),
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
      providerLabel: "Claude Code",
      role: agent.role,
      systemPrompt: agent.systemPrompt,
    })),
    selectedAgentId: snapshot?.agents[0]?.id ?? null,
  };
}

function connectionsFromSnapshot(
  runtimeSummary: RuntimeSummaryViewModel,
): WorkbenchViewModel["connections"] {
  const providerHealth = runtimeSummary.providerHealth;
  const memoryHealth = runtimeSummary.memoryHealth;
  return {
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
        failureReason: providerHealth?.failureReason ?? null,
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

function runsFromSnapshot(snapshot: WorkbenchSnapshot | undefined): readonly RunViewModel[] {
  return (snapshot?.runs ?? []).map((run) => ({
    agentName: agentName(run.agentId, snapshot?.agents ?? []),
    completedAt: shortDate(run.completedAt),
    failureReason: run.failureReason,
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
  } = {},
): WorkbenchViewModel {
  const workspace = firstWorkspace(snapshot);
  const runtime = firstRuntime(snapshot, workspace);
  const runtimeSummary = runtimeFromSnapshot(runtime, snapshot);
  const navigation = navigationFromSnapshot(snapshot, workspace, runtime);
  const composer = composerFromSnapshot(snapshot, runtimeSummary);
  const chatInfo = chatInfoFromSnapshot(snapshot, workspace, runtimeSummary);
  const agentsPage = agentsPageFromSnapshot(snapshot);
  const connections = connectionsFromSnapshot(runtimeSummary);
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

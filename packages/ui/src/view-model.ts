import type {
  Agent,
  Artifact,
  Message,
  MessagePart,
  PermissionRequest,
  Run,
  RuntimeDevice,
  WorkbenchSnapshot,
  Workspace,
} from "@agenthub/contracts";
import type { OrchestratorDispatchPlan } from "@agenthub/contracts";
import type {
  ArtifactViewModel,
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

function firstWorkspace(snapshot: WorkbenchSnapshot | undefined): Workspace | undefined {
  return snapshot?.workspaces.find((workspace) => workspace.id === snapshot.activeWorkspaceId) ?? snapshot?.workspaces[0];
}

function firstRuntime(snapshot: WorkbenchSnapshot | undefined, workspace: Workspace | undefined): RuntimeDevice | undefined {
  return (
    snapshot?.runtimeDevices.find((runtime) => runtime.id === workspace?.runtimeDeviceId) ??
    snapshot?.runtimeDevices[0]
  );
}

function activeConversationTitle(snapshot: WorkbenchSnapshot | undefined): string {
  return (
    snapshot?.conversations.find((conversation) => conversation.id === snapshot.activeConversationId)?.title ??
    "No active conversation"
  );
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

function timelineItemsFromSnapshot(snapshot: WorkbenchSnapshot | undefined): readonly TimelineItemViewModel[] {
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
    authorKind: message.authorKind,
    body: messageBody(message.parts),
    id: message.id,
    kind: "message" as const,
    state: "success" as const,
    subtitle: `${message.authorKind} message`,
    title: messageTitle(message, snapshot.agents),
  }));

  const runItems = snapshot.runs.map((run) => ({
    body: [run.failureReason ?? `Run ${run.status}`],
    id: run.id,
    inspectorSelection: { id: run.id, mode: "run" as const },
    kind: "run-event" as const,
    state: run.status === "blocked" ? ("blocked" as const) : run.status === "failed" ? ("error" as const) : ("success" as const),
    subtitle: agentName(run.agentId, snapshot.agents),
    title: `Run ${run.status}`,
  }));

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
        participants: (snapshot?.agents ?? []).map((agent) => agent.displayName),
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

function runtimeFromSnapshot(runtime: RuntimeDevice | undefined): RuntimeSummaryViewModel {
  const status = runtime?.status ?? "offline";
  const canExecute = status === "online" || status === "active-running";
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
    platform: runtime?.platform ?? "unknown",
    status,
  };
}

function composerFromSnapshot(
  snapshot: WorkbenchSnapshot | undefined,
  runtimeSummary: RuntimeSummaryViewModel,
): WorkbenchViewModel["composer"] {
  const targets = (snapshot?.agents ?? []).map((agent) => ({
    capabilityTags: agent.capabilityTags,
    id: agent.id,
    label: agent.displayName,
    providerLabel: "Claude Code",
    role: agent.role,
    target: `@${agent.displayName}`,
  }));
  const selected = targets.find((target) => target.role === "orchestrator") ?? targets[0] ?? {
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
  },
): InspectorSelection | null {
  if (!selection) {
    return null;
  }
  if (selection.mode === "runtime") {
    return selection;
  }
  if (selection.mode === "plan" && data.plan?.id === selection.id) {
    return selection;
  }
  if (selection.mode === "permission" && data.permissions.some((permission) => permission.id === selection.id)) {
    return selection;
  }
  if (selection.mode === "diff" && data.diff?.id === selection.id) {
    return selection;
  }
  if (selection.mode === "artifact" && data.artifacts.some((artifact) => artifact.id === selection.id)) {
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
  const runtimeSummary = runtimeFromSnapshot(runtime);
  const navigation = navigationFromSnapshot(snapshot, workspace, runtime);
  const composer = composerFromSnapshot(snapshot, runtimeSummary);
  const plan = options.activePlan
    ? {
        agents: options.activePlan.steps.map((step) => agentName(step.assignedAgentId, snapshot?.agents ?? [])),
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
            state: options.activeDiff.state === "offline" ? ("offline" as const) : ("metadata-only" as const),
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
  });

  return {
    activeConversationTitle: activeConversationTitle(snapshot),
    composer,
    inspector: {
      artifacts,
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
      pendingPermissionCount: permissions.filter((permission) => permission.status === "pending").length,
    },
  };
}

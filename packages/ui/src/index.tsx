import type {
  Agent,
  Artifact,
  DiffFileSummary,
  Message,
  MessagePart,
  PermissionRequest,
  PermissionRisk,
  PermissionStatus,
  PlanStatus,
  Run,
  RuntimeDevice,
  RuntimeDeviceStatus,
  WorkbenchSnapshot,
  Workspace,
} from "@agenthub/contracts";
import type { OrchestratorDispatchPlan } from "@agenthub/contracts";
import * as ScrollArea from "@radix-ui/react-scroll-area";
import * as Separator from "@radix-ui/react-separator";
import {
  Bot,
  ClipboardCheck,
  Moon,
  PanelLeftClose,
  PanelRightClose,
  Play,
  Settings,
  Sun,
  Terminal,
} from "lucide-react";
import React from "react";

export type WorkbenchLayoutMode = "wide" | "standard" | "narrow" | "mobile-web";
export type WorkbenchVisualState =
  | "loading"
  | "empty"
  | "offline"
  | "blocked"
  | "error"
  | "success"
  | "warning"
  | "selected"
  | "focused"
  | "disabled"
  | "unavailable"
  | "metadata-only";

export type TimelineItemKind =
  | "message"
  | "run-event"
  | "plan"
  | "permission"
  | "diff"
  | "artifact"
  | "summary"
  | "empty";

export type InspectorMode = "empty" | "plan" | "permission" | "diff" | "runtime" | "artifact" | "run";

export interface ConversationListItem {
  readonly id: string;
  readonly title: string;
  readonly participants: readonly string[];
  readonly pendingPermissions: number;
  readonly active: boolean;
  readonly activeRunStatus?: Run["status"];
}

export interface WorkspaceNavigationViewModel {
  readonly workspaceName: string;
  readonly workspacePathLabel: string;
  readonly branchLabel: string;
  readonly runtimeStatus: RuntimeDeviceStatus;
  readonly runtimeLabel: string;
  readonly pendingPermissionCount: number;
  readonly conversations: readonly ConversationListItem[];
  readonly agents: readonly AgentTargetViewModel[];
  readonly runCount: number;
}

type IconComponent = typeof Terminal;
const PanelLeftIcon = PanelLeftClose;
const PanelRight = PanelRightClose;

function Icon(props: { readonly icon: IconComponent }): React.ReactElement {
  const Component = props.icon;
  return <Component aria-hidden="true" className="agenthub-icon" />;
}

export interface RuntimeSummaryViewModel {
  readonly id: string | null;
  readonly label: string;
  readonly status: RuntimeDeviceStatus;
  readonly platform: string;
  readonly appVersion: string;
  readonly lastHeartbeatLabel: string;
  readonly capabilities: readonly string[];
  readonly explanation: string;
  readonly canExecute: boolean;
}

export interface AgentTargetViewModel {
  readonly id: string;
  readonly label: string;
  readonly role: Agent["role"];
  readonly target: string;
  readonly providerLabel: string;
  readonly capabilityTags: readonly string[];
}

export interface ComposerTargetState {
  readonly selectedTarget: string;
  readonly selectedRole: Agent["role"];
  readonly modeLabel: string;
  readonly disabled: boolean;
  readonly disabledReason: string | null;
  readonly targets: readonly AgentTargetViewModel[];
}

export interface PlanViewModel {
  readonly id: string;
  readonly title: string;
  readonly status: PlanStatus;
  readonly goal: string;
  readonly assumptions: readonly string[];
  readonly agents: readonly string[];
  readonly steps: readonly {
    readonly id: string;
    readonly title: string;
    readonly assignedAgent: string;
    readonly risks: readonly string[];
    readonly expectedArtifacts: readonly string[];
  }[];
  readonly risks: readonly string[];
  readonly progressLabel: string;
}

export interface PermissionViewModel {
  readonly id: string;
  readonly requestingAgent: string;
  readonly actionKind: PermissionRequest["actionKind"];
  readonly summary: string;
  readonly workspaceName: string;
  readonly risk: PermissionRisk;
  readonly status: PermissionStatus;
  readonly command: string | null;
  readonly paths: readonly string[];
  readonly relatedRunId: string;
  readonly relatedPlanId: string | null;
}

export interface DiffViewModel {
  readonly id: string;
  readonly runId: string;
  readonly files: readonly DiffFileSummary[];
  readonly state: "metadata-only" | "loading-full-diff" | "available" | "offline" | "stale" | "cached" | "error";
  readonly baseCommit: string | null;
  readonly warning: string | null;
}

export interface ArtifactViewModel {
  readonly id: string;
  readonly title: string;
  readonly type: Artifact["type"] | "unavailable";
  readonly summary: string;
  readonly runId: string | null;
}

export interface RunViewModel {
  readonly id: string;
  readonly status: Run["status"];
  readonly agentName: string;
  readonly startedAt: string;
  readonly completedAt: string;
  readonly failureReason: string | null;
}

export interface TimelineItemViewModel {
  readonly id: string;
  readonly kind: TimelineItemKind;
  readonly title: string;
  readonly subtitle: string;
  readonly body: readonly string[];
  readonly state: WorkbenchVisualState;
  readonly inspectorSelection?: InspectorSelection;
}

export interface InspectorSelection {
  readonly mode: InspectorMode;
  readonly id: string;
}

export interface WorkbenchViewModel {
  readonly workspace: WorkspaceNavigationViewModel;
  readonly runtime: RuntimeSummaryViewModel;
  readonly timeline: readonly TimelineItemViewModel[];
  readonly composer: ComposerTargetState;
  readonly inspector: {
    readonly selection: InspectorSelection | null;
    readonly plan: PlanViewModel | null;
    readonly permissions: readonly PermissionViewModel[];
    readonly diff: DiffViewModel | null;
    readonly artifacts: readonly ArtifactViewModel[];
    readonly runs: readonly RunViewModel[];
  };
  readonly states: readonly WorkbenchVisualState[];
  readonly activeConversationTitle: string;
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
): ComposerTargetState {
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
  const timeline = [
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

function normalizeSelection(
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

export function RuntimeStatusBadge(props: {
  readonly status: RuntimeDeviceStatus;
  readonly label?: string;
}): React.ReactElement {
  return (
    <span className="agenthub-status-badge" data-status={props.status} aria-label={`Runtime ${props.status}`}>
      <span aria-hidden="true" className="agenthub-status-dot" />
      {props.label ?? props.status}
    </span>
  );
}

export function ParticipantChip(props: { readonly label: string }): React.ReactElement {
  return <span className="agenthub-participant-chip">{props.label}</span>;
}

export function ConversationList(props: {
  readonly conversations: readonly ConversationListItem[];
}): React.ReactElement {
  return (
    <nav aria-label="Conversations" className="agenthub-conversation-list">
      {props.conversations.length === 0 ? <p className="agenthub-muted">No conversations yet</p> : null}
      {props.conversations.map((conversation) => (
        <button
          aria-current={conversation.active ? "page" : undefined}
          className="agenthub-nav-row agenthub-conversation-row"
          key={conversation.id}
          type="button"
        >
          <span className="agenthub-row-main">{conversation.title}</span>
          <small>{conversation.participants.join(", ") || "No participants"}</small>
          <span className="agenthub-row-meta">
            {conversation.activeRunStatus ? `Run ${conversation.activeRunStatus}` : "Idle"}
            {conversation.pendingPermissions > 0 ? ` · ${conversation.pendingPermissions} pending` : ""}
          </span>
        </button>
      ))}
    </nav>
  );
}

export function AgentMentionComposer(props: {
  readonly targets: readonly AgentTargetViewModel[] | readonly string[];
  readonly selectedTarget: string;
  readonly disabled?: boolean;
  readonly disabledReason?: string | null;
  readonly modeLabel?: string;
  readonly onSend?: (message: string, target: string) => void;
}): React.ReactElement {
  const normalizedTargets = props.targets.map((target) =>
    typeof target === "string"
      ? {
          capabilityTags: [],
          id: target,
          label: target.replace(/^@/, ""),
          providerLabel: "Unknown provider",
          role: target.toLowerCase().includes("orchestrator") ? ("orchestrator" as const) : ("worker" as const),
          target,
        }
      : target,
  );
  const [message, setMessage] = React.useState("");
  const [target, setTarget] = React.useState(props.selectedTarget);
  const selected = normalizedTargets.find((candidate) => candidate.target === target) ?? normalizedTargets[0];
  const modeLabel = selected?.role === "orchestrator" ? "Plan Mode" : props.modeLabel ?? "Direct agent message";

  return (
    <form
      aria-label="Message composer"
      className="agenthub-composer"
      onSubmit={(event) => {
        event.preventDefault();
        if (!message.trim() || props.disabled || !selected) {
          return;
        }
        props.onSend?.(message.trim(), selected.target);
        setMessage("");
      }}
    >
      <div className="agenthub-composer-toolbar">
        <label>
          <span>Target</span>
          <select
            aria-label="Agent target"
            disabled={props.disabled}
            onChange={(event) => setTarget(event.currentTarget.value)}
            value={target}
          >
            {normalizedTargets.map((candidate) => (
              <option key={candidate.id} value={candidate.target}>
                {candidate.target}
              </option>
            ))}
          </select>
        </label>
        <span className="agenthub-mode-label">{modeLabel}</span>
      </div>
      <textarea
        aria-describedby={props.disabled ? "agenthub-composer-disabled-reason" : undefined}
        aria-label="Message"
        disabled={props.disabled}
        onChange={(event) => setMessage(event.currentTarget.value)}
        placeholder={props.disabled ? "Runtime offline" : "Message an agent..."}
        value={message}
      />
      <div className="agenthub-composer-footer">
        {props.disabled ? (
          <span className="agenthub-warning" id="agenthub-composer-disabled-reason">
            {props.disabledReason ?? "Desktop Runtime must be online before sending."}
          </span>
        ) : (
          <span className="agenthub-muted">{modeLabel}</span>
        )}
        <button disabled={props.disabled || !message.trim()} type="submit">
          Send
        </button>
      </div>
    </form>
  );
}

export function ChatTimeline(props: {
  readonly items: readonly TimelineItemViewModel[] | readonly React.ReactNode[];
  readonly selected?: InspectorSelection | null;
  readonly onSelect?: (selection: InspectorSelection) => void;
}): React.ReactElement {
  const first = props.items[0];
  const viewModelItems =
    first && typeof first === "object" && "kind" in first ? (props.items as readonly TimelineItemViewModel[]) : null;

  if (!viewModelItems) {
    return (
      <ol aria-label="Conversation timeline" className="agenthub-timeline">
        {(props.items as readonly React.ReactNode[]).map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ol>
    );
  }

  return (
    <ol aria-label="Conversation timeline" className="agenthub-timeline">
      {viewModelItems.map((item) => (
        <li key={item.id}>
          <button
            aria-pressed={props.selected?.id === item.id}
            className="agenthub-timeline-item"
            data-kind={item.kind}
            data-state={item.state}
            disabled={!item.inspectorSelection}
            onClick={() => {
              if (item.inspectorSelection) {
                props.onSelect?.(item.inspectorSelection);
              }
            }}
            type="button"
          >
            <span className="agenthub-row-main">{item.title}</span>
            <small>{item.subtitle}</small>
            {item.body.map((line, index) => (
              <span className="agenthub-timeline-line" key={index}>
                {line}
              </span>
            ))}
          </button>
        </li>
      ))}
    </ol>
  );
}

export function PlanCard(props: {
  readonly title: string;
  readonly status: PlanStatus;
  readonly agents: readonly string[];
}): React.ReactElement {
  return (
    <article aria-label={`Plan ${props.status}`} className="agenthub-card agenthub-plan-card">
      <header>
        <strong>{props.title}</strong>
        <span>{props.status}</span>
      </header>
      <p>{props.agents.join(" -> ")}</p>
      <footer>
        <button type="button">Approve</button>
        <button type="button">Revise</button>
        <button type="button">Cancel</button>
      </footer>
    </article>
  );
}

export function PermissionCard(props: {
  readonly summary: string;
  readonly risk: PermissionRisk;
  readonly status: PermissionStatus;
}): React.ReactElement {
  return (
    <article aria-label={`Permission ${props.status}`} className="agenthub-card agenthub-permission-card">
      <header>
        <strong>{props.summary}</strong>
        <span>{props.risk}</span>
      </header>
      <p>{props.status}</p>
      {props.status === "pending" ? (
        <footer>
          <button type="button">Allow once</button>
          <button type="button">Deny</button>
        </footer>
      ) : null}
    </article>
  );
}

export function DiffCard(props: {
  readonly files: readonly DiffFileSummary[];
  readonly state: "metadata-only" | "loading-full-diff" | "available" | "offline" | "stale" | "cached" | "error";
}): React.ReactElement {
  const insertions = props.files.reduce((sum, file) => sum + file.insertions, 0);
  const deletions = props.files.reduce((sum, file) => sum + file.deletions, 0);
  return (
    <article aria-label={`Diff ${props.state}`} className="agenthub-card agenthub-diff-card">
      <header>
        <strong>{props.files.length} files changed</strong>
        <span>{props.state}</span>
      </header>
      <p>
        +{insertions} -{deletions}
      </p>
      <button type="button">Open review</button>
    </article>
  );
}

export function WorkspaceStatusSurface(props: {
  readonly workspaceName: string;
  readonly runtimeStatus: RuntimeDeviceStatus;
  readonly runtimeLabel?: string;
  readonly workspacePathLabel?: string;
  readonly branchLabel?: string;
}): React.ReactElement {
  return (
    <section aria-label="Workspace status" className="agenthub-workspace-status">
      <strong title={props.workspaceName}>{props.workspaceName}</strong>
      <RuntimeStatusBadge
        status={props.runtimeStatus}
        {...(props.runtimeLabel ? { label: props.runtimeLabel } : {})}
      />
      <small title={props.workspacePathLabel}>{props.workspacePathLabel ?? "No workspace path"}</small>
      <small>{props.branchLabel ?? "No branch"}</small>
    </section>
  );
}

function LeftNavigation(props: {
  readonly model: WorkbenchViewModel;
  readonly onSelect: (selection: InspectorSelection) => void;
  readonly collapsed: boolean;
  readonly onToggleCollapsed: () => void;
}): React.ReactElement {
  return (
    <aside aria-label="Workspace navigation" className="agenthub-left-nav">
      <button
        aria-label={props.collapsed ? "Expand workspace navigation" : "Collapse workspace navigation"}
        className="agenthub-sidebar-toggle agenthub-left-toggle"
        onClick={props.onToggleCollapsed}
        type="button"
      >
        <Icon icon={PanelLeftIcon} />
      </button>
      <WorkspaceStatusSurface
        branchLabel={props.model.workspace.branchLabel}
        runtimeLabel={props.model.workspace.runtimeLabel}
        runtimeStatus={props.model.workspace.runtimeStatus}
        workspaceName={props.model.workspace.workspaceName}
        workspacePathLabel={props.model.workspace.workspacePathLabel}
      />
      <Separator.Root className="agenthub-separator" />
      <button className="agenthub-nav-row" onClick={() => props.onSelect({ id: "runtime", mode: "runtime" })} type="button">
        <Icon icon={Terminal} />
        <span className="agenthub-row-main">Runtime</span>
        <small>{props.model.runtime.status}</small>
      </button>
      <button className="agenthub-nav-row" type="button">
        <Icon icon={Bot} />
        <span className="agenthub-row-main">Agents</span>
        <small>{props.model.workspace.agents.length}</small>
      </button>
      <button className="agenthub-nav-row" type="button">
        <Icon icon={Play} />
        <span className="agenthub-row-main">Runs</span>
        <small>{props.model.workspace.runCount}</small>
      </button>
      <button className="agenthub-nav-row" type="button">
        <Icon icon={Settings} />
        <span className="agenthub-row-main">Settings</span>
      </button>
      <button
        className="agenthub-nav-row agenthub-permission-entry"
        disabled={props.model.workspace.pendingPermissionCount === 0}
        onClick={() => {
          const firstPermission = props.model.inspector.permissions[0];
          if (firstPermission) {
            props.onSelect({ id: firstPermission.id, mode: "permission" });
          }
        }}
        type="button"
      >
        <Icon icon={ClipboardCheck} />
        <span className="agenthub-row-main">Pending permissions</span>
        <small>{props.model.workspace.pendingPermissionCount}</small>
      </button>
      <Separator.Root className="agenthub-separator" />
      <ScrollArea.Root className="agenthub-scroll-root">
        <ScrollArea.Viewport className="agenthub-scroll-viewport">
          <ConversationList conversations={props.model.workspace.conversations} />
        </ScrollArea.Viewport>
        <ScrollArea.Scrollbar className="agenthub-scrollbar" orientation="vertical">
          <ScrollArea.Thumb className="agenthub-scroll-thumb" />
        </ScrollArea.Scrollbar>
      </ScrollArea.Root>
    </aside>
  );
}

function DetailSection(props: {
  readonly title: string;
  readonly children: React.ReactNode;
}): React.ReactElement {
  return (
    <section className="agenthub-detail-section">
      <h4>{props.title}</h4>
      {props.children}
    </section>
  );
}

function ContextInspector(props: {
  readonly model: WorkbenchViewModel;
  readonly selection: InspectorSelection | null;
  readonly onSelect: (selection: InspectorSelection | null) => void;
  readonly onOpenFullScreenDiff: () => void;
  readonly collapsed: boolean;
  readonly onToggleCollapsed: () => void;
}): React.ReactElement {
  const selection = normalizeSelection(props.selection, {
    artifacts: props.model.inspector.artifacts,
    diff: props.model.inspector.diff,
    permissions: props.model.inspector.permissions,
    plan: props.model.inspector.plan,
    runs: props.model.inspector.runs,
  });

  return (
    <aside aria-label="Context Inspector" className="agenthub-inspector">
      <header>
        <strong>Context Inspector</strong>
        <div className="agenthub-header-actions">
          {selection ? (
            <button onClick={() => props.onSelect(null)} type="button">
              Clear
            </button>
          ) : null}
          <button
            aria-label={props.collapsed ? "Expand Context Inspector" : "Collapse Context Inspector"}
            className="agenthub-icon-button"
            onClick={props.onToggleCollapsed}
            type="button"
          >
            <Icon icon={PanelRight} />
          </button>
        </div>
      </header>
      {renderInspectorBody(props.model, selection, props.onSelect, props.onOpenFullScreenDiff)}
    </aside>
  );
}

function renderInspectorBody(
  model: WorkbenchViewModel,
  selection: InspectorSelection | null,
  onSelect: (selection: InspectorSelection | null) => void,
  onOpenFullScreenDiff: () => void,
): React.ReactNode {
  if (!selection) {
    return (
      <div className="agenthub-inspector-body">
        <h3>{model.activeConversationTitle}</h3>
        <p className="agenthub-muted">{model.workspace.workspaceName}</p>
        <p>{model.runtime.explanation}</p>
        <button onClick={() => onSelect({ id: "runtime", mode: "runtime" })} type="button">
          Runtime details
        </button>
      </div>
    );
  }

  if (selection.mode === "runtime") {
    return <RuntimeDetail runtime={model.runtime} />;
  }

  if (selection.mode === "plan") {
    const plan = model.inspector.plan;
    if (!plan) {
      return <UnavailableDetail label="Plan unavailable" />;
    }
    return <PlanDetail plan={plan} />;
  }

  if (selection.mode === "permission") {
    const permission = model.inspector.permissions.find((candidate) => candidate.id === selection.id);
    if (!permission) {
      return <UnavailableDetail label="Permission unavailable" />;
    }
    return <PermissionDetail permission={permission} />;
  }

  if (selection.mode === "diff") {
    const diff = model.inspector.diff;
    if (!diff) {
      return <UnavailableDetail label="Diff unavailable" />;
    }
    return <DiffDetail diff={diff} onOpenFullScreen={onOpenFullScreenDiff} />;
  }

  if (selection.mode === "artifact") {
    const artifact = model.inspector.artifacts.find((candidate) => candidate.id === selection.id);
    if (!artifact) {
      return <UnavailableDetail label="Artifact unavailable" />;
    }
    return <ArtifactDetail artifact={artifact} />;
  }

  const run = model.inspector.runs.find((candidate) => candidate.id === selection.id);
  if (!run) {
    return <UnavailableDetail label="Run unavailable" />;
  }
  return <RunDetail run={run} />;
}

function UnavailableDetail(props: { readonly label: string }): React.ReactElement {
  return (
    <div className="agenthub-inspector-body" data-state="unavailable">
      <h3>{props.label}</h3>
      <p>The selected item is no longer available in the latest snapshot.</p>
    </div>
  );
}

function PlanDetail(props: { readonly plan: PlanViewModel }): React.ReactElement {
  return (
    <div className="agenthub-inspector-body">
      <h3>{props.plan.title}</h3>
      <RuntimeStatusBadge status={props.plan.status === "failed" ? "degraded" : "online"} label={props.plan.status} />
      <DetailSection title="Goal">
        <p>{props.plan.goal}</p>
      </DetailSection>
      <DetailSection title="Assumptions">
        <ul>{props.plan.assumptions.map((item) => <li key={item}>{item}</li>)}</ul>
      </DetailSection>
      <DetailSection title="Steps">
        <ol>
          {props.plan.steps.map((step) => (
            <li key={step.id}>
              <strong>{step.title}</strong>
              <p>{step.assignedAgent}</p>
              {step.risks.length > 0 ? <small>{step.risks.join(", ")}</small> : null}
            </li>
          ))}
        </ol>
      </DetailSection>
      <DetailSection title="Actions">
        <div className="agenthub-action-row">
          <button type="button">Approve</button>
          <button type="button">Ask to revise</button>
          <button type="button">Cancel plan</button>
        </div>
      </DetailSection>
    </div>
  );
}

function PermissionDetail(props: { readonly permission: PermissionViewModel }): React.ReactElement {
  return (
    <div className="agenthub-inspector-body">
      <h3>{props.permission.summary}</h3>
      <p>{props.permission.requestingAgent}</p>
      <DetailSection title="Request">
        <dl>
          <dt>Action</dt>
          <dd>{props.permission.actionKind}</dd>
          <dt>Workspace</dt>
          <dd>{props.permission.workspaceName}</dd>
          <dt>Risk</dt>
          <dd>{props.permission.risk}</dd>
          <dt>Related run</dt>
          <dd>{props.permission.relatedRunId}</dd>
        </dl>
      </DetailSection>
      {props.permission.command ? (
        <DetailSection title="Command">
          <code>{props.permission.command}</code>
        </DetailSection>
      ) : null}
      {props.permission.paths.length > 0 ? (
        <DetailSection title="Paths">
          <ul>{props.permission.paths.map((path) => <li key={path}>{path}</li>)}</ul>
        </DetailSection>
      ) : null}
      {props.permission.status === "pending" ? (
        <div className="agenthub-action-row">
          <button type="button">Allow once</button>
          <button type="button">Deny</button>
        </div>
      ) : (
        <p>{props.permission.status}</p>
      )}
    </div>
  );
}

function DiffDetail(props: {
  readonly diff: DiffViewModel;
  readonly onOpenFullScreen: () => void;
  readonly fullScreen?: boolean;
}): React.ReactElement {
  const insertions = props.diff.files.reduce((sum, file) => sum + file.insertions, 0);
  const deletions = props.diff.files.reduce((sum, file) => sum + file.deletions, 0);
  return (
    <div className="agenthub-inspector-body">
      <h3>Diff review</h3>
      <p>
        {props.diff.files.length} files · +{insertions} -{deletions}
      </p>
      {props.diff.warning ? <p className="agenthub-warning">{props.diff.warning}</p> : null}
      <DetailSection title="Files">
        <ul className="agenthub-file-list">
          {props.diff.files.map((file) => (
            <li key={file.path}>
              <span title={file.path}>{file.path}</span>
              <small>
                {file.status} +{file.insertions} -{file.deletions}
              </small>
            </li>
          ))}
        </ul>
      </DetailSection>
      <button onClick={props.onOpenFullScreen} type="button">
        {props.fullScreen ? "Return to conversation" : "Open full-screen diff review"}
      </button>
    </div>
  );
}

function RuntimeDetail(props: { readonly runtime: RuntimeSummaryViewModel }): React.ReactElement {
  return (
    <div className="agenthub-inspector-body">
      <h3>{props.runtime.label}</h3>
      <RuntimeStatusBadge status={props.runtime.status} />
      <p>{props.runtime.explanation}</p>
      <DetailSection title="Device">
        <dl>
          <dt>Platform</dt>
          <dd>{props.runtime.platform}</dd>
          <dt>Version</dt>
          <dd>{props.runtime.appVersion}</dd>
          <dt>Heartbeat</dt>
          <dd>{props.runtime.lastHeartbeatLabel}</dd>
        </dl>
      </DetailSection>
      <DetailSection title="Capabilities">
        <ul>
          {props.runtime.capabilities.length > 0 ? (
            props.runtime.capabilities.map((capability) => <li key={capability}>{capability}</li>)
          ) : (
            <li>No capabilities published</li>
          )}
        </ul>
      </DetailSection>
    </div>
  );
}

function ArtifactDetail(props: { readonly artifact: ArtifactViewModel }): React.ReactElement {
  return (
    <div className="agenthub-inspector-body">
      <h3>{props.artifact.title}</h3>
      <p>{props.artifact.type}</p>
      <p>{props.artifact.summary}</p>
    </div>
  );
}

function RunDetail(props: { readonly run: RunViewModel }): React.ReactElement {
  return (
    <div className="agenthub-inspector-body">
      <h3>Run {props.run.status}</h3>
      <p>{props.run.agentName}</p>
      <DetailSection title="Timing">
        <dl>
          <dt>Started</dt>
          <dd>{props.run.startedAt}</dd>
          <dt>Completed</dt>
          <dd>{props.run.completedAt}</dd>
        </dl>
      </DetailSection>
      {props.run.failureReason ? <p className="agenthub-warning">{props.run.failureReason}</p> : null}
    </div>
  );
}

export function AgentHubWorkbench(props: {
  readonly snapshot?: WorkbenchSnapshot;
  readonly viewModel?: WorkbenchViewModel;
  readonly loading?: boolean;
  readonly error?: string | null;
  readonly layoutMode?: WorkbenchLayoutMode;
  readonly initialInspectorSelection?: InspectorSelection | null;
  readonly initialFullScreenDiffId?: string | null;
  readonly onRetry?: () => void;
  readonly onSend?: (message: string, target?: string) => void;
}): React.ReactElement {
  const model = props.viewModel ?? createWorkbenchViewModel(props.snapshot);
  const [selection, setSelection] = React.useState<InspectorSelection | null>(
    props.initialInspectorSelection ?? model.inspector.selection,
  );
  const [fullScreenDiffId, setFullScreenDiffId] = React.useState<string | null>(
    props.initialFullScreenDiffId ?? null,
  );
  const [theme, setTheme] = React.useState<"light" | "dark">(() => {
    if (typeof window === "undefined") {
      return "dark";
    }
    const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
    const hashTheme = hashParams.get("agenthubTheme");
    if (hashTheme === "light" || hashTheme === "dark") {
      return hashTheme;
    }
    const storedTheme = window.localStorage.getItem("agenthub.theme");
    return storedTheme === "light" || storedTheme === "dark" ? storedTheme : "dark";
  });
  const [leftCollapsed, setLeftCollapsed] = React.useState(false);
  const [rightCollapsed, setRightCollapsed] = React.useState(false);
  const [detectedLayoutMode, setDetectedLayoutMode] = React.useState<WorkbenchLayoutMode>("wide");
  React.useEffect(() => {
    if (props.layoutMode) {
      return;
    }

    const updateLayoutMode = () => setDetectedLayoutMode(workbenchLayoutForWidth(window.innerWidth));
    updateLayoutMode();
    window.addEventListener("resize", updateLayoutMode);
    return () => window.removeEventListener("resize", updateLayoutMode);
  }, [props.layoutMode]);
  React.useEffect(() => {
    window.localStorage.setItem("agenthub.theme", theme);
  }, [theme]);
  const layoutMode = props.layoutMode ?? detectedLayoutMode;
  const fullScreenDiff =
    fullScreenDiffId && model.inspector.diff?.id === fullScreenDiffId ? model.inspector.diff : null;

  if (props.loading) {
    return (
      <main className="agenthub-workbench" data-layout={layoutMode} data-state="loading" data-theme={theme}>
        <WorkbenchStyle />
        <section aria-label="Loading workbench" className="agenthub-state-panel">
          <strong>Loading AgentHub</strong>
          <p>Fetching the latest Control Plane snapshot.</p>
        </section>
      </main>
    );
  }

  if (props.error) {
    return (
      <main className="agenthub-workbench" data-layout={layoutMode} data-state="error" data-theme={theme}>
        <WorkbenchStyle />
        <section aria-label="Connection error" className="agenthub-state-panel">
          <strong>Control Plane offline</strong>
          <p>{props.error}</p>
          <button onClick={props.onRetry} type="button">
            Retry
          </button>
        </section>
      </main>
    );
  }

  return (
    <main
      className="agenthub-workbench"
      data-left-collapsed={leftCollapsed ? "true" : "false"}
      data-layout={layoutMode}
      data-right-collapsed={rightCollapsed ? "true" : "false"}
      data-state={model.runtime.status}
      data-theme={theme}
    >
      <WorkbenchStyle />
      <LeftNavigation
        collapsed={leftCollapsed}
        model={model}
        onSelect={setSelection}
        onToggleCollapsed={() => setLeftCollapsed((current) => !current)}
      />
      <section aria-label="Conversation workbench" className="agenthub-center">
        <header className="agenthub-conversation-header">
          <div className="agenthub-title-cluster">
            {leftCollapsed ? (
              <button
                aria-label="Expand workspace navigation"
                className="agenthub-icon-button"
                onClick={() => setLeftCollapsed(false)}
                type="button"
              >
                <Icon icon={PanelLeftIcon} />
              </button>
            ) : null}
            <div>
              <strong>{model.activeConversationTitle}</strong>
              <small>{model.workspace.workspaceName}</small>
            </div>
          </div>
          <div className="agenthub-header-actions">
            <RuntimeStatusBadge status={model.runtime.status} />
            {rightCollapsed ? (
              <button
                aria-label="Expand Context Inspector"
                className="agenthub-icon-button"
                onClick={() => setRightCollapsed(false)}
                type="button"
              >
                <Icon icon={PanelRight} />
              </button>
            ) : null}
            <button
              aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
              className="agenthub-icon-button"
              onClick={() => setTheme((current) => (current === "dark" ? "light" : "dark"))}
              type="button"
            >
              <Icon icon={theme === "dark" ? Sun : Moon} />
            </button>
          </div>
        </header>
        <ChatTimeline items={model.timeline} selected={selection} onSelect={setSelection} />
        <AgentMentionComposer
          disabled={model.composer.disabled}
          disabledReason={model.composer.disabledReason}
          modeLabel={model.composer.modeLabel}
          {...(props.onSend ? { onSend: props.onSend } : {})}
          selectedTarget={model.composer.selectedTarget}
          targets={model.composer.targets}
        />
      </section>
      <ContextInspector
        collapsed={rightCollapsed}
        model={model}
        onOpenFullScreenDiff={() => {
          if (model.inspector.diff) {
            setFullScreenDiffId(model.inspector.diff.id);
          }
        }}
        onSelect={setSelection}
        onToggleCollapsed={() => setRightCollapsed((current) => !current)}
        selection={selection}
      />
      {fullScreenDiff ? (
        <section aria-label="Full-screen diff review" className="agenthub-fullscreen-diff">
          <header>
            <strong>Full-screen diff review</strong>
            <button onClick={() => setFullScreenDiffId(null)} type="button">
              Return to conversation
            </button>
          </header>
          <DiffDetail diff={fullScreenDiff} fullScreen onOpenFullScreen={() => setFullScreenDiffId(null)} />
        </section>
      ) : null}
    </main>
  );
}

function WorkbenchStyle(): React.ReactElement {
  return <style>{workbenchCss}</style>;
}

const workbenchCss = `
html, body, #root {
  min-width: 0;
  width: 100%;
  min-height: 100%;
  margin: 0;
  background: #0f0f10;
}
body {
  overflow: hidden;
}
.agenthub-workbench {
  --agenthub-bg: #f7f7f7;
  --agenthub-surface: #ffffff;
  --agenthub-surface-2: #fbfbfb;
  --agenthub-surface-hover: #f1f1f1;
  --agenthub-border: #dedede;
  --agenthub-border-strong: #b8b8b8;
  --agenthub-text: #101010;
  --agenthub-text-secondary: #555555;
  --agenthub-text-muted: #777777;
  --agenthub-accent: #101010;
  --agenthub-accent-text: #ffffff;
  --agenthub-status: #2f6f4e;
  --agenthub-warning: #8a5a00;
  --agenthub-danger: #9f2323;
  --agenthub-radius: 6px;
  --agenthub-font: ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
  --agenthub-mono: "SFMono-Regular", "SF Mono", Consolas, "Liberation Mono", monospace;
  box-sizing: border-box;
  width: 100%;
  min-width: 0;
  min-height: 100vh;
  min-height: 100dvh;
  overflow: hidden;
  display: grid;
  grid-template-columns: minmax(236px, 272px) minmax(0, 1fr) minmax(300px, 360px);
  background: var(--agenthub-bg);
  color: var(--agenthub-text);
  font-family: var(--agenthub-font);
  font-size: 13px;
  line-height: 1.5;
  letter-spacing: 0;
}
.agenthub-workbench[data-theme="dark"] {
  --agenthub-bg: #0f0f10;
  --agenthub-surface: #151516;
  --agenthub-surface-2: #1b1b1d;
  --agenthub-surface-hover: #242427;
  --agenthub-border: #2c2c2f;
  --agenthub-border-strong: #4a4a4f;
  --agenthub-text: #f3f3f3;
  --agenthub-text-secondary: #b8b8b8;
  --agenthub-text-muted: #858585;
  --agenthub-accent: #f3f3f3;
  --agenthub-accent-text: #101010;
  --agenthub-status: #7fd29a;
  --agenthub-warning: #d6b25e;
  --agenthub-danger: #ff8a8a;
}
.agenthub-workbench *, .agenthub-workbench *::before, .agenthub-workbench *::after { box-sizing: border-box; }
.agenthub-icon { width: 14px; height: 14px; flex: 0 0 auto; stroke-width: 1.8; }
.agenthub-left-nav, .agenthub-center, .agenthub-inspector {
  min-width: 0;
  background: var(--agenthub-surface);
}
.agenthub-left-nav {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 14px;
  border-right: 1px solid var(--agenthub-border);
  min-height: 0;
  overflow: hidden;
}
.agenthub-center {
  display: grid;
  grid-template-rows: 46px minmax(0, 1fr) auto;
  min-height: 100vh;
  min-height: 100dvh;
  min-width: 0;
  overflow: hidden;
}
.agenthub-inspector {
  border-left: 1px solid var(--agenthub-border);
  min-width: 0;
  overflow: hidden;
}
.agenthub-conversation-header, .agenthub-inspector > header {
  min-height: 52px;
  padding: 0 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid var(--agenthub-border);
  gap: 12px;
  background: var(--agenthub-surface);
}
.agenthub-header-actions { display: inline-flex; align-items: center; gap: 8px; }
.agenthub-title-cluster { display: inline-flex; align-items: center; gap: 10px; min-width: 0; }
.agenthub-workspace-status {
  display: grid;
  gap: 7px;
  padding: 4px 4px 10px;
}
.agenthub-workspace-status strong {
  font-size: 13px;
  font-weight: 650;
}
.agenthub-row-main, .agenthub-workspace-status strong, .agenthub-conversation-header strong {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.agenthub-muted, .agenthub-workbench small {
  color: var(--agenthub-text-muted);
  font-size: 11px;
}
.agenthub-separator {
  height: 1px;
  background: var(--agenthub-border);
  margin: 4px 0;
}
.agenthub-scroll-root { min-height: 0; flex: 1 1 auto; overflow: hidden; }
.agenthub-scroll-viewport { width: 100%; height: 100%; }
.agenthub-scrollbar { width: 8px; padding: 2px; }
.agenthub-scroll-thumb { border-radius: 999px; background: var(--agenthub-border-strong); }
.agenthub-nav-row, .agenthub-timeline-item {
  width: 100%;
  min-width: 0;
  min-height: 32px;
  text-align: left;
  border: 1px solid transparent;
  background: transparent;
  color: inherit;
  border-radius: var(--agenthub-radius);
  padding: 9px 10px;
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: center;
  gap: 10px;
  font: inherit;
}
.agenthub-nav-row small, .agenthub-row-meta { justify-self: end; color: var(--agenthub-text-muted); }
.agenthub-nav-row:hover, .agenthub-timeline-item:hover {
  background: var(--agenthub-surface-hover);
}
.agenthub-nav-row:focus-visible, .agenthub-timeline-item:focus-visible, button:focus-visible, select:focus-visible, textarea:focus-visible {
  outline: 1px solid var(--agenthub-accent);
  outline-offset: 2px;
}
.agenthub-nav-row[aria-current="page"], .agenthub-timeline-item[aria-pressed="true"] {
  border-color: var(--agenthub-border-strong);
  background: var(--agenthub-surface-hover);
}
.agenthub-nav-row:disabled { opacity: .45; }
.agenthub-conversation-list {
  display: grid;
  gap: 4px;
  padding-top: 4px;
}
.agenthub-conversation-row {
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: start;
}
.agenthub-conversation-row small { grid-column: 1 / -1; justify-self: start; }
.agenthub-status-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
  max-width: 100%;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  color: var(--agenthub-text-secondary);
  font-size: 11px;
}
.agenthub-status-dot {
  width: 7px;
  height: 7px;
  border-radius: 999px;
  background: var(--agenthub-text-muted);
  flex: 0 0 auto;
}
.agenthub-status-badge[data-status="online"] .agenthub-status-dot,
.agenthub-status-badge[data-status="active-running"] .agenthub-status-dot { background: var(--agenthub-status); }
.agenthub-status-badge[data-status="offline"] .agenthub-status-dot { background: var(--agenthub-warning); }
.agenthub-status-badge[data-status="degraded"] .agenthub-status-dot { background: var(--agenthub-warning); }
.agenthub-timeline {
  list-style: none;
  margin: 0;
  padding: 20px 24px;
  display: grid;
  align-content: start;
  gap: 10px;
  overflow: auto;
  min-width: 0;
  min-height: 0;
  background: var(--agenthub-bg);
}
.agenthub-timeline-item {
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: start;
  background: var(--agenthub-surface);
  border-color: var(--agenthub-border);
  padding: 13px 14px;
}
.agenthub-timeline-line {
  grid-column: 1 / -1;
  display: block;
  color: var(--agenthub-text-secondary);
  overflow-wrap: anywhere;
  min-width: 0;
}
.agenthub-timeline-item[data-state="blocked"] { border-color: color-mix(in srgb, var(--agenthub-warning) 55%, var(--agenthub-border)); }
.agenthub-timeline-item[data-state="error"] { border-color: color-mix(in srgb, var(--agenthub-danger) 55%, var(--agenthub-border)); }
.agenthub-composer {
  border-top: 1px solid var(--agenthub-border);
  padding: 14px 16px;
  display: grid;
  gap: 10px;
  background: var(--agenthub-surface);
}
.agenthub-composer-toolbar, .agenthub-composer-footer, .agenthub-action-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  flex-wrap: wrap;
}
.agenthub-composer label {
  display: flex;
  align-items: center;
  gap: 10px;
  color: var(--agenthub-text-secondary);
}
.agenthub-composer textarea {
  width: 100%;
  min-height: 78px;
  resize: vertical;
  border: 1px solid var(--agenthub-border);
  border-radius: var(--agenthub-radius);
  padding: 11px 12px;
  background: var(--agenthub-surface-2);
  color: var(--agenthub-text);
  font: inherit;
}
.agenthub-composer select, .agenthub-workbench button {
  min-height: 30px;
  border: 1px solid var(--agenthub-border);
  border-radius: var(--agenthub-radius);
  background: var(--agenthub-surface);
  color: var(--agenthub-text);
  font: inherit;
}
.agenthub-workbench button { padding: 0 11px; }
.agenthub-workbench button:hover:not(:disabled) { background: var(--agenthub-surface-hover); }
.agenthub-workbench button:disabled, .agenthub-composer textarea:disabled, .agenthub-composer select:disabled {
  color: var(--agenthub-text-muted);
  background: var(--agenthub-surface-2);
}
.agenthub-icon-button {
  width: 32px;
  padding: 0 !important;
  display: inline-grid;
  place-items: center;
}
.agenthub-mode-label { color: var(--agenthub-text-secondary); font-size: 11px; }
.agenthub-warning { color: var(--agenthub-warning); }
.agenthub-inspector-body {
  padding: 16px;
  display: grid;
  gap: 16px;
  overflow: auto;
  max-height: calc(100dvh - 52px);
}
.agenthub-inspector-body h3, .agenthub-detail-section h4 { margin: 0; }
.agenthub-inspector-body h3 { font-size: 13px; font-weight: 650; }
.agenthub-detail-section {
  display: grid;
  gap: 9px;
  border-top: 1px solid var(--agenthub-border);
  padding-top: 13px;
}
.agenthub-detail-section dl {
  display: grid;
  grid-template-columns: 88px minmax(0, 1fr);
  gap: 8px 12px;
  margin: 0;
}
.agenthub-detail-section dt { color: var(--agenthub-text-muted); }
.agenthub-detail-section dd { margin: 0; min-width: 0; overflow-wrap: anywhere; }
.agenthub-detail-section code {
  font-family: var(--agenthub-mono);
  font-size: 12px;
  overflow-wrap: anywhere;
}
.agenthub-file-list {
  display: grid;
  gap: 7px;
  padding: 0;
  margin: 0;
  list-style: none;
}
.agenthub-file-list li {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 10px;
  border: 1px solid var(--agenthub-border);
  border-radius: var(--agenthub-radius);
  padding: 8px 10px;
}
.agenthub-file-list span {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-family: var(--agenthub-mono);
  font-size: 12px;
}
.agenthub-card {
  border: 1px solid var(--agenthub-border);
  border-radius: var(--agenthub-radius);
  padding: 12px;
  display: grid;
  gap: 10px;
  background: var(--agenthub-surface);
}
.agenthub-card header, .agenthub-card footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  flex-wrap: wrap;
}
.agenthub-state-panel {
  align-self: start;
  margin: 24px;
  padding: 16px;
  border: 1px solid var(--agenthub-border);
  border-radius: var(--agenthub-radius);
  background: var(--agenthub-surface);
  display: grid;
  gap: 8px;
}
.agenthub-fullscreen-diff {
  position: fixed;
  inset: 16px;
  z-index: 20;
  display: grid;
  grid-template-rows: auto 1fr;
  background: var(--agenthub-surface);
  border: 1px solid var(--agenthub-border-strong);
  border-radius: var(--agenthub-radius);
  box-shadow: 0 24px 70px rgba(0, 0, 0, 0.38);
  overflow: auto;
}
.agenthub-fullscreen-diff > header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  border-bottom: 1px solid var(--agenthub-border);
}
.agenthub-workbench[data-left-collapsed="true"][data-right-collapsed="true"] { grid-template-columns: minmax(0, 1fr); }
.agenthub-workbench[data-left-collapsed="true"][data-right-collapsed="false"] { grid-template-columns: minmax(0, 1fr) minmax(300px, 360px); }
.agenthub-workbench[data-left-collapsed="false"][data-right-collapsed="true"] { grid-template-columns: minmax(236px, 272px) minmax(0, 1fr); }
.agenthub-workbench[data-left-collapsed="true"] .agenthub-left-nav { display: none; }
.agenthub-workbench[data-right-collapsed="true"] .agenthub-inspector { display: none; }
.agenthub-sidebar-toggle {
  align-self: end;
}
.agenthub-workbench[data-layout="standard"] { grid-template-columns: minmax(220px, 260px) minmax(0, 1fr); }
.agenthub-workbench[data-layout="standard"] .agenthub-inspector { display: none; }
.agenthub-workbench[data-layout="standard"][data-left-collapsed="true"] { grid-template-columns: minmax(0, 1fr); }
.agenthub-workbench[data-layout="narrow"], .agenthub-workbench[data-layout="mobile-web"] { grid-template-columns: minmax(0, 1fr); }
.agenthub-workbench[data-layout="narrow"] .agenthub-inspector,
.agenthub-workbench[data-layout="narrow"] .agenthub-left-nav,
.agenthub-workbench[data-layout="mobile-web"] .agenthub-inspector,
.agenthub-workbench[data-layout="mobile-web"] .agenthub-left-nav { display: none; }
`;

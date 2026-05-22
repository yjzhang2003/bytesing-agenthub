import type {
  Agent,
  Artifact,
  DiffFileSummary,
  PermissionRequest,
  PermissionRisk,
  PermissionStatus,
  PlanStatus,
  Run,
  RuntimeDeviceStatus,
} from "@agenthub/contracts";

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

export interface InspectorSelection {
  readonly mode: InspectorMode;
  readonly id: string;
}

export interface TimelineItemViewModel {
  readonly id: string;
  readonly kind: TimelineItemKind;
  readonly title: string;
  readonly subtitle: string;
  readonly body: readonly string[];
  readonly state: WorkbenchVisualState;
  readonly authorKind?: "agent" | "user" | "system";
  readonly inspectorSelection?: InspectorSelection;
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

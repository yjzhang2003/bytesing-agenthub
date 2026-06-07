import type {
  Agent,
  Artifact,
  ClaudeCodeDiscoverySummary,
  ClaudeCodeRunOptions,
  CollaborationAgentAvailability,
  CollaborationProjectionStatus,
  DiffFileSummary,
  MemoryHealth,
  PermissionRequest,
  PermissionRisk,
  PermissionStatus,
  PlanStatus,
  ProviderHealth,
  Run,
  RuntimeDeviceStatus,
} from "@agenthub/contracts";

export type WorkbenchLayoutMode = "wide" | "standard" | "narrow" | "mobile-web";
export type AuthViewState =
  | { readonly status: "unauthenticated" }
  | { readonly status: "authenticating" }
  | { readonly status: "callback" }
  | { readonly status: "success"; readonly message: string }
  | { readonly status: "configuration-error"; readonly message: string }
  | { readonly status: "authenticated"; readonly userLabel?: string | undefined }
  | { readonly status: "error"; readonly message: string };
export type AuthFormMode = "sign-in" | "signup" | "forgot-password" | "reset-password";

export type EmailSignupViewResult =
  | { readonly status: "signed-in" }
  | { readonly status: "confirmation-required"; readonly email: string };

export interface ProductHomepageProps {
  readonly locale?: "en-US" | "zh-CN" | string | undefined;
  readonly onOpenLogin: () => void;
}

export interface LoginSurfaceProps {
  readonly authState: AuthViewState;
  readonly initialMode?: AuthFormMode | undefined;
  readonly locale?: "en-US" | "zh-CN" | string | undefined;
  readonly onOpenHomepage?: (() => void) | undefined;
  readonly onRetry?: (() => void) | undefined;
  readonly onRequestPasswordReset?:
    | ((input: { readonly email: string }) => Promise<void> | void)
    | undefined;
  readonly onSignInWithEmail?:
    | ((input: { readonly email: string; readonly password: string }) => Promise<void> | void)
    | undefined;
  readonly onSignInWithGitHub: () => void;
  readonly onSignUpWithEmail?:
    | ((input: {
        readonly email: string;
        readonly password: string;
      }) => Promise<EmailSignupViewResult> | EmailSignupViewResult)
    | undefined;
  readonly onUpdatePassword?:
    | ((input: { readonly password: string }) => Promise<void> | void)
    | undefined;
}

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

export type InspectorMode =
  | "empty"
  | "chat-info"
  | "conversation-agent"
  | "collaboration-status"
  | "plan"
  | "permission"
  | "diff"
  | "runtime"
  | "artifact"
  | "run";

export interface ConversationListItem {
  readonly id: string;
  readonly title: string;
  readonly avatarLabel: string;
  readonly participants: readonly string[];
  readonly pendingPermissions: number;
  readonly lastMessageAtLabel: string;
  readonly lastMessagePreview: string;
  readonly active: boolean;
  readonly pinned: boolean;
  readonly notificationsMuted: boolean;
  readonly unreadCount: number;
  readonly activeRunStatus?: Run["status"];
}

export interface ProjectContextViewModel {
  readonly id: string;
  readonly name: string;
  readonly pathLabel: string;
  readonly branchLabel: string | null;
  readonly runtimeStatus: RuntimeDeviceStatus;
  readonly runtimeLabel: string;
  readonly isDefault: boolean;
  readonly available: boolean;
}

export interface WorkspaceNavigationViewModel {
  readonly workspaceId: string;
  readonly workspaceName: string;
  readonly workspacePathLabel: string;
  readonly branchLabel: string;
  readonly runtimeStatus: RuntimeDeviceStatus;
  readonly runtimeLabel: string;
  readonly pendingPermissionCount: number;
  readonly unreadMessageCount: number;
  readonly conversations: readonly ConversationListItem[];
  readonly agents: readonly AgentTargetViewModel[];
  readonly runCount: number;
  readonly projects: readonly ProjectContextViewModel[];
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
  readonly providerHealth: ProviderHealth | null;
  readonly memoryHealth: MemoryHealth | null;
  readonly providerStatusLabel: string;
  readonly memoryStatusLabel: string;
  readonly claudeCodeDiscovery: ClaudeCodeDiscoverySummary | null;
}

export interface AgentTargetViewModel {
  readonly id: string;
  readonly label: string;
  readonly role: Agent["role"];
  readonly target: string;
  readonly runtimeProvider: AgentRuntimeProvider;
  readonly providerLabel: string;
  readonly capabilityTags: readonly string[];
  readonly claudeCodeControls?: ComposerClaudeCodeControls | null;
}

export type AgentRuntimeProvider = "claude-code" | "codex";

export interface ComposerTargetState {
  readonly selectedTarget: string;
  readonly selectedRole: Agent["role"];
  readonly modeLabel: string;
  readonly disabled: boolean;
  readonly disabledReason: string | null;
  readonly targets: readonly AgentTargetViewModel[];
  readonly claudeCodeControls: ComposerClaudeCodeControls | null;
}

export interface ComposerClaudeCodeControls {
  readonly permissionPreset: NonNullable<ClaudeCodeRunOptions["permissionPreset"]>;
  readonly runtimeProfileId: string;
  readonly mcpProfileId: string;
  readonly pluginProfileId?: string | null;
  readonly effort: NonNullable<ClaudeCodeRunOptions["effort"]>;
  readonly settingsSource: NonNullable<ClaudeCodeRunOptions["settingsSource"]>;
  readonly hooksPolicy: NonNullable<ClaudeCodeRunOptions["hooksPolicy"]>;
  readonly allowedTools?: readonly string[];
  readonly disallowedTools?: readonly string[];
}

export interface AgentPageAgentViewModel {
  readonly id: string;
  readonly label: string;
  readonly role: Agent["role"];
  readonly providerLabel: string;
  readonly runtimeProvider: AgentRuntimeProvider;
  readonly systemPrompt: string;
  readonly capabilityTags: readonly string[];
  readonly policyJson: string;
  readonly memoryNamespace: string;
  readonly defaultAgent: boolean;
  readonly claudeCodeDefaults: ComposerClaudeCodeControls | null;
  readonly highRiskClaudeCode: boolean;
  readonly hooksEnabled: boolean;
}

export interface AgentsPageViewModel {
  readonly agents: readonly AgentPageAgentViewModel[];
  readonly selectedAgentId: string | null;
}

export interface ProviderConnectionViewModel {
  readonly id: string;
  readonly label: string;
  readonly status: string;
  readonly statusTone: "connected" | "warning" | "disabled";
  readonly providerMode: string;
  readonly binaryPathLabel: string;
  readonly checkedAt: string;
  readonly failureReason: string | null;
  readonly comingSoon: boolean;
}

export type ConnectionItemKind = "runtime" | "provider" | "memory" | "future-provider";
export type ConnectionCheckTargetId = "runtime" | "provider" | "memory" | "claude-code";

export interface ConnectionMetadataRow {
  readonly label: string;
  readonly labelKey?: string;
  readonly value: string;
  readonly valueKey?: string;
}

export interface ConnectionSetupGuidance {
  readonly titleKey: string;
  readonly messageKey: string;
  readonly diagnostic: string | null;
}

export interface ConnectionDetailGroup {
  readonly id: string;
  readonly titleKey: string;
  readonly rows: readonly ConnectionMetadataRow[];
}

export interface ConnectionItemViewModel {
  readonly id: string;
  readonly kind: ConnectionItemKind;
  readonly label: string;
  readonly description: string;
  readonly status: string;
  readonly statusTone: "connected" | "warning" | "disabled";
  readonly checkedAt: string;
  readonly failureReason: string | null;
  readonly checkable: boolean;
  readonly checking: boolean;
  readonly disabledReason: string | null;
  readonly checkTarget: ConnectionCheckTargetId | null;
  readonly detailCheckTarget: ConnectionCheckTargetId | null;
  readonly detailCheckable: boolean;
  readonly detailChecking: boolean;
  readonly setupGuidance: ConnectionSetupGuidance | null;
  readonly metadata: readonly ConnectionMetadataRow[];
  readonly detailGroups: readonly ConnectionDetailGroup[];
}

export interface ConnectionsPageViewModel {
  readonly items: readonly ConnectionItemViewModel[];
  readonly checkableIds: readonly string[];
  readonly providers: readonly ProviderConnectionViewModel[];
  readonly memory: {
    readonly enabled: boolean;
    readonly status: string;
    readonly url: string;
    readonly viewerUrl: string;
    readonly checkedAt: string;
    readonly failureReason: string | null;
  };
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
  readonly state:
    | "metadata-only"
    | "loading-full-diff"
    | "available"
    | "offline"
    | "stale"
    | "cached"
    | "error";
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
  readonly failureCategory: "claude-code-auth-required" | "provider-failure" | null;
  readonly failureSummary: string | null;
  readonly claudeCodeProfileLabel: string | null;
  readonly claudeCodePermissionLabel: string | null;
  readonly claudeCodeMcpLabel: string | null;
  readonly claudeCodeEffortLabel: string | null;
  readonly claudeCodeSettingsLabel: string | null;
  readonly claudeCodeOverrideSource: string | null;
  readonly highRiskClaudeCode: boolean;
  readonly projectName: string | null;
  readonly projectPathLabel: string | null;
}

export interface ChatInfoParticipantViewModel extends AgentTargetViewModel {
  readonly initials: string;
}

export interface AgentInChatViewModel extends ChatInfoParticipantViewModel {
  readonly conversationId: string;
  readonly agentId: string;
  readonly globalLabel: string;
  readonly responsibility: string | null;
  readonly notes: string | null;
  readonly enabled: boolean;
  readonly participationMode: "manual" | "orchestrated" | "proactive";
  readonly priority: "low" | "normal" | "high";
  readonly quietMode: boolean;
  readonly contextScope: "conversation" | "workspace-summary" | "conversation-artifacts";
  readonly includeHistorySummary: boolean;
  readonly scopedInstructions: string | null;
  readonly requireRunConfirmation: boolean;
  readonly allowAutoDispatch: boolean;
  readonly globalSystemPrompt: string;
  readonly globalCapabilityTags: readonly string[];
  readonly globalRuntimeProvider: AgentRuntimeProvider;
}

export interface ChatInfoViewModel {
  readonly id: string;
  readonly title: string;
  readonly kind: "single-agent" | "group";
  readonly mutable: boolean;
  readonly workspaceName: string;
  readonly runtimeLabel: string;
  readonly createdAtLabel: string;
  readonly updatedAtLabel: string;
  readonly pinned: boolean;
  readonly notificationsMuted: boolean;
  readonly participantCount: number;
  readonly participants: readonly ChatInfoParticipantViewModel[];
  readonly availableAgents: readonly ChatInfoParticipantViewModel[];
  readonly project: ProjectContextViewModel | null;
  readonly announcement: string | null;
  readonly note: string | null;
}

export interface CollaborationAgentStatusRowViewModel {
  readonly agentId: string;
  readonly displayName: string;
  readonly availability: CollaborationAgentAvailability;
  readonly currentTaskId: string | null;
  readonly currentTaskTitle: string | null;
  readonly blockedQuestionCount: number;
  readonly stale: boolean;
}

export interface CollaborationOpenSpecLinkViewModel {
  readonly changeName: string;
  readonly artifactLabel: string;
  readonly projectionStatus: CollaborationProjectionStatus;
  readonly projectionStatusLabel: string;
}

export interface CollaborationPendingQuestionViewModel {
  readonly questionId: string;
  readonly requestingAgentId: string;
  readonly agentName: string;
  readonly taskId: string | null;
  readonly prompt: string;
  readonly createdAtLabel: string;
}

export interface CollaborationStatusInspectorViewModel {
  readonly id: string;
  readonly conversationId: string;
  readonly projectId: string | null;
  readonly state: "available" | "unavailable";
  readonly unavailableReason: string | null;
  readonly agents: readonly CollaborationAgentStatusRowViewModel[];
  readonly openSpecLinks: readonly CollaborationOpenSpecLinkViewModel[];
  readonly pendingUserQuestions: readonly CollaborationPendingQuestionViewModel[];
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
  readonly authorId?: string;
  readonly inspectorSelection?: InspectorSelection;
}

export interface WorkbenchViewModel {
  readonly workspace: WorkspaceNavigationViewModel;
  readonly runtime: RuntimeSummaryViewModel;
  readonly agentsPage: AgentsPageViewModel;
  readonly connections: ConnectionsPageViewModel;
  readonly timeline: readonly TimelineItemViewModel[];
  readonly composer: ComposerTargetState;
  readonly inspector: {
    readonly selection: InspectorSelection | null;
    readonly plan: PlanViewModel | null;
    readonly permissions: readonly PermissionViewModel[];
    readonly diff: DiffViewModel | null;
    readonly artifacts: readonly ArtifactViewModel[];
    readonly runs: readonly RunViewModel[];
    readonly chatInfo: ChatInfoViewModel | null;
    readonly collaborationStatus: CollaborationStatusInspectorViewModel | null;
    readonly agentInChat: AgentInChatViewModel | null;
    readonly agentInChatDetails: readonly AgentInChatViewModel[];
  };
  readonly states: readonly WorkbenchVisualState[];
  readonly activeConversationTitle: string;
  readonly activeProject: ProjectContextViewModel | null;
}

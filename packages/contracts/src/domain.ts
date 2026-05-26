export type Id = string;
export type ISODateTime = string;

export type RuntimeKind = "local" | "cloud";
export type RuntimeDeviceStatus = "online" | "offline" | "degraded" | "active-running";
export type AgentRole = "orchestrator" | "worker";
export type ProviderKind = "claude-code-local-process" | "mock" | "codex" | "opencode" | "custom";
export type ConversationKind = "single-agent" | "group";
export type MessageAuthorKind = "user" | "agent" | "system";
export type RunStatus =
  | "queued"
  | "running"
  | "streaming"
  | "blocked"
  | "cancelling"
  | "cancelled"
  | "completed"
  | "failed";
export type PlanStatus =
  | "draft"
  | "invalid"
  | "approved"
  | "revision-requested"
  | "cancelled"
  | "dispatched"
  | "completed"
  | "failed";
export type PermissionActionKind =
  | "file.read"
  | "file.write"
  | "file.delete"
  | "command.run"
  | "network.access"
  | "deploy.publish";
export type PermissionRisk = "low" | "medium" | "high";
export type PermissionStatus =
  | "pending"
  | "allowed-once"
  | "denied"
  | "expired"
  | "blocked"
  | "completed";
export type ArtifactType = "code" | "diff" | "file" | "web-preview" | "deployment" | "document";
export type CollaborationAgentAvailability =
  | "active"
  | "idle"
  | "blocked"
  | "stale"
  | "completed"
  | "failed"
  | "unavailable";
export type CollaborationAgentBackend =
  | "claude-code"
  | "codex"
  | "opencode"
  | "custom"
  | "unknown";
export type CollaborationMentionPurpose =
  | "discussion"
  | "task-handoff"
  | "review"
  | "status-nudge"
  | "user-question";
export type CollaborationTaskStatus =
  | "pending"
  | "in-progress"
  | "blocked"
  | "completed"
  | "failed"
  | "cancelled";
export type CollaborationHeartbeatStatus =
  | "idle"
  | "polling"
  | "executing"
  | "blocked"
  | "shutdown"
  | "unavailable";
export type CollaborationEventType =
  | "agent.joined"
  | "agent.removed"
  | "mention.recorded"
  | "task.created"
  | "task.claimed"
  | "task.blocked"
  | "task.completed"
  | "task.failed"
  | "question.created"
  | "question.answered"
  | "openspec.projected"
  | "openspec.projection_failed";
export type CollaborationOpenSpecArtifact = "proposal" | "design" | "tasks" | "spec";
export type CollaborationProjectionStatus =
  | "pending"
  | "projected"
  | "failed"
  | "skipped";

export interface UserOwned {
  readonly id: Id;
  readonly ownerUserId: Id;
  readonly createdAt: ISODateTime;
  readonly updatedAt: ISODateTime;
}

export interface Workspace extends UserOwned {
  readonly name: string;
  readonly runtimeKind: RuntimeKind;
  readonly runtimeDeviceId: Id | null;
  readonly localPath: string | null;
  readonly repoUrl: string | null;
  readonly defaultBranch: string | null;
}

export interface Project extends UserOwned {
  readonly workspaceId: Id;
  readonly name: string;
  readonly runtimeDeviceId: Id;
  readonly localPath: string | null;
  readonly localPathLabel: string;
  readonly repoUrl: string | null;
  readonly gitBranch: string | null;
  readonly gitBaseCommit: string | null;
  readonly dirty: boolean;
  readonly isDefault: boolean;
  readonly lastUsedAt: ISODateTime | null;
  readonly archivedAt: ISODateTime | null;
}

export interface RuntimeDevice extends UserOwned {
  readonly displayName: string;
  readonly platform: "macos" | "windows" | "linux" | "cloud";
  readonly appVersion: string;
  readonly status: RuntimeDeviceStatus;
  readonly capabilities: readonly string[];
  readonly lastHeartbeatAt: ISODateTime | null;
}

export interface Provider extends UserOwned {
  readonly kind: ProviderKind;
  readonly displayName: string;
  readonly config: Record<string, unknown>;
}

export interface Agent extends UserOwned {
  readonly providerId: Id;
  readonly workspaceId: Id;
  readonly displayName: string;
  readonly role: AgentRole;
  readonly systemPrompt: string;
  readonly capabilityTags: readonly string[];
  readonly policy: Record<string, unknown>;
}

export interface Conversation extends UserOwned {
  readonly workspaceId: Id;
  readonly projectId: Id | null;
  readonly kind: ConversationKind;
  readonly title: string;
  readonly pinnedAt: ISODateTime | null;
  readonly notificationsMuted: boolean;
  readonly archivedAt: ISODateTime | null;
}

export interface ConversationParticipant extends UserOwned {
  readonly conversationId: Id;
  readonly agentId: Id;
  readonly addedByUserId: Id | null;
  readonly archivedAt: ISODateTime | null;
  readonly conversationAgentSettings?: ConversationAgentSettings | undefined;
}

export interface ConversationAgentSettings {
  readonly displayNameOverride?: string | undefined;
  readonly responsibilityOverride?: string | undefined;
  readonly notes?: string | undefined;
  readonly enabled?: boolean | undefined;
  readonly participationMode?: "manual" | "orchestrated" | "proactive" | undefined;
  readonly priority?: "low" | "normal" | "high" | undefined;
  readonly quietMode?: boolean | undefined;
  readonly contextScope?:
    | "conversation"
    | "workspace-summary"
    | "conversation-artifacts"
    | undefined;
  readonly includeHistorySummary?: boolean | undefined;
  readonly scopedInstructions?: string | undefined;
  readonly requireRunConfirmation?: boolean | undefined;
  readonly allowAutoDispatch?: boolean | undefined;
}

export interface CollaborationAgentRosterEntry extends UserOwned {
  readonly workspaceId: Id;
  readonly projectId: Id;
  readonly conversationId: Id;
  readonly agentId: Id;
  readonly displayName: string;
  readonly role: AgentRole;
  readonly capabilities: readonly string[];
  readonly backend: CollaborationAgentBackend;
  readonly availability: CollaborationAgentAvailability;
  readonly currentTaskId: Id | null;
  readonly removedAt: ISODateTime | null;
}

export interface CollaborationMentionMessage {
  readonly id: Id;
  readonly ownerUserId: Id;
  readonly workspaceId: Id;
  readonly projectId: Id;
  readonly conversationId: Id;
  readonly fromKind: MessageAuthorKind;
  readonly fromId: Id;
  readonly toKind: "agent" | "user";
  readonly toId: Id;
  readonly purpose: CollaborationMentionPurpose;
  readonly content: string;
  readonly taskId: Id | null;
  readonly questionId: Id | null;
  readonly createdAt: ISODateTime;
}

export interface CollaborationTaskClaim {
  readonly token: Id;
  readonly agentId: Id;
  readonly leasedUntil: ISODateTime;
}

export interface CollaborationTask extends UserOwned {
  readonly workspaceId: Id;
  readonly projectId: Id;
  readonly conversationId: Id;
  readonly title: string;
  readonly description: string;
  readonly status: CollaborationTaskStatus;
  readonly assignedAgentId: Id;
  readonly claim: CollaborationTaskClaim | null;
  readonly version: number;
  readonly blockedByQuestionIds: readonly Id[];
  readonly openspecChangeName: string | null;
  readonly resultSummary: string | null;
  readonly failureReason: string | null;
}

export interface CollaborationUserQuestion extends UserOwned {
  readonly workspaceId: Id;
  readonly projectId: Id;
  readonly conversationId: Id;
  readonly requestingAgentId: Id;
  readonly taskId: Id | null;
  readonly status: "pending" | "answered" | "cancelled";
  readonly prompt: string;
  readonly answer: string | null;
  readonly answeredAt: ISODateTime | null;
}

export interface CollaborationHeartbeat {
  readonly id: Id;
  readonly ownerUserId: Id;
  readonly workspaceId: Id;
  readonly projectId: Id;
  readonly conversationId: Id;
  readonly agentId: Id;
  readonly status: CollaborationHeartbeatStatus;
  readonly currentTaskId: Id | null;
  readonly lastSeenAt: ISODateTime;
}

export interface CollaborationEvent {
  readonly id: Id;
  readonly ownerUserId: Id;
  readonly workspaceId: Id;
  readonly projectId: Id;
  readonly conversationId: Id;
  readonly type: CollaborationEventType;
  readonly agentId: Id | null;
  readonly taskId: Id | null;
  readonly questionId: Id | null;
  readonly openspecChangeName: string | null;
  readonly payload: Record<string, unknown>;
  readonly createdAt: ISODateTime;
}

export interface CollaborationOpenSpecLink extends UserOwned {
  readonly workspaceId: Id;
  readonly projectId: Id;
  readonly conversationId: Id;
  readonly openspecChangeName: string;
  readonly artifact: CollaborationOpenSpecArtifact;
  readonly artifactPath: string;
  readonly collaborationTaskId: Id | null;
  readonly decisionId: Id | null;
  readonly projectionStatus: CollaborationProjectionStatus;
  readonly lastProjectedAt: ISODateTime | null;
}

export interface CollaborationAgentStatusSummary {
  readonly agentId: Id;
  readonly displayName: string;
  readonly availability: CollaborationAgentAvailability;
  readonly currentTaskId: Id | null;
  readonly currentTaskTitle: string | null;
  readonly blockedQuestionCount: number;
  readonly stale: boolean;
}

export interface CollaborationOpenSpecLinkSummary {
  readonly changeName: string;
  readonly artifact: CollaborationOpenSpecArtifact;
  readonly projectionStatus: CollaborationProjectionStatus;
}

export interface CollaborationPendingUserQuestionSummary {
  readonly questionId: Id;
  readonly requestingAgentId: Id;
  readonly taskId: Id | null;
  readonly prompt: string;
  readonly createdAt: ISODateTime;
}

export interface CollaborationStatusSummary {
  readonly conversationId: Id;
  readonly projectId: Id | null;
  readonly state: "available" | "unavailable";
  readonly agents: readonly CollaborationAgentStatusSummary[];
  readonly openSpecLinks: readonly CollaborationOpenSpecLinkSummary[];
  readonly pendingUserQuestions: readonly CollaborationPendingUserQuestionSummary[];
  readonly unavailableReason?: string | undefined;
}

export interface MessagePart {
  readonly type: "text" | "markdown" | "code" | "artifact-ref" | "run-event";
  readonly text?: string;
  readonly language?: string;
  readonly artifactId?: Id;
  readonly runId?: Id;
}

export interface Message extends UserOwned {
  readonly conversationId: Id;
  readonly authorKind: MessageAuthorKind;
  readonly authorId: Id;
  readonly parts: readonly MessagePart[];
  readonly replyToMessageId: Id | null;
}

export interface Run extends UserOwned {
  readonly workspaceId: Id;
  readonly projectId: Id | null;
  readonly conversationId: Id;
  readonly agentId: Id;
  readonly planId: Id | null;
  readonly status: RunStatus;
  readonly startedAt: ISODateTime | null;
  readonly completedAt: ISODateTime | null;
  readonly failureReason: string | null;
  readonly claudeCode?: RunClaudeCodeMetadata | undefined;
}

export interface RunClaudeCodeMetadata {
  readonly permissionPreset?: "plan-only" | "ask-first" | "auto-edits" | "full-access";
  readonly settingsSource?: "inherit" | "managed" | "isolated";
  readonly runtimeProfileId?: Id | null;
  readonly mcpProfileId?: Id | null;
  readonly pluginProfileId?: Id | null;
  readonly hooksPolicy?: "inherit" | "disabled" | "enabled";
  readonly allowedTools?: readonly string[];
  readonly disallowedTools?: readonly string[];
  readonly effort?: "low" | "medium" | "high" | "xhigh" | "max";
  readonly session?: {
    readonly behavior: "new" | "continue" | "fork";
    readonly sessionId?: Id | null;
  };
  readonly overrideSource: "agent-default" | "run-override";
  readonly effectivePermissionPreset?: "plan-only" | "ask-first" | "auto-edits" | "full-access";
  readonly effectiveSettingsSource?: "inherit" | "managed" | "isolated";
}

export interface PermissionRequest extends UserOwned {
  readonly workspaceId: Id;
  readonly conversationId: Id;
  readonly runId: Id;
  readonly agentId: Id;
  readonly actionKind: PermissionActionKind;
  readonly risk: PermissionRisk;
  readonly status: PermissionStatus;
  readonly summary: string;
  readonly command: string | null;
  readonly paths: readonly string[];
  readonly decidedAt: ISODateTime | null;
}

export interface Artifact extends UserOwned {
  readonly workspaceId: Id;
  readonly conversationId: Id;
  readonly runId: Id;
  readonly type: ArtifactType;
  readonly title: string;
  readonly summary: string;
  readonly metadata: Record<string, unknown>;
}

export interface DiffMetadata {
  readonly workspaceId: Id;
  readonly runId: Id;
  readonly baseCommit: string | null;
  readonly workingTreeFingerprint: string;
  readonly changedFiles: readonly DiffFileSummary[];
  readonly cacheExpiresAt: ISODateTime | null;
}

export interface DiffFileSummary {
  readonly path: string;
  readonly status: "added" | "modified" | "deleted" | "renamed";
  readonly insertions: number;
  readonly deletions: number;
}

export interface AuditLog extends UserOwned {
  readonly workspaceId: Id | null;
  readonly conversationId: Id | null;
  readonly runId: Id | null;
  readonly agentId: Id | null;
  readonly eventType: string;
  readonly payload: Record<string, unknown>;
}

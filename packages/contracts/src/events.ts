import type {
  Artifact,
  Conversation,
  DiffMetadata,
  Id,
  ISODateTime,
  PermissionRequest,
  PlanStatus,
  RunStatus,
} from "./domain.js";

export type AgentHubEventType =
  | "runtime.device.status_changed"
  | "agent.run.started"
  | "agent.run.message_delta"
  | "agent.run.status_changed"
  | "agent.run.completed"
  | "agent.run.failed"
  | "dispatch.plan.created"
  | "dispatch.plan.status_changed"
  | "agent.task.assigned"
  | "permission.requested"
  | "permission.status_changed"
  | "artifact.created"
  | "artifact.updated"
  | "diff.metadata.updated"
  | "conversation.updated"
  | "conversation.membership_changed";

export interface AgentHubEventBase {
  readonly id: Id;
  readonly type: AgentHubEventType;
  readonly ownerUserId: Id;
  readonly workspaceId: Id | null;
  readonly conversationId: Id | null;
  readonly runId: Id | null;
  readonly occurredAt: ISODateTime;
}

export interface RuntimeDeviceStatusChangedEvent extends AgentHubEventBase {
  readonly type: "runtime.device.status_changed";
  readonly payload: {
    readonly runtimeDeviceId: Id;
    readonly status: "online" | "offline" | "degraded" | "active-running";
  };
}

export interface AgentRunStatusEvent extends AgentHubEventBase {
  readonly type:
    | "agent.run.started"
    | "agent.run.status_changed"
    | "agent.run.completed"
    | "agent.run.failed";
  readonly payload: {
    readonly status: RunStatus;
    readonly agentId: Id;
    readonly message?: string;
    readonly exitCode?: number;
    readonly stderr?: string;
  };
}

export interface AgentRunMessageDeltaEvent extends AgentHubEventBase {
  readonly type: "agent.run.message_delta";
  readonly payload: {
    readonly agentId: Id;
    readonly delta: string;
  };
}

export interface DispatchPlanEvent extends AgentHubEventBase {
  readonly type: "dispatch.plan.created" | "dispatch.plan.status_changed";
  readonly payload: {
    readonly planId: Id;
    readonly status: PlanStatus;
  };
}

export interface AgentTaskAssignedEvent extends AgentHubEventBase {
  readonly type: "agent.task.assigned";
  readonly payload: {
    readonly planId: Id;
    readonly stepId: Id;
    readonly agentId: Id;
    readonly runId: Id;
  };
}

export interface PermissionEvent extends AgentHubEventBase {
  readonly type: "permission.requested" | "permission.status_changed";
  readonly payload: PermissionRequest;
}

export interface ArtifactEvent extends AgentHubEventBase {
  readonly type: "artifact.created" | "artifact.updated";
  readonly payload: Artifact;
}

export interface DiffMetadataUpdatedEvent extends AgentHubEventBase {
  readonly type: "diff.metadata.updated";
  readonly payload: DiffMetadata;
}

export interface ConversationMembershipChangedEvent extends AgentHubEventBase {
  readonly type: "conversation.membership_changed";
  readonly payload: {
    readonly agentId: Id;
    readonly action: "added" | "removed";
  };
}

export interface ConversationUpdatedEvent extends AgentHubEventBase {
  readonly type: "conversation.updated";
  readonly payload: Conversation;
}

export type AgentHubEvent =
  | RuntimeDeviceStatusChangedEvent
  | AgentRunStatusEvent
  | AgentRunMessageDeltaEvent
  | DispatchPlanEvent
  | AgentTaskAssignedEvent
  | PermissionEvent
  | ArtifactEvent
  | DiffMetadataUpdatedEvent
  | ConversationUpdatedEvent
  | ConversationMembershipChangedEvent;

import type {
  Agent,
  AgentHubEvent,
  AgentHubClientState,
  Conversation,
  CreateLocalRunRequest,
  Message,
  PermissionRequest,
  Run,
  RuntimeDevice,
  WorkbenchSnapshot,
  Workspace,
} from "@agenthub/contracts";
import { emptyAgentHubClientState } from "@agenthub/contracts";

export interface DemoWorkspaceFlow {
  readonly state: AgentHubClientState;
  readonly activeWorkspace: Workspace;
  readonly activeConversation: Conversation;
}

const now = "2026-05-21T00:00:00.000Z";

export function createDemoWorkspaceFlow(): DemoWorkspaceFlow {
  const workspace: Workspace = {
    id: "workspace_1",
    ownerUserId: "user_1",
    name: "AgentHub Demo",
    runtimeKind: "local",
    runtimeDeviceId: "runtime_1",
    localPath: "/Users/chihayaanon/IdeaProjects/agenthub",
    repoUrl: null,
    defaultBranch: "main",
    createdAt: now,
    updatedAt: now,
  };
  const runtime: RuntimeDevice = {
    id: "runtime_1",
    ownerUserId: "user_1",
    displayName: "Local Mac Desktop Runtime",
    platform: "macos",
    appVersion: "0.1.0",
    status: "online",
    capabilities: ["claude-code-local-process", "git-diff", "permissions"],
    lastHeartbeatAt: now,
    createdAt: now,
    updatedAt: now,
  };
  const agents: Agent[] = ["Orchestrator", "Implementer", "Reviewer"].map((displayName, index) => ({
    id: `agent_${index + 1}`,
    ownerUserId: "user_1",
    workspaceId: workspace.id,
    providerId: "provider_1",
    displayName,
    role: displayName === "Orchestrator" ? "orchestrator" : "worker",
    systemPrompt: `${displayName} agent`,
    capabilityTags: displayName === "Orchestrator" ? ["planning"] : ["code", "review"],
    policy: {},
    createdAt: now,
    updatedAt: now,
  }));
  const conversation: Conversation = {
    id: "conversation_1",
    ownerUserId: "user_1",
    workspaceId: workspace.id,
    kind: "group",
    title: "AgentHub demo group chat",
    archivedAt: null,
    createdAt: now,
    updatedAt: now,
  };
  const permission: PermissionRequest = {
    id: "permission_1",
    ownerUserId: "user_1",
    workspaceId: workspace.id,
    conversationId: conversation.id,
    runId: "run_1",
    agentId: "agent_2",
    actionKind: "command.run",
    risk: "high",
    status: "pending",
    summary: "Run pnpm check",
    command: "pnpm check",
    paths: [],
    decidedAt: null,
    createdAt: now,
    updatedAt: now,
  };

  const state: AgentHubClientState = {
    ...emptyAgentHubClientState,
    activeDiff: {
      runId: "run_1",
      files: [{ path: "packages/ui/src/index.tsx", status: "modified", insertions: 24, deletions: 3 }],
    },
    activePlan: {
      id: "plan_1",
      conversationId: conversation.id,
      workspaceId: workspace.id,
      goal: "Implement AgentHub foundation",
      assumptions: ["Desktop Runtime is online"],
      status: "draft",
      steps: [
        {
          id: "step_1",
          title: "Build foundation",
          assignedAgentId: "agent_2",
          dependsOnStepIds: [],
          expectedArtifacts: ["diff"],
          riskNotes: ["Requires command permission"],
        },
      ],
    },
    activeWorkspaceId: workspace.id,
    agents,
    authenticated: true,
    conversations: [conversation],
    pendingPermissions: [permission],
    runtimeDevices: [runtime],
    workspaces: [workspace],
  };

  return {
    activeConversation: conversation,
    activeWorkspace: workspace,
    state,
  };
}

export function createRunRequestFromSnapshot(
  snapshot: Pick<AgentHubClientState, "activeWorkspaceId" | "agents" | "conversations"> & {
    readonly activeConversationId?: string | null;
  },
  target: string | undefined,
  prompt: string,
): CreateLocalRunRequest {
  const normalizedTarget = target?.replace(/^@/, "").toLowerCase();
  const selectedAgent =
    snapshot.agents.find(
      (agent) =>
        agent.id === target ||
        agent.displayName.toLowerCase() === normalizedTarget ||
        `@${agent.displayName}`.toLowerCase() === target?.toLowerCase(),
    ) ??
    snapshot.agents.find((agent) => agent.role === "worker") ??
    snapshot.agents[0];

  if (!snapshot.activeWorkspaceId) {
    throw new Error("No active workspace is available");
  }
  const activeConversationId =
    snapshot.activeConversationId ?? snapshot.conversations.find((conversation) => !conversation.archivedAt)?.id;
  if (!activeConversationId) {
    throw new Error("No active conversation is available");
  }
  if (!selectedAgent) {
    throw new Error("No runnable agent is available");
  }

  return {
    workspaceId: snapshot.activeWorkspaceId,
    conversationId: activeConversationId,
    agentId: selectedAgent.id,
    prompt,
  };
}

export function applyAgentHubEventToSnapshot(
  snapshot: WorkbenchSnapshot,
  event: AgentHubEvent,
): WorkbenchSnapshot {
  if (event.ownerUserId !== snapshot.userId) {
    return snapshot;
  }
  if (event.type === "runtime.device.status_changed") {
    return {
      ...snapshot,
      runtimeDevices: snapshot.runtimeDevices.map((runtime) =>
        runtime.id === event.payload.runtimeDeviceId
          ? {
              ...runtime,
              status: event.payload.status,
              updatedAt: event.occurredAt,
            }
          : runtime,
      ),
    };
  }
  if (
    event.type === "agent.run.status_changed" ||
    event.type === "agent.run.completed" ||
    event.type === "agent.run.failed"
  ) {
    return {
      ...snapshot,
      runs: snapshot.runs.map((run) =>
        run.id === event.runId
          ? updateRunFromStatusEvent(run, event.payload.status, event.payload.message ?? null, event.occurredAt)
          : run,
      ),
    };
  }
  if (event.type === "agent.run.message_delta") {
    const existing = snapshot.messages.find(
      (message) =>
        message.authorKind === "agent" &&
        message.authorId === event.payload.agentId &&
        message.parts.some((part) => part.runId === event.runId),
    );
    const message: Message = existing
      ? {
          ...existing,
          parts: existing.parts.map((part, index) =>
            index === 0
              ? { ...part, text: `${part.text ?? ""}${event.payload.delta}` }
              : part,
          ),
          updatedAt: event.occurredAt,
        }
      : {
          id: event.id,
          ownerUserId: event.ownerUserId,
          conversationId: event.conversationId ?? snapshot.activeConversationId,
          authorKind: "agent",
          authorId: event.payload.agentId,
          parts: [
            {
              type: "markdown",
              text: event.payload.delta,
              ...(event.runId ? { runId: event.runId } : {}),
            },
          ],
          replyToMessageId: null,
          createdAt: event.occurredAt,
          updatedAt: event.occurredAt,
        };
    return {
      ...snapshot,
      messages: existing
        ? snapshot.messages.map((candidate) => (candidate.id === existing.id ? message : candidate))
        : [...snapshot.messages, message],
    };
  }
  return snapshot;
}

function updateRunFromStatusEvent(
  run: Run,
  status: Run["status"],
  message: string | null,
  occurredAt: string,
): Run {
  const startedAt = run.startedAt ?? (status === "running" || status === "streaming" ? occurredAt : null);
  const completedAt =
    status === "completed" || status === "failed" || status === "cancelled" ? occurredAt : run.completedAt;
  return {
    ...run,
    status,
    startedAt,
    completedAt,
    failureReason: status === "failed" || status === "cancelled" ? message : run.failureReason,
    updatedAt: occurredAt,
  };
}

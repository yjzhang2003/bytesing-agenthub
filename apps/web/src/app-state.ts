import type {
  Agent,
  AgentHubClientState,
  Conversation,
  PermissionRequest,
  RuntimeDevice,
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


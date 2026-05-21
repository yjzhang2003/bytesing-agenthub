import type {
  Agent,
  Conversation,
  Id,
  ISODateTime,
  Message,
  RuntimeDevice,
  Run,
  Workspace,
} from "./domain.js";

export type AgentHubAuthMode = "local-demo" | "supabase";
export type AgentHubProviderMode = "smoke" | "claude-code";

export interface ServiceHealth {
  readonly ok: boolean;
  readonly service: string;
  readonly version: string;
  readonly mode: AgentHubAuthMode;
  readonly timestamp: ISODateTime;
  readonly runtime?: {
    readonly online: boolean;
    readonly deviceId: Id | null;
    readonly lastHeartbeatAt: ISODateTime | null;
    readonly capabilities: readonly string[];
  };
}

export interface WorkspaceMetadata {
  readonly workspaceId: Id;
  readonly displayName: string;
  readonly localPathLabel: string;
  readonly gitBranch: string | null;
  readonly gitBaseCommit: string | null;
  readonly dirty: boolean;
  readonly providerCapabilities: readonly string[];
}

export interface RuntimeRegistrationPayload {
  readonly deviceId?: Id;
  readonly displayName: string;
  readonly platform: RuntimeDevice["platform"];
  readonly appVersion: string;
  readonly capabilities: readonly string[];
  readonly workspace: WorkspaceMetadata;
}

export interface RuntimeHeartbeatPayload {
  readonly runtimeDeviceId: Id;
}

export interface WorkbenchSnapshot {
  readonly authenticated: boolean;
  readonly userId: Id;
  readonly activeWorkspaceId: Id;
  readonly activeConversationId: Id;
  readonly workspaces: readonly Workspace[];
  readonly runtimeDevices: readonly RuntimeDevice[];
  readonly workspaceMetadata: WorkspaceMetadata | null;
  readonly conversations: readonly Conversation[];
  readonly agents: readonly Agent[];
  readonly runs: readonly Run[];
  readonly messages: readonly Message[];
  readonly availableActions: readonly string[];
}

export interface CreateLocalRunRequest {
  readonly workspaceId: Id;
  readonly conversationId: Id;
  readonly agentId: Id;
  readonly prompt: string;
  readonly planId?: Id | null;
}

export type RuntimeCommand =
  | {
      readonly id: Id;
      readonly type: "run.start";
      readonly runtimeDeviceId: Id;
      readonly createdAt: ISODateTime;
      readonly payload: {
        readonly runId: Id;
        readonly workspaceId: Id;
        readonly conversationId: Id;
        readonly agentId: Id;
        readonly workspacePath: string;
        readonly prompt: string;
        readonly systemPrompt: string;
        readonly providerMode: AgentHubProviderMode;
      };
    }
  | {
      readonly id: Id;
      readonly type: "run.cancel";
      readonly runtimeDeviceId: Id;
      readonly createdAt: ISODateTime;
      readonly payload: {
        readonly runId: Id;
      };
    };

export const agentHubLocalDefaults = {
  authToken: "agenthub-local-demo-token",
  controlPlanePort: 4310,
  desktopWebUrl: "http://127.0.0.1:5173",
  runtimeDeviceId: "runtime_local_demo",
  runtimeDeviceName: "AgentHub Desktop Runtime",
  userId: "user_local_demo",
  workspaceId: "workspace_local_demo",
  conversationId: "conversation_local_demo",
  implementerAgentId: "agent_implementer",
  orchestratorAgentId: "agent_orchestrator",
} as const;

export const agentHubApiPaths = {
  health: "/health",
  events: "/events",
  workbenchSnapshot: "/workbench/snapshot",
  runtimeRegister: "/runtime/register",
  runtimeHeartbeat: "/runtime/heartbeat",
  runtimeOffline: "/runtime/offline",
  runtimeCommands: "/runtime/commands",
  runtimeEvents: "/runtime/events",
  runs: "/runs",
} as const;

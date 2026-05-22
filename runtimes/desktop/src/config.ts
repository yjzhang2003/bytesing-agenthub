import {
  agentHubLocalDefaults,
  type AgentHubProviderMode,
  type MemoryHealth,
  type ProviderHealth,
  type RuntimeRegistrationPayload,
} from "@agenthub/contracts";
import { readWorkspaceGitMetadata } from "./git.js";

export interface DesktopRuntimeProcessConfig {
  readonly appVersion: string;
  readonly authToken: string;
  readonly controlPlaneUrl: string;
  readonly deviceId: string;
  readonly deviceName: string;
  readonly heartbeatSeconds: number;
  readonly pollSeconds: number;
  readonly providerMode: AgentHubProviderMode;
  readonly claudeCodeBin: string;
  readonly agentMemory: {
    readonly enabled: boolean;
    readonly url: string;
    readonly viewerUrl: string;
    readonly timeoutMs: number;
    readonly secret?: string;
  };
  readonly workspacePath: string;
  readonly workspaceName: string;
}

export function readDesktopRuntimeConfig(
  env: NodeJS.ProcessEnv = process.env,
): DesktopRuntimeProcessConfig {
  return {
    appVersion: env.AGENTHUB_RUNTIME_VERSION ?? "0.1.0",
    authToken: env.AGENTHUB_LOCAL_AUTH_TOKEN ?? agentHubLocalDefaults.authToken,
    controlPlaneUrl:
      env.AGENTHUB_CONTROL_PLANE_URL ??
      `http://127.0.0.1:${agentHubLocalDefaults.controlPlanePort}`,
    deviceId: env.AGENTHUB_RUNTIME_DEVICE_ID ?? agentHubLocalDefaults.runtimeDeviceId,
    deviceName: env.AGENTHUB_RUNTIME_DEVICE_NAME ?? agentHubLocalDefaults.runtimeDeviceName,
    heartbeatSeconds: Number.parseInt(env.AGENTHUB_RUNTIME_HEARTBEAT_SECONDS ?? "15", 10),
    pollSeconds: Number.parseInt(env.AGENTHUB_RUNTIME_POLL_SECONDS ?? "2", 10),
    providerMode: env.AGENTHUB_PROVIDER_MODE === "claude-code" ? "claude-code" : "smoke",
    claudeCodeBin: env.AGENTHUB_CLAUDE_CODE_BIN ?? "claude",
    agentMemory: {
      enabled: env.AGENTMEMORY_ENABLED === "1" || env.AGENTMEMORY_ENABLED === "true",
      url: env.AGENTMEMORY_URL ?? "http://127.0.0.1:3111",
      viewerUrl: env.AGENTMEMORY_VIEWER_URL ?? "http://127.0.0.1:3113",
      timeoutMs: Number.parseInt(env.AGENTMEMORY_TIMEOUT_MS ?? "1000", 10),
      ...(env.AGENTMEMORY_SECRET ? { secret: env.AGENTMEMORY_SECRET } : {}),
    },
    workspacePath: env.AGENTHUB_WORKSPACE_PATH ?? process.cwd(),
    workspaceName: env.AGENTHUB_WORKSPACE_NAME ?? "AgentHub",
  };
}

export async function createRuntimeRegistrationPayload(
  config: DesktopRuntimeProcessConfig,
  health: {
    readonly providerHealth?: ProviderHealth;
    readonly memoryHealth?: MemoryHealth;
  } = {},
): Promise<RuntimeRegistrationPayload> {
  const git = await readWorkspaceGitMetadata(config.workspacePath);
  const providerCapabilities =
    config.providerMode === "claude-code"
      ? ["provider:claude-code", "git:metadata", "git:diff"]
      : ["provider:smoke", "git:metadata", "git:diff"];

  return {
    deviceId: config.deviceId,
    displayName: config.deviceName,
    platform: process.platform === "darwin" ? "macos" : process.platform === "win32" ? "windows" : "linux",
    appVersion: config.appVersion,
    capabilities: providerCapabilities,
    ...(health.providerHealth ? { providerHealth: health.providerHealth } : {}),
    ...(health.memoryHealth ? { memoryHealth: health.memoryHealth } : {}),
    workspace: {
      workspaceId: agentHubLocalDefaults.workspaceId,
      displayName: config.workspaceName,
      localPathLabel: config.workspacePath,
      gitBranch: git.branch,
      gitBaseCommit: git.baseCommit,
      dirty: git.dirty,
      providerCapabilities,
    },
  };
}

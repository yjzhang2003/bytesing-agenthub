import type {
  DesktopProjectRegistration,
  ProviderHealth,
  ProviderRuntimeEvent,
  ClaudeCodeDiscoverySummary,
  RuntimeConnectionCheckResult,
  RuntimeCommand,
  RuntimeRegistrationPayload,
} from "@agenthub/contracts";
import { mkdir, stat } from "node:fs/promises";
import { basename, dirname, join } from "node:path";
import { homedir } from "node:os";
import type { AgentMemoryRuntimeClient } from "./agent-memory-client.js";
import { DesktopRuntimeControlPlaneClient } from "./control-plane-client.js";
import { readWorkspaceGitMetadata, type WorkspaceGitMetadata } from "./git.js";
import type { AgentRunHandle, AgentRunRequest, ProviderAdapter } from "./provider-adapter.js";
import { materializeClaudeCodeProfile } from "./claude-code-profile.js";

export interface DesktopRuntimeConfig {
  readonly deviceName: string;
  readonly controlPlaneUrl: string;
  readonly authToken: string;
  readonly heartbeatSeconds: number;
  readonly defaultProjectPath?: string;
  readonly claudeCode?: {
    readonly profileRoot: string;
    readonly pluginDirs: readonly string[];
  };
}

export interface LocalWorkspaceRegistration {
  readonly id: string;
  readonly displayName: string;
  readonly localPath: string;
  readonly git: WorkspaceGitMetadata;
}

export type LocalProjectRegistration = DesktopProjectRegistration;

export class DesktopRuntime {
  readonly #config: DesktopRuntimeConfig;
  readonly #client: DesktopRuntimeControlPlaneClient;
  readonly #adapters = new Map<string, ProviderAdapter>();
  readonly #activeRuns = new Map<string, AgentRunHandle>();
  readonly #memoryClient: AgentMemoryRuntimeClient | null;
  readonly #checkProviderHealth: (() => Promise<ProviderHealth>) | null;
  readonly #discoverClaudeCode: (() => Promise<ClaudeCodeDiscoverySummary>) | null;

  constructor(
    config: DesktopRuntimeConfig,
    adapters: readonly ProviderAdapter[],
    options: {
      readonly memoryClient?: AgentMemoryRuntimeClient | null;
      readonly checkProviderHealth?: (() => Promise<ProviderHealth>) | null;
      readonly discoverClaudeCode?: (() => Promise<ClaudeCodeDiscoverySummary>) | null;
    } = {},
  ) {
    this.#config = config;
    this.#client = new DesktopRuntimeControlPlaneClient({
      authToken: config.authToken,
      baseUrl: config.controlPlaneUrl,
    });
    this.#memoryClient = options.memoryClient ?? null;
    this.#checkProviderHealth = options.checkProviderHealth ?? null;
    this.#discoverClaudeCode = options.discoverClaudeCode ?? null;
    for (const adapter of adapters) {
      this.#adapters.set(adapter.kind, adapter);
    }
  }

  get config(): DesktopRuntimeConfig {
    return this.#config;
  }

  async registerDevice(input: {
    readonly platform: "macos" | "windows" | "linux" | "cloud";
    readonly appVersion: string;
    readonly capabilities: readonly string[];
    readonly workspace: RuntimeRegistrationPayload["workspace"];
    readonly deviceId?: string;
  }) {
    return this.#client.registerDevice({
      displayName: this.#config.deviceName,
      ...input,
      ...(input.deviceId ? { deviceId: input.deviceId } : {}),
    });
  }

  async sendHeartbeat(runtimeDeviceId: string) {
    return this.#client.sendHeartbeat(runtimeDeviceId);
  }

  async markOffline(runtimeDeviceId: string) {
    return this.#client.markOffline(runtimeDeviceId);
  }

  async registerLocalWorkspace(input: {
    readonly id: string;
    readonly displayName: string;
    readonly localPath: string;
  }): Promise<LocalWorkspaceRegistration> {
    return {
      ...input,
      git: await readWorkspaceGitMetadata(input.localPath),
    };
  }

  async registerLocalProject(input: {
    readonly runtimeDeviceId: string;
    readonly localPath: string;
    readonly displayName?: string;
    readonly source?: "desktop-directory" | "desktop-default";
  }): Promise<LocalProjectRegistration> {
    const directory = await ensureReadableDirectory(input.localPath);
    const git = await readWorkspaceGitMetadata(directory);
    return {
      source: input.source ?? "desktop-directory",
      runtimeDeviceId: input.runtimeDeviceId,
      displayName: input.displayName?.trim() || basename(directory) || "Local project",
      localPath: directory,
      localPathLabel: directory,
      gitBranch: git.branch,
      gitBaseCommit: git.baseCommit,
      dirty: git.dirty,
    };
  }

  async createDefaultProjectRegistration(input: {
    readonly runtimeDeviceId: string;
    readonly displayName?: string;
  }): Promise<LocalProjectRegistration> {
    const defaultProjectPath =
      this.#config.defaultProjectPath ?? join(homedir(), "AgentHub", "Default Project");
    const displayName = input.displayName?.trim();
    const localPath = displayName
      ? join(dirname(defaultProjectPath), displayName)
      : defaultProjectPath;
    await mkdir(localPath, { recursive: true });
    return this.registerLocalProject({
      runtimeDeviceId: input.runtimeDeviceId,
      localPath,
      displayName: displayName ?? "AgentHub default project",
      source: "desktop-default",
    });
  }

  async startProviderRun(
    providerKind: string,
    request: AgentRunRequest,
    sink: (event: ProviderRuntimeEvent) => void,
  ): Promise<AgentRunHandle> {
    const adapter = this.#adapters.get(providerKind);
    if (!adapter) {
      throw new Error(`Provider adapter not registered: ${providerKind}`);
    }
    const handle = await adapter.startRun(request, sink);
    this.#activeRuns.set(handle.runId, handle);
    handle.done.finally(() => {
      this.#activeRuns.delete(handle.runId);
    });
    return handle;
  }

  async cancelRun(runId: string): Promise<void> {
    const handle = this.#activeRuns.get(runId);
    if (!handle) {
      throw new Error(`Active run not found: ${runId}`);
    }
    await handle.cancel();
  }

  connectCommandStream(onEvent: (event: MessageEvent) => void): EventSource {
    const stream = this.#client.openEventStream();
    stream.onmessage = onEvent;
    return stream;
  }

  async pollCommands(runtimeDeviceId: string): Promise<readonly RuntimeCommand[]> {
    return this.#client.pollCommands(runtimeDeviceId);
  }

  async publishProviderEvent(event: ProviderRuntimeEvent): Promise<void> {
    await this.#client.publishProviderEvent(event);
  }

  async pollAndHandleCommands(
    runtimeDeviceId: string,
    client: {
      readonly pollCommands: (runtimeDeviceId: string) => Promise<readonly RuntimeCommand[]>;
      readonly publishProviderEvent: (event: ProviderRuntimeEvent) => Promise<void>;
      readonly publishRuntimeConnectionCheckResult?: (
        result: RuntimeConnectionCheckResult,
      ) => Promise<void>;
    } = this.#client,
  ): Promise<void> {
    const commands = await client.pollCommands(runtimeDeviceId);
    for (const command of commands) {
      await this.handleCommand(command, client);
    }
  }

  async handleCommand(
    command: RuntimeCommand,
    eventPublisher: {
      readonly publishProviderEvent: (event: ProviderRuntimeEvent) => Promise<void>;
      readonly publishRuntimeConnectionCheckResult?: (
        result: RuntimeConnectionCheckResult,
      ) => Promise<void>;
    } = this.#client,
  ): Promise<void> {
    if (command.type === "run.cancel") {
      await this.cancelRun(command.payload.runId);
      return;
    }
    if (command.type === "connection.check") {
      await this.handleConnectionCheckCommand(command, eventPublisher);
      return;
    }
    const payload = command.payload;
    const memory = payload.memory;
    const observationPromises: Promise<unknown>[] = [];
    let systemPrompt = payload.systemPrompt;
    if (memory?.enabled && this.#memoryClient) {
      const context = await this.#memoryClient
        .fetchContext({ namespace: memory.namespace, query: payload.prompt })
        .catch(() => "");
      if (context.trim()) {
        systemPrompt = `${systemPrompt}\n\nLong-term memory:\n${context.trim()}`;
      }
      observationPromises.push(
        this.#memoryClient
          .observe({
            namespace: memory.namespace,
            text: payload.prompt,
            sourceType: "user.prompt",
            metadata: {
              workspaceId: payload.workspaceId,
              conversationId: payload.conversationId,
              runId: payload.runId,
              agentId: payload.agentId,
            },
          })
          .catch(() => undefined),
      );
    }

    const claudeCodeLaunchOptions =
      payload.providerMode === "claude-code" && payload.claudeCode
        ? await this.#materializeClaudeCodeLaunchOptions(payload)
        : payload.claudeCode;

    await this.startProviderRun(
      payload.providerMode,
      {
        runId: payload.runId,
        agentId: payload.agentId,
        workspacePath: payload.workspacePath,
        prompt: payload.prompt,
        systemPrompt,
        conversationContext: [],
        ...(claudeCodeLaunchOptions ? { claudeCode: claudeCodeLaunchOptions } : {}),
      },
      (event) => {
        if (event.type === "message.delta" && memory?.enabled && this.#memoryClient) {
          observationPromises.push(
            this.#memoryClient
              .observe({
                namespace: memory.namespace,
                text: event.delta,
                sourceType: "agent.output",
                metadata: {
                  workspaceId: payload.workspaceId,
                  conversationId: payload.conversationId,
                  runId: payload.runId,
                  agentId: payload.agentId,
                },
              })
              .catch(() => undefined),
          );
        }
        void eventPublisher.publishProviderEvent(event);
      },
    );
    await Promise.all(observationPromises);
  }

  async #materializeClaudeCodeLaunchOptions(
    payload: Extract<RuntimeCommand, { readonly type: "run.start" }>["payload"],
  ): Promise<AgentRunRequest["claudeCode"]> {
    if (!payload.claudeCode) {
      return undefined;
    }
    const profileRoot =
      this.#config.claudeCode?.profileRoot ?? `${process.env.HOME ?? "."}/.agenthub/claude-code`;
    const materialized = await materializeClaudeCodeProfile({
      ...payload.claudeCode,
      agentId: payload.agentId,
      profileRoot,
      runId: payload.runId,
      settingsSource: payload.claudeCode.settingsSource ?? "inherit",
      workspaceId: payload.workspaceId,
      workspacePath: payload.workspacePath,
    });
    return {
      ...payload.claudeCode,
      settingSources: materialized.settingSources,
      ...(materialized.settingsPath ? { settingsPath: materialized.settingsPath } : {}),
      ...(materialized.mcpConfigPath ? { mcpConfigPath: materialized.mcpConfigPath } : {}),
      pluginDirs: this.#config.claudeCode?.pluginDirs ?? [],
      strictMcpConfig: materialized.strictMcpConfig,
    };
  }

  async handleConnectionCheckCommand(
    command: Extract<RuntimeCommand, { readonly type: "connection.check" }>,
    resultPublisher: {
      readonly publishRuntimeConnectionCheckResult?: (
        result: RuntimeConnectionCheckResult,
      ) => Promise<void>;
    } = this.#client,
  ): Promise<void> {
    const checkedAt = new Date().toISOString();
    const result: RuntimeConnectionCheckResult = {
      runtimeDeviceId: command.runtimeDeviceId,
      ...(command.payload.targets.includes("provider")
        ? {
            providerHealth: this.#checkProviderHealth
              ? await this.#checkProviderHealth()
              : {
                  providerMode: "smoke" as const,
                  status: "unavailable" as const,
                  binaryPathLabel: "Unavailable",
                  checkedAt,
                  failureReason: "Provider health checker is not configured",
                },
          }
        : {}),
      ...(command.payload.targets.includes("memory")
        ? {
            memoryHealth: this.#memoryClient?.checkHealth
              ? await this.#memoryClient.checkHealth()
              : {
                  enabled: false,
                  status: "disabled" as const,
                  url: "Unavailable",
                  viewerUrl: "Unavailable",
                  checkedAt,
                  failureReason: "agentmemory health checker is not configured",
                },
          }
        : {}),
      ...(command.payload.targets.includes("claude-code") && this.#discoverClaudeCode
        ? {
            claudeCodeDiscovery: await this.#discoverClaudeCode(),
          }
        : {}),
    };
    await resultPublisher.publishRuntimeConnectionCheckResult?.(result);
  }
}

async function ensureReadableDirectory(path: string): Promise<string> {
  const trimmed = path.trim();
  if (!trimmed) {
    throw new Error("Project directory is required");
  }
  const info = await stat(trimmed);
  if (!info.isDirectory()) {
    throw new Error("Project path must be a directory");
  }
  return trimmed;
}

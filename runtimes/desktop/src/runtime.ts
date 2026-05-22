import type {
  ProviderRuntimeEvent,
  RuntimeCommand,
  RuntimeRegistrationPayload,
} from "@agenthub/contracts";
import type { AgentMemoryRuntimeClient } from "./agent-memory-client.js";
import { DesktopRuntimeControlPlaneClient } from "./control-plane-client.js";
import { readWorkspaceGitMetadata, type WorkspaceGitMetadata } from "./git.js";
import type { AgentRunHandle, AgentRunRequest, ProviderAdapter } from "./provider-adapter.js";

export interface DesktopRuntimeConfig {
  readonly deviceName: string;
  readonly controlPlaneUrl: string;
  readonly authToken: string;
  readonly heartbeatSeconds: number;
}

export interface LocalWorkspaceRegistration {
  readonly id: string;
  readonly displayName: string;
  readonly localPath: string;
  readonly git: WorkspaceGitMetadata;
}

export class DesktopRuntime {
  readonly #config: DesktopRuntimeConfig;
  readonly #client: DesktopRuntimeControlPlaneClient;
  readonly #adapters = new Map<string, ProviderAdapter>();
  readonly #activeRuns = new Map<string, AgentRunHandle>();
  readonly #memoryClient: AgentMemoryRuntimeClient | null;

  constructor(
    config: DesktopRuntimeConfig,
    adapters: readonly ProviderAdapter[],
    options: { readonly memoryClient?: AgentMemoryRuntimeClient | null } = {},
  ) {
    this.#config = config;
    this.#client = new DesktopRuntimeControlPlaneClient({
      authToken: config.authToken,
      baseUrl: config.controlPlaneUrl,
    });
    this.#memoryClient = options.memoryClient ?? null;
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
    } = this.#client,
  ): Promise<void> {
    const commands = await client.pollCommands(runtimeDeviceId);
    for (const command of commands) {
      await this.handleCommand(command, client);
    }
  }

  async handleCommand(
    command: RuntimeCommand,
    eventPublisher: { readonly publishProviderEvent: (event: ProviderRuntimeEvent) => Promise<void> } = this.#client,
  ): Promise<void> {
    if (command.type === "run.cancel") {
      await this.cancelRun(command.payload.runId);
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

    await this.startProviderRun(
      payload.providerMode,
      {
        runId: payload.runId,
        agentId: payload.agentId,
        workspacePath: payload.workspacePath,
        prompt: payload.prompt,
        systemPrompt,
        conversationContext: [],
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
}

import type { ProviderRuntimeEvent } from "@agenthub/contracts";
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

  constructor(config: DesktopRuntimeConfig, adapters: readonly ProviderAdapter[]) {
    this.#config = config;
    this.#client = new DesktopRuntimeControlPlaneClient({
      authToken: config.authToken,
      baseUrl: config.controlPlaneUrl,
    });
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
  }) {
    return this.#client.registerDevice({
      displayName: this.#config.deviceName,
      ...input,
    });
  }

  async sendHeartbeat(runtimeDeviceId: string) {
    return this.#client.sendHeartbeat(runtimeDeviceId);
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
}

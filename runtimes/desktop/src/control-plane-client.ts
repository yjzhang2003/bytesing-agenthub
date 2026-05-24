import {
  agentHubApiPaths,
  type ProviderRuntimeEvent,
  type RuntimeConnectionCheckResult,
  type RuntimeCommand,
  type RuntimeDevice,
  type RuntimeHeartbeatPayload,
  type RuntimeRegistrationPayload,
} from "@agenthub/contracts";

export type RuntimeRegistrationInput = RuntimeRegistrationPayload;

export class DesktopRuntimeControlPlaneClient {
  readonly #baseUrl: string;
  readonly #authToken: string;

  constructor(options: { readonly baseUrl: string; readonly authToken: string }) {
    this.#baseUrl = options.baseUrl.replace(/\/$/, "");
    this.#authToken = options.authToken;
  }

  async registerDevice(input: RuntimeRegistrationInput): Promise<RuntimeDevice> {
    const response = await this.#post<{ readonly device: RuntimeDevice }>(
      agentHubApiPaths.runtimeRegister,
      input,
    );
    return response.device;
  }

  async sendHeartbeat(runtimeDeviceId: string): Promise<RuntimeDevice> {
    const response = await this.#post<{ readonly device: RuntimeDevice }>(agentHubApiPaths.runtimeHeartbeat, {
      runtimeDeviceId,
    } satisfies RuntimeHeartbeatPayload);
    return response.device;
  }

  async markOffline(runtimeDeviceId: string): Promise<RuntimeDevice> {
    const response = await this.#post<{ readonly device: RuntimeDevice }>(agentHubApiPaths.runtimeOffline, {
      runtimeDeviceId,
    } satisfies RuntimeHeartbeatPayload);
    return response.device;
  }

  async pollCommands(runtimeDeviceId: string): Promise<readonly RuntimeCommand[]> {
    const response = await this.#get<{ readonly commands: readonly RuntimeCommand[] }>(
      `${agentHubApiPaths.runtimeCommands}?deviceId=${encodeURIComponent(runtimeDeviceId)}`,
    );
    return response.commands;
  }

  async publishProviderEvent(event: ProviderRuntimeEvent): Promise<void> {
    await this.#post<{ readonly ok: true }>(agentHubApiPaths.runtimeEvents, event);
  }

  async publishRuntimeConnectionCheckResult(result: RuntimeConnectionCheckResult): Promise<void> {
    await this.#post<{ readonly ok: true }>(agentHubApiPaths.runtimeConnectionCheckResults, result);
  }

  openEventStream(): EventSource {
    return new EventSource(`${this.#baseUrl}${agentHubApiPaths.events}`);
  }

  async #get<T>(path: string): Promise<T> {
    const response = await fetch(`${this.#baseUrl}${path}`, {
      headers: {
        authorization: `Bearer ${this.#authToken}`,
      },
      method: "GET",
    });

    if (!response.ok) {
      throw new Error(`Control plane request failed: ${response.status}`);
    }
    return (await response.json()) as T;
  }

  async #post<T>(path: string, body: unknown): Promise<T> {
    const response = await fetch(`${this.#baseUrl}${path}`, {
      body: JSON.stringify(body),
      headers: {
        authorization: `Bearer ${this.#authToken}`,
        "content-type": "application/json",
      },
      method: "POST",
    });

    if (!response.ok) {
      throw new Error(`Control plane request failed: ${response.status}`);
    }
    return (await response.json()) as T;
  }
}

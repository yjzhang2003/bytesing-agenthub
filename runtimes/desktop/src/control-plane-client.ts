import type { RuntimeDevice } from "@agenthub/contracts";

export interface RuntimeRegistrationInput {
  readonly displayName: string;
  readonly platform: RuntimeDevice["platform"];
  readonly appVersion: string;
  readonly capabilities: readonly string[];
}

export class DesktopRuntimeControlPlaneClient {
  readonly #baseUrl: string;
  readonly #authToken: string;

  constructor(options: { readonly baseUrl: string; readonly authToken: string }) {
    this.#baseUrl = options.baseUrl.replace(/\/$/, "");
    this.#authToken = options.authToken;
  }

  async registerDevice(input: RuntimeRegistrationInput): Promise<RuntimeDevice> {
    const response = await this.#post<{ readonly device: RuntimeDevice }>("/runtime/register", input);
    return response.device;
  }

  async sendHeartbeat(runtimeDeviceId: string): Promise<RuntimeDevice> {
    const response = await this.#post<{ readonly device: RuntimeDevice }>("/runtime/heartbeat", {
      runtimeDeviceId,
    });
    return response.device;
  }

  openEventStream(): EventSource {
    return new EventSource(`${this.#baseUrl}/events`);
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


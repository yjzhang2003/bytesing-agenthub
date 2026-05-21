import {
  agentHubApiPaths,
  agentHubLocalDefaults,
  type AgentHubEvent,
  type CreateLocalRunRequest,
  type WorkbenchSnapshot,
} from "@agenthub/contracts";

export interface WebControlPlaneClientOptions {
  readonly baseUrl: string;
  readonly accessToken: string;
}

export class WebControlPlaneClient {
  readonly #baseUrl: string;
  readonly #accessToken: string;

  constructor(options: WebControlPlaneClientOptions) {
    this.#baseUrl = options.baseUrl.replace(/\/$/, "");
    this.#accessToken = options.accessToken;
  }

  async createRun(input: {
    readonly workspaceId: string;
    readonly conversationId: string;
    readonly agentId: string;
    readonly prompt: string;
    readonly planId?: string | null;
  }) {
    return this.#post(agentHubApiPaths.runs, input satisfies CreateLocalRunRequest);
  }

  async cancelRun(runId: string) {
    return this.#post(`/runs/${runId}/cancel`, {});
  }

  async getSnapshot(): Promise<WorkbenchSnapshot> {
    return this.#get(agentHubApiPaths.workbenchSnapshot);
  }

  openEvents(onEvent: (event: AgentHubEvent) => void): EventSource {
    const stream = new EventSource(`${this.#baseUrl}${agentHubApiPaths.events}`);
    stream.onmessage = (event) => {
      if (event.data) {
        onEvent(JSON.parse(event.data) as AgentHubEvent);
      }
    };
    return stream;
  }

  async #get<T>(path: string): Promise<T> {
    const response = await fetch(`${this.#baseUrl}${path}`, {
      headers: {
        authorization: `Bearer ${this.#accessToken}`,
      },
      method: "GET",
    });
    if (!response.ok) {
      throw new Error(`Control plane request failed: ${response.status}`);
    }
    return (await response.json()) as T;
  }

  async #post(path: string, body: unknown): Promise<unknown> {
    const response = await fetch(`${this.#baseUrl}${path}`, {
      body: JSON.stringify(body),
      headers: {
        authorization: `Bearer ${this.#accessToken}`,
        "content-type": "application/json",
      },
      method: "POST",
    });
    if (!response.ok) {
      throw new Error(`Control plane request failed: ${response.status}`);
    }
    return response.json();
  }
}

export function createDefaultWebControlPlaneClient(
  env: ImportMetaEnv = import.meta.env,
): WebControlPlaneClient {
  return new WebControlPlaneClient({
    accessToken: env.VITE_AGENTHUB_LOCAL_AUTH_TOKEN ?? agentHubLocalDefaults.authToken,
    baseUrl:
      env.VITE_CONTROL_PLANE_URL ??
      `http://127.0.0.1:${agentHubLocalDefaults.controlPlanePort}`,
  });
}

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
    readonly planId?: string | null;
  }) {
    return this.#post("/runs", input);
  }

  async cancelRun(runId: string) {
    return this.#post(`/runs/${runId}/cancel`, {});
  }

  openEvents(): EventSource {
    return new EventSource(`${this.#baseUrl}/events`);
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


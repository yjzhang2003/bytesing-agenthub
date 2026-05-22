import type { MemoryHealth } from "@agenthub/contracts";

export interface AgentMemoryClientOptions {
  readonly enabled: boolean;
  readonly baseUrl: string;
  readonly viewerUrl: string;
  readonly timeoutMs: number;
  readonly secret?: string;
  readonly now?: () => Date;
}

export interface AgentMemoryContextInput {
  readonly namespace: string;
  readonly query: string;
}

export interface AgentMemoryObservationInput {
  readonly namespace: string;
  readonly text: string;
  readonly sourceType: "user.prompt" | "agent.output";
  readonly metadata: Record<string, unknown>;
}

export interface AgentMemoryRuntimeClient {
  fetchContext(input: AgentMemoryContextInput): Promise<string>;
  observe(input: AgentMemoryObservationInput): Promise<void>;
}

export class AgentMemoryClient implements AgentMemoryRuntimeClient {
  readonly #options: AgentMemoryClientOptions;

  constructor(options: AgentMemoryClientOptions) {
    this.#options = options;
  }

  async checkHealth(): Promise<MemoryHealth> {
    const checkedAt = (this.#options.now ?? (() => new Date()))().toISOString();
    if (!this.#options.enabled) {
      return {
        enabled: false,
        status: "disabled",
        url: this.#options.baseUrl,
        viewerUrl: this.#options.viewerUrl,
        checkedAt,
        failureReason: null,
      };
    }
    const configurationError = this.#configurationError();
    if (configurationError) {
      return {
        enabled: true,
        status: "misconfigured",
        url: this.#options.baseUrl,
        viewerUrl: this.#options.viewerUrl,
        checkedAt,
        failureReason: configurationError,
      };
    }

    try {
      const response = await this.#fetch("/agentmemory/health", { method: "GET" });
      if (!response.ok) {
        return this.#unavailable(checkedAt, `agentmemory health returned HTTP ${response.status}`);
      }
      return {
        enabled: true,
        status: "connected",
        url: this.#options.baseUrl,
        viewerUrl: this.#options.viewerUrl,
        checkedAt,
        failureReason: null,
      };
    } catch (error) {
      return this.#unavailable(checkedAt, error instanceof Error ? error.message : String(error));
    }
  }

  async fetchContext(input: AgentMemoryContextInput): Promise<string> {
    if (!this.#options.enabled) {
      return "";
    }
    const response = await this.#fetch("/agentmemory/context", {
      method: "POST",
      body: JSON.stringify({
        project: input.namespace,
        query: input.query,
      }),
    });
    if (!response.ok) {
      return "";
    }
    const body = (await response.json().catch(() => ({}))) as {
      context?: unknown;
      text?: unknown;
      memories?: unknown;
    };
    if (typeof body.context === "string") {
      return body.context;
    }
    if (typeof body.text === "string") {
      return body.text;
    }
    if (Array.isArray(body.memories)) {
      return body.memories
        .map((memory) =>
          typeof memory === "string"
            ? memory
            : typeof (memory as { text?: unknown }).text === "string"
              ? (memory as { text: string }).text
              : "",
        )
        .filter(Boolean)
        .join("\n");
    }
    return "";
  }

  async observe(input: AgentMemoryObservationInput): Promise<void> {
    if (!this.#options.enabled || !input.text.trim()) {
      return;
    }
    await this.#fetch("/agentmemory/observe", {
      method: "POST",
      body: JSON.stringify({
        project: input.namespace,
        content: input.text,
        metadata: {
          ...input.metadata,
          sourceType: input.sourceType,
        },
      }),
    }).catch(() => undefined);
  }

  #unavailable(checkedAt: string, failureReason: string): MemoryHealth {
    return {
      enabled: this.#options.enabled,
      status: "unavailable",
      url: this.#options.baseUrl,
      viewerUrl: this.#options.viewerUrl,
      checkedAt,
      failureReason,
    };
  }

  #configurationError(): string | null {
    try {
      new URL(this.#options.baseUrl);
      new URL(this.#options.viewerUrl);
      return null;
    } catch {
      return "agentmemory URL configuration is invalid";
    }
  }

  async #fetch(path: string, init: RequestInit): Promise<Response> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.#options.timeoutMs);
    try {
      return await fetch(`${this.#options.baseUrl.replace(/\/$/, "")}${path}`, {
        ...init,
        signal: controller.signal,
        headers: {
          "content-type": "application/json",
          ...(this.#options.secret ? { authorization: `Bearer ${this.#options.secret}` } : {}),
          ...(init.headers ?? {}),
        },
      });
    } finally {
      clearTimeout(timeout);
    }
  }
}

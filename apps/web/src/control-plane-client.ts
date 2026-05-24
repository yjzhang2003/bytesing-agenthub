import {
  agentHubApiPaths,
  agentHubLocalDefaults,
  type AgentHubEventType,
  type AgentHubEvent,
  type ConnectionCheckTarget,
  type CreateAgentConversationRequest,
  type CreateConnectionCheckRequest,
  type CreateAgentRequest,
  type CreateLocalRunRequest,
  type UpdateAgentRequest,
  type WorkbenchSnapshot,
} from "@agenthub/contracts";

const AGENTHUB_EVENT_TYPES: readonly AgentHubEventType[] = [
  "runtime.device.status_changed",
  "agent.run.started",
  "agent.run.message_delta",
  "agent.run.status_changed",
  "agent.run.completed",
  "agent.run.failed",
  "dispatch.plan.created",
  "dispatch.plan.status_changed",
  "agent.task.assigned",
  "permission.requested",
  "permission.status_changed",
  "artifact.created",
  "artifact.updated",
  "diff.metadata.updated",
  "conversation.membership_changed",
];

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

  async createRun(input: CreateLocalRunRequest) {
    return this.#post(agentHubApiPaths.runs, input satisfies CreateLocalRunRequest);
  }

  async listAgents(workspaceId?: string) {
    const suffix = workspaceId ? `?workspaceId=${encodeURIComponent(workspaceId)}` : "";
    return this.#get(`${agentHubApiPaths.agents}${suffix}`);
  }

  async createAgent(input: CreateAgentRequest) {
    return this.#post(agentHubApiPaths.agents, input);
  }

  async updateAgent(agentId: string, input: UpdateAgentRequest) {
    return this.#post(`/agents/${agentId}`, input, "PATCH");
  }

  async archiveAgent(agentId: string) {
    return this.#post(`/agents/${agentId}/archive`, {});
  }

  async createAgentConversation(input: CreateAgentConversationRequest) {
    return this.#post(agentHubApiPaths.agentConversations(input.agentId), input);
  }

  async setActiveConversation(conversationId: string) {
    return this.#post(agentHubApiPaths.activeConversation(conversationId), {});
  }

  async addAgentToConversation(conversationId: string, agentId: string) {
    return this.#post(`/conversations/${conversationId}/agents`, { agentId });
  }

  async removeAgentFromConversation(conversationId: string, agentId: string) {
    return this.#post(`/conversations/${conversationId}/agents/${agentId}`, {}, "DELETE");
  }

  async cancelRun(runId: string) {
    return this.#post(`/runs/${runId}/cancel`, {});
  }

  async checkConnection(input: {
    readonly workspaceId: string;
    readonly target: ConnectionCheckTarget;
  }) {
    return this.checkConnections({
      workspaceId: input.workspaceId,
      targets: [input.target],
    });
  }

  async checkConnections(input: CreateConnectionCheckRequest) {
    return this.#post(agentHubApiPaths.connectionChecks, input);
  }

  async getSnapshot(): Promise<WorkbenchSnapshot> {
    return this.#get(agentHubApiPaths.workbenchSnapshot);
  }

  openEvents(onEvent: (event: AgentHubEvent) => void): EventSource {
    const stream = new EventSource(
      `${this.#baseUrl}${agentHubApiPaths.events}?access_token=${encodeURIComponent(this.#accessToken)}`,
    );
    const handleEvent = (event: MessageEvent<string>) => {
      if (event.data) {
        onEvent(JSON.parse(event.data) as AgentHubEvent);
      }
    };
    for (const eventType of AGENTHUB_EVENT_TYPES) {
      stream.addEventListener(eventType, handleEvent);
    }
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

  async #post(path: string, body: unknown, method = "POST"): Promise<unknown> {
    const response = await fetch(`${this.#baseUrl}${path}`, {
      body: JSON.stringify(body),
      headers: {
        authorization: `Bearer ${this.#accessToken}`,
        "content-type": "application/json",
      },
      method,
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
      env.VITE_CONTROL_PLANE_URL ?? `http://127.0.0.1:${agentHubLocalDefaults.controlPlanePort}`,
  });
}

import {
  agentHubApiPaths,
  type AgentHubEventType,
  type AgentHubEvent,
  type ConnectionCheckTarget,
  type CreateAgentConversationRequest,
  type CreateConnectionCheckRequest,
  type CreateAgentRequest,
  type CreateLocalRunRequest,
  type UpdateConversationAgentSettingsRequest,
  type UpdateConversationRequest,
  type UpdateAgentRequest,
  type WorkbenchSnapshot,
} from "@agenthub/contracts";
import {
  AuthenticationRequiredError,
  resolveWebControlPlaneClientOptions,
  sessionFromSupabase,
  type WebAuthSession,
} from "./auth-session.js";
import { createWebSupabaseClient } from "./supabase.js";

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
  "conversation.updated",
  "conversation.membership_changed",
  "collaboration.mention.recorded",
  "collaboration.task.status_changed",
  "collaboration.question.created",
  "collaboration.question.answered",
  "collaboration.openspec.updated",
];

export interface WebControlPlaneClientOptions {
  readonly baseUrl: string;
  readonly accessToken: string;
  readonly onAuthenticationFailure?: (() => void) | undefined;
}

export class WebControlPlaneClient {
  readonly #baseUrl: string;
  readonly #accessToken: string;
  readonly #eventStreams = new Set<EventSource>();
  readonly #onAuthenticationFailure: (() => void) | undefined;

  constructor(options: WebControlPlaneClientOptions) {
    this.#baseUrl = options.baseUrl.replace(/\/$/, "");
    this.#accessToken = options.accessToken;
    this.#onAuthenticationFailure = options.onAuthenticationFailure;
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
    return this.#post(agentHubApiPaths.conversations, input);
  }

  async setActiveConversation(conversationId: string) {
    return this.#post(agentHubApiPaths.activeConversation(conversationId), {});
  }

  async updateConversation(conversationId: string, input: UpdateConversationRequest) {
    return this.#post(agentHubApiPaths.conversation(conversationId), input, "PATCH");
  }

  async updateConversationAgentSettings(
    conversationId: string,
    agentId: string,
    input: UpdateConversationAgentSettingsRequest,
  ) {
    return this.#post(agentHubApiPaths.conversationAgent(conversationId, agentId), input, "PATCH");
  }

  async deleteConversation(conversationId: string) {
    return this.#post(agentHubApiPaths.conversation(conversationId), {}, "DELETE");
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
    this.#eventStreams.add(stream);
    return stream;
  }

  async #get<T>(path: string): Promise<T> {
    const response = await fetch(`${this.#baseUrl}${path}`, {
      headers: {
        authorization: `Bearer ${this.#accessToken}`,
      },
      method: "GET",
    });
    this.#handleAuthenticationRejection(response);
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
    this.#handleAuthenticationRejection(response);
    if (!response.ok) {
      throw new Error(`Control plane request failed: ${response.status}`);
    }
    return response.json();
  }

  #handleAuthenticationRejection(response: Response): void {
    if (response.status !== 401) {
      return;
    }
    this.#closeEventStreams();
    this.#onAuthenticationFailure?.();
    throw new AuthenticationRequiredError();
  }

  #closeEventStreams(): void {
    for (const stream of this.#eventStreams) {
      stream.close();
    }
    this.#eventStreams.clear();
  }
}

export function createDefaultWebControlPlaneClient(
  env: ImportMetaEnv = import.meta.env,
): WebControlPlaneClient {
  return new WebControlPlaneClient(resolveWebControlPlaneClientOptions({ env, session: null }));
}

export function createWebControlPlaneClientFromSession(input: {
  readonly env?: ImportMetaEnv;
  readonly session: WebAuthSession | null;
  readonly onAuthenticationFailure?: (() => void) | undefined;
}): WebControlPlaneClient {
  return new WebControlPlaneClient({
    ...resolveWebControlPlaneClientOptions(input),
    onAuthenticationFailure: input.onAuthenticationFailure,
  });
}

export async function createAuthenticatedWebControlPlaneClient(
  env: ImportMetaEnv = import.meta.env,
  options: { readonly onAuthenticationFailure?: (() => void) | undefined } = {},
): Promise<WebControlPlaneClient> {
  const supabase = createWebSupabaseClient({
    anonKey: env.VITE_SUPABASE_ANON_KEY ?? "",
    url: env.VITE_SUPABASE_URL ?? "",
  });
  const session = supabase
    ? sessionFromSupabase((await supabase.auth.getSession()).data.session)
    : null;
  return createWebControlPlaneClientFromSession({
    env,
    onAuthenticationFailure: options.onAuthenticationFailure,
    session,
  });
}

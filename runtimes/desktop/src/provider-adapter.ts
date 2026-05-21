import type { ProviderRuntimeEvent } from "@agenthub/contracts";

export interface AgentRunRequest {
  readonly runId: string;
  readonly agentId: string;
  readonly workspacePath: string;
  readonly prompt: string;
  readonly systemPrompt: string;
  readonly conversationContext: readonly string[];
}

export interface AgentRunHandle {
  readonly runId: string;
  readonly cancel: () => Promise<void>;
  readonly done: Promise<void>;
}

export type RuntimeEventSink = (event: ProviderRuntimeEvent) => void;

export interface ProviderAdapter {
  readonly kind: string;
  startRun(request: AgentRunRequest, sink: RuntimeEventSink): Promise<AgentRunHandle>;
}


import type { ClaudeCodeRunOptions, ProviderRuntimeEvent } from "@agenthub/contracts";

export interface ClaudeCodeLaunchOptions extends ClaudeCodeRunOptions {
  readonly settingsPath?: string;
  readonly settingSources?: string;
  readonly mcpConfigPath?: string;
  readonly pluginDirs?: readonly string[];
  readonly strictMcpConfig?: boolean;
}

export interface AgentRunRequest {
  readonly runId: string;
  readonly agentId: string;
  readonly workspacePath: string;
  readonly prompt: string;
  readonly systemPrompt: string;
  readonly conversationContext: readonly string[];
  readonly claudeCode?: ClaudeCodeLaunchOptions;
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

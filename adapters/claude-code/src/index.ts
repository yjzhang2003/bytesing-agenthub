export { ClaudeCodeAdapter } from "./claude-code-adapter.js";
export type { ClaudeCodeAdapterOptions } from "./claude-code-adapter.js";

export interface ClaudeCodeAdapterConfig {
  readonly binaryPath: string;
}

export const defaultClaudeCodeAdapterConfig: ClaudeCodeAdapterConfig = {
  binaryPath: process.env.AGENTHUB_CLAUDE_CODE_BIN ?? "claude",
};

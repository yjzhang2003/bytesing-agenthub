import { describe, expect, it } from "vitest";
import { ClaudeCodeAdapter, defaultClaudeCodeAdapterConfig } from "../src/index.js";

describe("Claude Code adapter config", () => {
  it("defaults to the claude binary", () => {
    expect(defaultClaudeCodeAdapterConfig.binaryPath).toBe(process.env.AGENTHUB_CLAUDE_CODE_BIN ?? "claude");
  });

  it("reports failed status when the Claude Code binary cannot start", async () => {
    const adapter = new ClaudeCodeAdapter({
      binaryPath: "/tmp/agenthub-missing-standalone-claude-code-binary",
    });
    const events: unknown[] = [];
    const handle = await adapter.startRun(
      {
        runId: "run_1",
        agentId: "agent_1",
        workspacePath: process.cwd(),
        prompt: "hello",
        systemPrompt: "worker",
        conversationContext: [],
      },
      (event) => events.push(event),
    );

    await handle.done;

    expect(events.at(-1)).toMatchObject({
      type: "run.status",
      status: "failed",
    });
  });
});

import { describe, expect, it } from "vitest";
import { defaultClaudeCodeAdapterConfig } from "../src/index.js";

describe("Claude Code adapter config", () => {
  it("defaults to the claude binary", () => {
    expect(defaultClaudeCodeAdapterConfig.binaryPath).toBe(process.env.AGENTHUB_CLAUDE_CODE_BIN ?? "claude");
  });
});


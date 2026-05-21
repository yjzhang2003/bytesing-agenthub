import { describe, expect, it } from "vitest";
import {
  isDiffMetadataStale,
  validateDiffMetadata,
  validateOrchestratorDispatchPlan,
  validateProviderRuntimeEvent,
} from "../src/index.js";

describe("contract validation", () => {
  it("rejects invalid orchestrator output without steps", () => {
    const result = validateOrchestratorDispatchPlan({
      id: "plan_1",
      conversationId: "conv_1",
      workspaceId: "workspace_1",
      goal: "Implement feature",
      status: "draft",
      steps: [],
    });

    expect(result.ok).toBe(false);
    expect(result.issues?.join("\n")).toContain("Too small");
  });

  it("rejects invalid provider runtime event type", () => {
    const result = validateProviderRuntimeEvent({
      type: "unknown.event",
      runId: "run_1",
      agentId: "agent_1",
    });

    expect(result.ok).toBe(false);
  });

  it("detects stale diff metadata fingerprints", () => {
    expect(isDiffMetadataStale("base:abc|dirty:1", "base:def|dirty:1")).toBe(true);
    expect(isDiffMetadataStale("base:abc|dirty:1", "base:abc|dirty:1")).toBe(false);
  });

  it("accepts valid diff metadata", () => {
    const result = validateDiffMetadata({
      workspaceId: "workspace_1",
      runId: "run_1",
      baseCommit: "abc123",
      workingTreeFingerprint: "base:abc123|dirty:1",
      cacheExpiresAt: null,
      changedFiles: [
        {
          path: "src/index.ts",
          status: "modified",
          insertions: 12,
          deletions: 3,
        },
      ],
    });

    expect(result.ok).toBe(true);
  });
});


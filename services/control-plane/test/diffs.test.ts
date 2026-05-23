import { describe, expect, it } from "vitest";
import { agentHubLocalDefaults } from "@agenthub/contracts";
import { DiffArtifactService } from "../src/index.js";

const metadata = {
  workspaceId: "workspace_1",
  runId: "run_1",
  baseCommit: "abc123",
  workingTreeFingerprint: "base:abc123|dirty:1",
  cacheExpiresAt: null,
  changedFiles: [
    {
      path: "src/index.ts",
      status: "modified" as const,
      insertions: 10,
      deletions: 2,
    },
  ],
};

describe("DiffArtifactService", () => {
  it("persists diff artifact metadata", () => {
    const service = new DiffArtifactService();
    const artifact = service.persistDiffMetadata({
      ownerUserId: "user_1",
      conversationId: agentHubLocalDefaults.conversationId,
      artifactId: "artifact_1",
      title: "Code changes",
      summary: "1 file changed",
      metadata,
    });

    expect(artifact.type).toBe("diff");
    expect(artifact.metadata).toMatchObject({ baseCommit: "abc123" });
  });

  it("returns offline state when runtime provider is unavailable", async () => {
    const service = new DiffArtifactService();
    service.persistDiffMetadata({
      ownerUserId: "user_1",
      conversationId: agentHubLocalDefaults.conversationId,
      artifactId: "artifact_1",
      title: "Code changes",
      summary: "1 file changed",
      metadata,
    });

    await expect(service.getFullDiff("workspace_1", "run_1", null)).resolves.toMatchObject({
      content: null,
      state: "offline",
    });
  });

  it("detects stale full diff responses", async () => {
    const service = new DiffArtifactService();
    service.persistDiffMetadata({
      ownerUserId: "user_1",
      conversationId: agentHubLocalDefaults.conversationId,
      artifactId: "artifact_1",
      title: "Code changes",
      summary: "1 file changed",
      metadata,
    });

    const result = await service.getFullDiff("workspace_1", "run_1", {
      async getFullDiff() {
        return {
          content: "diff --git a/src/index.ts b/src/index.ts",
          workingTreeFingerprint: "base:def456|dirty:1",
        };
      },
    });

    expect(result.state).toBe("stale");
  });

  it("returns cached full diffs before TTL expiry", async () => {
    const service = new DiffArtifactService();
    service.persistDiffMetadata({
      ownerUserId: "user_1",
      conversationId: agentHubLocalDefaults.conversationId,
      artifactId: "artifact_1",
      title: "Code changes",
      summary: "1 file changed",
      metadata,
    });
    service.cacheFullDiff("workspace_1", "run_1", "cached diff", 1_000);

    await expect(service.getFullDiff("workspace_1", "run_1", null)).resolves.toMatchObject({
      content: "cached diff",
      state: "cached",
    });
  });
});

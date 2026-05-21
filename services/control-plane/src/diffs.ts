import type { Artifact, DiffMetadata, Id } from "@agenthub/contracts";
import { isDiffMetadataStale } from "@agenthub/contracts";

export interface FullDiffProvider {
  getFullDiff(workspaceId: Id, runId: Id): Promise<{
    readonly content: string;
    readonly workingTreeFingerprint: string;
  }>;
}

export interface FullDiffResult {
  readonly content: string | null;
  readonly metadata: DiffMetadata;
  readonly state: "available" | "offline" | "stale" | "cached";
}

export class DiffArtifactService {
  readonly #now: () => Date;
  readonly #metadata = new Map<Id, DiffMetadata>();
  readonly #artifacts = new Map<Id, Artifact>();
  readonly #cache = new Map<string, { readonly content: string; readonly expiresAt: string }>();

  constructor(options: { readonly now?: () => Date } = {}) {
    this.#now = options.now ?? (() => new Date());
  }

  persistDiffMetadata(input: {
    readonly ownerUserId: Id;
    readonly conversationId: Id;
    readonly artifactId: Id;
    readonly title: string;
    readonly summary: string;
    readonly metadata: DiffMetadata;
  }): Artifact {
    this.#metadata.set(input.metadata.runId, input.metadata);
    const now = this.#now().toISOString();
    const artifact: Artifact = {
      id: input.artifactId,
      ownerUserId: input.ownerUserId,
      workspaceId: input.metadata.workspaceId,
      conversationId: input.conversationId,
      runId: input.metadata.runId,
      type: "diff",
      title: input.title,
      summary: input.summary,
      metadata: {
        baseCommit: input.metadata.baseCommit,
        changedFiles: input.metadata.changedFiles,
        workingTreeFingerprint: input.metadata.workingTreeFingerprint,
      },
      createdAt: now,
      updatedAt: now,
    };
    this.#artifacts.set(artifact.id, artifact);
    return artifact;
  }

  async getFullDiff(
    workspaceId: Id,
    runId: Id,
    provider: FullDiffProvider | null,
  ): Promise<FullDiffResult> {
    const metadata = this.#requireMetadata(runId);
    const cacheKey = `${workspaceId}:${runId}`;
    const cached = this.#cache.get(cacheKey);
    if (cached && Date.parse(cached.expiresAt) > this.#now().getTime()) {
      return { content: cached.content, metadata, state: "cached" };
    }

    if (!provider) {
      return { content: null, metadata, state: "offline" };
    }

    const fullDiff = await provider.getFullDiff(workspaceId, runId);
    return {
      content: fullDiff.content,
      metadata,
      state: isDiffMetadataStale(metadata.workingTreeFingerprint, fullDiff.workingTreeFingerprint)
        ? "stale"
        : "available",
    };
  }

  cacheFullDiff(workspaceId: Id, runId: Id, content: string, ttlMs: number): void {
    this.#cache.set(`${workspaceId}:${runId}`, {
      content,
      expiresAt: new Date(this.#now().getTime() + ttlMs).toISOString(),
    });
  }

  #requireMetadata(runId: Id): DiffMetadata {
    const metadata = this.#metadata.get(runId);
    if (!metadata) {
      throw new Error("Diff metadata not found");
    }
    return metadata;
  }
}


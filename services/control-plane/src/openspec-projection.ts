import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import type {
  CollaborationOpenSpecArtifact,
  CollaborationOpenSpecLink,
  Id,
} from "@agenthub/contracts";
import { validateCollaborationOpenSpecLink } from "@agenthub/contracts";
import type { CollaborationScope } from "./project-collaboration-runtime.js";

export interface OpenSpecProjectionServiceOptions {
  readonly workspaceRoot: string;
  readonly now?: () => Date;
  readonly randomId?: () => Id;
}

export class OpenSpecProjectionService {
  readonly #workspaceRoot: string;
  readonly #now: () => Date;
  readonly #randomId: () => Id;

  constructor(options: OpenSpecProjectionServiceOptions) {
    this.#workspaceRoot = options.workspaceRoot;
    this.#now = options.now ?? (() => new Date());
    this.#randomId = options.randomId ?? (() => crypto.randomUUID());
  }

  async projectTask(
    scope: CollaborationScope,
    input: {
      readonly openspecChangeName: string;
      readonly collaborationTaskId: Id;
      readonly title: string;
    },
  ): Promise<CollaborationOpenSpecLink> {
    const artifactPath = this.#artifactPath(input.openspecChangeName, "tasks");
    const marker = `[collaboration:${input.collaborationTaskId}]`;
    const current = await readFile(artifactPath, "utf8");
    if (!current.includes(marker)) {
      const prefix = current.endsWith("\n") ? current : `${current}\n`;
      await writeFile(
        artifactPath,
        `${prefix}\n## Collaboration Tasks\n\n- [ ] ${marker} ${input.title}\n`,
        "utf8",
      );
    }
    return this.#link(scope, {
      openspecChangeName: input.openspecChangeName,
      artifact: "tasks",
      artifactPath,
      collaborationTaskId: input.collaborationTaskId,
      decisionId: null,
      projectionStatus: "projected",
    });
  }

  async projectDecision(
    scope: CollaborationScope,
    input: {
      readonly openspecChangeName: string;
      readonly artifact: Exclude<CollaborationOpenSpecArtifact, "tasks">;
      readonly decisionId: Id;
      readonly content: string;
    },
  ): Promise<CollaborationOpenSpecLink> {
    const artifactPath = this.#artifactPath(input.openspecChangeName, input.artifact);
    const marker = `[decision:${input.decisionId}]`;
    const current = await readFile(artifactPath, "utf8");
    if (!current.includes(marker)) {
      const hasSection = current.includes("## Collaboration Decisions");
      const prefix = current.endsWith("\n") ? current : `${current}\n`;
      const section = hasSection ? "" : "\n## Collaboration Decisions\n";
      await writeFile(artifactPath, `${prefix}${section}\n- ${marker} ${input.content}\n`, "utf8");
    }
    return this.#link(scope, {
      openspecChangeName: input.openspecChangeName,
      artifact: input.artifact,
      artifactPath,
      collaborationTaskId: null,
      decisionId: input.decisionId,
      projectionStatus: "projected",
    });
  }

  async skipTransient(
    scope: CollaborationScope,
    input: {
      readonly openspecChangeName: string;
      readonly artifact: CollaborationOpenSpecArtifact;
      readonly collaborationTaskId?: Id | null;
      readonly decisionId?: Id | null;
      readonly reason: string;
    },
  ): Promise<CollaborationOpenSpecLink> {
    return this.#link(scope, {
      openspecChangeName: input.openspecChangeName,
      artifact: input.artifact,
      artifactPath: this.#artifactPath(input.openspecChangeName, input.artifact),
      collaborationTaskId: input.collaborationTaskId ?? null,
      decisionId: input.decisionId ?? null,
      projectionStatus: "skipped",
    });
  }

  #link(
    scope: CollaborationScope,
    input: Pick<
      CollaborationOpenSpecLink,
      | "openspecChangeName"
      | "artifact"
      | "artifactPath"
      | "collaborationTaskId"
      | "decisionId"
      | "projectionStatus"
    >,
  ): CollaborationOpenSpecLink {
    const now = this.#now().toISOString();
    const link: CollaborationOpenSpecLink = {
      id: this.#randomId(),
      ownerUserId: scope.ownerUserId,
      workspaceId: scope.workspaceId,
      projectId: scope.projectId,
      conversationId: scope.conversationId,
      openspecChangeName: input.openspecChangeName,
      artifact: input.artifact,
      artifactPath: input.artifactPath,
      collaborationTaskId: input.collaborationTaskId,
      decisionId: input.decisionId,
      projectionStatus: input.projectionStatus,
      lastProjectedAt: input.projectionStatus === "projected" ? now : null,
      createdAt: now,
      updatedAt: now,
    };
    const result = validateCollaborationOpenSpecLink(link);
    if (!result.ok) {
      throw new Error(`Invalid OpenSpec collaboration link: ${result.issues?.join("; ")}`);
    }
    return link;
  }

  #artifactPath(changeName: string, artifact: CollaborationOpenSpecArtifact): string {
    if (!/^[a-z0-9][a-z0-9-]*$/.test(changeName)) {
      throw new Error(`Invalid OpenSpec change name: ${changeName}`);
    }
    if (artifact === "spec") {
      return join(this.#workspaceRoot, "openspec", "changes", changeName, "specs");
    }
    return join(this.#workspaceRoot, "openspec", "changes", changeName, `${artifact}.md`);
  }
}

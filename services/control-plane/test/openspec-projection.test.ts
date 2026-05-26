import { mkdir, readFile, writeFile } from "node:fs/promises";
import { mkdtemp } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { describe, expect, it } from "vitest";
import { OpenSpecProjectionService } from "../src/index.js";

const now = "2026-05-24T00:00:00.000Z";

async function createWorkspace() {
  const workspaceRoot = await mkdtemp(join(tmpdir(), "agenthub-openspec-projection-"));
  const changeDir = join(workspaceRoot, "openspec/changes/add-auth");
  await mkdir(changeDir, { recursive: true });
  await writeFile(join(changeDir, "tasks.md"), "## 1. Existing\n\n- [ ] 1.1 Existing task\n", "utf8");
  await writeFile(join(changeDir, "design.md"), "## Context\n\nInitial design.\n", "utf8");
  let id = 0;
  return {
    workspaceRoot,
    projector: new OpenSpecProjectionService({
      workspaceRoot,
      now: () => new Date(now),
      randomId: () => `link_${++id}`,
    }),
  };
}

const scope = {
  ownerUserId: "user_1",
  workspaceId: "workspace_1",
  projectId: "project_1",
  conversationId: "conversation_1",
};

describe("OpenSpecProjectionService", () => {
  it("projects collaboration tasks into OpenSpec tasks idempotently", async () => {
    const { workspaceRoot, projector } = await createWorkspace();

    const first = await projector.projectTask(scope, {
      openspecChangeName: "add-auth",
      collaborationTaskId: "task_1",
      title: "Review auth flow",
    });
    const second = await projector.projectTask(scope, {
      openspecChangeName: "add-auth",
      collaborationTaskId: "task_1",
      title: "Review auth flow",
    });

    const tasks = await readFile(join(workspaceRoot, "openspec/changes/add-auth/tasks.md"), "utf8");
    expect(first).toMatchObject({
      openspecChangeName: "add-auth",
      artifact: "tasks",
      collaborationTaskId: "task_1",
      projectionStatus: "projected",
    });
    expect(second.projectionStatus).toBe("projected");
    expect(tasks.match(/\[collaboration:task_1\]/g)).toHaveLength(1);
  });

  it("projects accepted decisions into OpenSpec design artifacts idempotently", async () => {
    const { workspaceRoot, projector } = await createWorkspace();

    await projector.projectDecision(scope, {
      openspecChangeName: "add-auth",
      artifact: "design",
      decisionId: "decision_1",
      content: "Use Orchestrator as the default unaddressed group-message router.",
    });
    await projector.projectDecision(scope, {
      openspecChangeName: "add-auth",
      artifact: "design",
      decisionId: "decision_1",
      content: "Use Orchestrator as the default unaddressed group-message router.",
    });

    const design = await readFile(join(workspaceRoot, "openspec/changes/add-auth/design.md"), "utf8");
    expect(design).toContain("## Collaboration Decisions");
    expect(design.match(/\[decision:decision_1\]/g)).toHaveLength(1);
  });

  it("skips transient collaboration records without mutating OpenSpec artifacts", async () => {
    const { workspaceRoot, projector } = await createWorkspace();

    const link = await projector.skipTransient(scope, {
      openspecChangeName: "add-auth",
      artifact: "tasks",
      collaborationTaskId: "heartbeat_1",
      reason: "heartbeat records are transient",
    });

    const tasks = await readFile(join(workspaceRoot, "openspec/changes/add-auth/tasks.md"), "utf8");
    expect(link).toMatchObject({
      projectionStatus: "skipped",
      collaborationTaskId: "heartbeat_1",
    });
    expect(tasks).not.toContain("heartbeat_1");
    expect(tasks).not.toContain("heartbeat records are transient");
  });
});

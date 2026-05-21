import type {
  Artifact,
  PermissionRequest,
  WorkbenchSnapshot,
} from "@agenthub/contracts";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import {
  AgentHubWorkbench,
  DiffCard,
  PermissionCard,
  PlanCard,
  RuntimeStatusBadge,
  createWorkbenchViewModel,
  workbenchLayoutForWidth,
} from "../src/index.js";

const now = "2026-05-21T00:00:00.000Z";

function snapshot(status: "online" | "offline" | "degraded" | "active-running" = "online"): WorkbenchSnapshot {
  return {
    activeConversationId: "conversation_1",
    activeWorkspaceId: "workspace_1",
    agents: [
      {
        capabilityTags: ["planning"],
        createdAt: now,
        displayName: "Orchestrator",
        id: "agent_1",
        ownerUserId: "user_1",
        policy: {},
        providerId: "provider_1",
        role: "orchestrator",
        systemPrompt: "Plan work",
        updatedAt: now,
        workspaceId: "workspace_1",
      },
      {
        capabilityTags: ["code", "review"],
        createdAt: now,
        displayName: "Implementer",
        id: "agent_2",
        ownerUserId: "user_1",
        policy: {},
        providerId: "provider_1",
        role: "worker",
        systemPrompt: "Implement work",
        updatedAt: now,
        workspaceId: "workspace_1",
      },
    ],
    authenticated: true,
    availableActions: ["run.create"],
    conversations: [
      {
        archivedAt: null,
        createdAt: now,
        id: "conversation_1",
        kind: "group",
        ownerUserId: "user_1",
        title: "MVP workbench",
        updatedAt: now,
        workspaceId: "workspace_1",
      },
    ],
    messages: [
      {
        authorId: "agent_2",
        authorKind: "agent",
        conversationId: "conversation_1",
        createdAt: now,
        id: "message_1",
        ownerUserId: "user_1",
        parts: [{ text: "Implemented the shell", type: "text" }],
        replyToMessageId: null,
        updatedAt: now,
      },
    ],
    runtimeDevices: [
      {
        appVersion: "0.1.0",
        capabilities: ["git-diff", "permissions", "smoke-provider"],
        createdAt: now,
        displayName: "Local Runtime",
        id: "runtime_1",
        lastHeartbeatAt: now,
        ownerUserId: "user_1",
        platform: "macos",
        status,
        updatedAt: now,
      },
    ],
    runs: [
      {
        agentId: "agent_2",
        completedAt: null,
        conversationId: "conversation_1",
        createdAt: now,
        failureReason: null,
        id: "run_1",
        ownerUserId: "user_1",
        planId: "plan_1",
        startedAt: now,
        status: "running",
        updatedAt: now,
        workspaceId: "workspace_1",
      },
    ],
    userId: "user_1",
    workspaceMetadata: {
      dirty: false,
      displayName: "AgentHub",
      gitBaseCommit: "abc123",
      gitBranch: "main",
      localPathLabel: "~/IdeaProjects/agenthub",
      providerCapabilities: ["smoke"],
      workspaceId: "workspace_1",
    },
    workspaces: [
      {
        createdAt: now,
        defaultBranch: "main",
        id: "workspace_1",
        localPath: "/Users/chihayaanon/IdeaProjects/agenthub",
        name: "AgentHub",
        ownerUserId: "user_1",
        repoUrl: null,
        runtimeDeviceId: "runtime_1",
        runtimeKind: "local",
        updatedAt: now,
      },
    ],
  };
}

const pendingPermission: PermissionRequest = {
  actionKind: "command.run",
  command: "pnpm check",
  conversationId: "conversation_1",
  createdAt: now,
  decidedAt: null,
  id: "permission_1",
  ownerUserId: "user_1",
  paths: [],
  risk: "high",
  runId: "run_1",
  agentId: "agent_2",
  status: "pending",
  summary: "Run validation",
  updatedAt: now,
  workspaceId: "workspace_1",
};

const artifact: Artifact = {
  conversationId: "conversation_1",
  createdAt: now,
  id: "artifact_1",
  metadata: {},
  ownerUserId: "user_1",
  runId: "run_1",
  summary: "Updated shared UI",
  title: "UI artifact",
  type: "code",
  updatedAt: now,
  workspaceId: "workspace_1",
};

describe("@agenthub/ui components", () => {
  it("renders runtime status", () => {
    expect(renderToStaticMarkup(<RuntimeStatusBadge status="offline" />)).toContain("offline");
  });

  it("renders plan actions", () => {
    const html = renderToStaticMarkup(
      <PlanCard agents={["Orchestrator", "Implementer"]} status="draft" title="Plan" />,
    );
    expect(html).toContain("Approve");
    expect(html).toContain("Revise");
  });

  it("renders pending permission actions", () => {
    const html = renderToStaticMarkup(
      <PermissionCard risk="high" status="pending" summary="Run command" />,
    );
    expect(html).toContain("Allow once");
    expect(html).toContain("Deny");
  });

  it("renders diff summary and workbench", () => {
    const diff = renderToStaticMarkup(
      <DiffCard files={[{ path: "a.ts", status: "modified", insertions: 1, deletions: 2 }]} state="stale" />,
    );
    const workbench = renderToStaticMarkup(<AgentHubWorkbench snapshot={snapshot()} />);
    expect(diff).toContain("1 files changed");
    expect(workbench).toContain("Context Inspector");
    expect(workbench).toContain("Workspace navigation");
    expect(workbench).toContain('data-theme="dark"');
    expect(workbench).toContain('data-left-collapsed="false"');
    expect(workbench).toContain('data-right-collapsed="false"');
    expect(workbench).toContain("Collapse workspace navigation");
    expect(workbench).toContain("Collapse Context Inspector");
    expect(workbench).toContain("Switch to light mode");
  });

  it("maps snapshots into MVP view models without client-only transcript fixtures", () => {
    const model = createWorkbenchViewModel(snapshot(), {
      activeDiff: {
        baseCommit: "abc123",
        files: [{ path: "packages/ui/src/index.tsx", status: "modified", insertions: 20, deletions: 4 }],
        id: "diff_1",
        runId: "run_1",
        state: "metadata-only",
        warning: "Full diff requires runtime",
      },
      artifacts: [artifact],
      pendingPermissions: [pendingPermission],
      selection: { id: "permission_1", mode: "permission" },
    });

    expect(model.workspace.workspaceName).toBe("AgentHub");
    expect(model.runtime.canExecute).toBe(true);
    expect(model.timeline.map((item) => item.kind)).toEqual([
      "message",
      "run-event",
      "permission",
      "diff",
      "artifact",
    ]);
    expect(model.workspace.pendingPermissionCount).toBe(1);
    expect(model.inspector.selection?.mode).toBe("permission");
  });

  it("maps offline runtime to disabled composer state while preserving navigation", () => {
    const model = createWorkbenchViewModel(snapshot("offline"));
    const html = renderToStaticMarkup(<AgentHubWorkbench viewModel={model} />);

    expect(model.composer.disabled).toBe(true);
    expect(html).toContain("Agents");
    expect(html).toContain("Runs");
    expect(html).toContain("Desktop Runtime must be online");
  });

  it("normalizes unavailable inspector selection to empty state", () => {
    const model = createWorkbenchViewModel(snapshot(), {
      selection: { id: "missing_permission", mode: "permission" },
    });

    expect(model.inspector.selection).toBeNull();
  });

  it("renders inspector modes for permission, diff, runtime, artifact, run, and empty states", () => {
    const model = createWorkbenchViewModel(snapshot(), {
      activePlan: {
        assumptions: ["Runtime is online"],
        conversationId: "conversation_1",
        goal: "Finalize MVP workbench UI",
        id: "plan_1",
        status: "draft",
        steps: [
          {
            assignedAgentId: "agent_2",
            dependsOnStepIds: [],
            expectedArtifacts: ["diff"],
            id: "step_1",
            riskNotes: ["Requires visual QA"],
            title: "Implement workbench shell",
          },
        ],
        workspaceId: "workspace_1",
      },
      activeDiff: {
        baseCommit: "abc123",
        files: [{ path: "packages/ui/src/index.tsx", status: "modified", insertions: 20, deletions: 4 }],
        id: "diff_1",
        runId: "run_1",
        state: "metadata-only",
        warning: "Full diff requires runtime",
      },
      artifacts: [artifact],
      pendingPermissions: [pendingPermission],
    });

    expect(renderToStaticMarkup(<AgentHubWorkbench initialInspectorSelection={null} viewModel={model} />)).toContain(
      "Runtime details",
    );
    expect(
      renderToStaticMarkup(
        <AgentHubWorkbench initialInspectorSelection={{ id: "plan_1", mode: "plan" }} viewModel={model} />,
      ),
    ).toContain("Ask to revise");
    expect(
      renderToStaticMarkup(
        <AgentHubWorkbench initialInspectorSelection={{ id: "permission_1", mode: "permission" }} viewModel={model} />,
      ),
    ).toContain("Allow once");
    expect(
      renderToStaticMarkup(
        <AgentHubWorkbench initialInspectorSelection={{ id: "diff_1", mode: "diff" }} viewModel={model} />,
      ),
    ).toContain("Open full-screen diff review");
    expect(
      renderToStaticMarkup(
        <AgentHubWorkbench initialInspectorSelection={{ id: "runtime", mode: "runtime" }} viewModel={model} />,
      ),
    ).toContain("Capabilities");
    expect(
      renderToStaticMarkup(
        <AgentHubWorkbench initialInspectorSelection={{ id: "artifact_1", mode: "artifact" }} viewModel={model} />,
      ),
    ).toContain("Updated shared UI");
    expect(
      renderToStaticMarkup(
        <AgentHubWorkbench initialInspectorSelection={{ id: "run_1", mode: "run" }} viewModel={model} />,
      ),
    ).toContain("Run running");
    expect(renderToStaticMarkup(<AgentHubWorkbench initialFullScreenDiffId="diff_1" viewModel={model} />)).toContain(
      "Return to conversation",
    );
  });

  it("renders Control Plane offline and loading states", () => {
    expect(
      renderToStaticMarkup(<AgentHubWorkbench error="Control plane request failed" loading={false} />),
    ).toContain("Control Plane offline");
    expect(renderToStaticMarkup(<AgentHubWorkbench loading />)).toContain("Loading AgentHub");
  });

  it("renders empty conversation and narrow layout verification surfaces", () => {
    const emptySnapshot = { ...snapshot(), messages: [], runs: [] };
    const html = renderToStaticMarkup(<AgentHubWorkbench layoutMode="narrow" snapshot={emptySnapshot} />);
    expect(html).toContain("Empty conversation");
    expect(html).toContain('data-layout="narrow"');
  });

  it("maps viewport widths to responsive workbench layout modes", () => {
    expect(workbenchLayoutForWidth(1440)).toBe("wide");
    expect(workbenchLayoutForWidth(1024)).toBe("standard");
    expect(workbenchLayoutForWidth(800)).toBe("narrow");
    expect(workbenchLayoutForWidth(390)).toBe("mobile-web");
  });
});

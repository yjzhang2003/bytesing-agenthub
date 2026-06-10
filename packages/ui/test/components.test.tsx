import type { Artifact, PermissionRequest, WorkbenchSnapshot } from "@agenthub/contracts";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import {
  AgentMentionComposer,
  AgentsPage,
  Button,
  ChatTimeline,
  Dialog,
  AgentHubWorkbench,
  AgentHubTextInput,
  AgentHubThemeProvider,
  DiffCard,
  PermissionCard,
  PlanCard,
  RuntimeStatusBadge,
  Select,
  SettingsPage,
  Switch,
  createAgentHubTheme,
  createWorkbenchViewModel,
  workbenchLayoutForWidth,
} from "../src/index.js";
import { workbenchCss } from "../src/styles.js";

const now = "2026-05-21T00:00:00.000Z";

function snapshot(
  status: "online" | "offline" | "degraded" | "active-running" = "online",
): WorkbenchSnapshot {
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
      {
        capabilityTags: ["research"],
        createdAt: now,
        displayName: "Researcher",
        id: "agent_researcher",
        ownerUserId: "user_1",
        policy: {
          network: "ask",
          claudeCode: {
            permissionPreset: "full-access",
            runtimeProfileId: "research",
            mcpProfileId: "project",
            effort: "high",
            settingsSource: "managed",
            hooksPolicy: "enabled",
            session: { behavior: "new" },
          },
        },
        providerId: "provider_1",
        role: "worker",
        systemPrompt: "Research before coding.",
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
        notificationsMuted: false,
        ownerUserId: "user_1",
        pinnedAt: null,
        projectId: "project_1",
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
        parts: [
          { text: "Implemented **the shell**\n\n## Details\n- `pnpm check`", type: "markdown" },
        ],
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
    providerHealth: {
      providerMode: "claude-code",
      status: "connected",
      binaryPathLabel: "/usr/local/bin/claude",
      checkedAt: now,
      failureReason: null,
    },
    memoryHealth: {
      enabled: true,
      status: "connected",
      url: "http://127.0.0.1:3111",
      viewerUrl: "http://127.0.0.1:3113",
      checkedAt: now,
      failureReason: null,
    },
    claudeCodeDiscovery: {
      binaryPathLabel: "/usr/local/bin/claude",
      checkedAt: now,
      profileRootLabel: "~/.agenthub/claude-code",
      plugins: [
        { name: "superpowers", version: "5.1.0", pathLabel: "~/.claude/plugins/superpowers" },
      ],
      skills: [
        {
          name: "test-driven-development",
          description: "TDD workflow",
          pluginName: "superpowers",
          pathLabel: "~/.claude/plugins/superpowers/skills/test-driven-development/SKILL.md",
        },
      ],
      mcpServers: [{ name: "github", transport: "stdio" }],
      workspaceClaudeFiles: {
        claudeDir: true,
        settingsJson: true,
        settingsLocalJson: false,
        mcpJson: true,
        claudeMd: true,
      },
    },
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
        claudeCode: {
          permissionPreset: "full-access",
          effectivePermissionPreset: "full-access",
          runtimeProfileId: "engineering",
          mcpProfileId: "project",
          effort: "high",
          settingsSource: "managed",
          effectiveSettingsSource: "managed",
          hooksPolicy: "disabled",
          session: { behavior: "new" },
          overrideSource: "run-override",
        },
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
    projects: [
      {
        archivedAt: null,
        createdAt: now,
        dirty: false,
        gitBaseCommit: "abc123",
        gitBranch: "main",
        id: "project_1",
        isDefault: false,
        lastUsedAt: now,
        localPath: "/Users/chihayaanon/IdeaProjects/agenthub",
        localPathLabel: "~/IdeaProjects/agenthub",
        name: "AgentHub",
        ownerUserId: "user_1",
        repoUrl: null,
        runtimeDeviceId: "runtime_1",
        updatedAt: now,
        workspaceId: "workspace_1",
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
  it("renders first-party component contracts without vendor classes", () => {
    const html = renderToStaticMarkup(
      <AgentHubThemeProvider mode="light">
        <Button loading tone="accent" variant="solid">
          Save
        </Button>
        <Select
          ariaLabel="Role"
          value="worker"
          onValueChange={() => undefined}
          options={[{ label: "worker", value: "worker" }]}
        />
        <Switch ariaLabel="Dark mode" checked onCheckedChange={() => undefined} />
        <Dialog cancelLabel="Cancel" closeLabel="Close" confirmLabel="Add" open title="Add agent">
          <p>Select an agent</p>
        </Dialog>
      </AgentHubThemeProvider>,
    );
    const forbiddenNeedles = [
      ["a", "nt-"].join(""),
      ["agenthub", ["a", "ntd"].join("")].join("-"),
      "#62d98b",
    ];

    expect(html).toContain("agenthub-button");
    expect(html).toContain('data-loading="true"');
    expect(html).toContain('style="--agenthub-bg:#f4f4f1');
    expect(html).toContain("agenthub-select");
    expect(html).toContain('role="switch"');
    expect(html).toContain('aria-label="Dark mode"');
    expect(html).toContain('data-state="checked"');
    expect(html).toContain("agenthub-dialog");
    expect(html).toContain("aria-labelledby=");
    for (const forbiddenNeedle of forbiddenNeedles) {
      expect(html).not.toContain(forbiddenNeedle);
    }
  });

  it("renders Claude Code composer controls and passes selected run options", () => {
    const sends: unknown[] = [];
    const html = renderToStaticMarkup(
      <AgentMentionComposer
        selectedTarget="@Implementer"
        targets={[
          {
            capabilityTags: ["code"],
            id: "agent_2",
            label: "Implementer",
            providerLabel: "Claude Code",
            runtimeProvider: "claude-code",
            role: "worker",
            target: "@Implementer",
          },
        ]}
        claudeCodeControls={{
          permissionPreset: "ask-first",
          runtimeProfileId: "default",
          mcpProfileId: "none",
          effort: "medium",
          settingsSource: "managed",
          hooksPolicy: "disabled",
        }}
        onSend={(message, target, options) => sends.push({ message, target, options })}
      />,
    );

    expect(html).toContain("Permission");
    expect(html).toContain("Ask first");
    expect(html).not.toContain("Effort");
    expect(html).toContain("Voice input");
    expect(html).not.toContain("Runtime profile");
    expect(html).not.toContain("Advanced Claude Code controls");
    expect(html).not.toContain("Session");
    expect(html).not.toContain("session_");
  });

  it("does not include manual Claude Code session controls in composer submissions", () => {
    const html = renderToStaticMarkup(
      <AgentMentionComposer
        selectedTarget="@Implementer"
        targets={[
          {
            capabilityTags: ["code"],
            id: "agent_2",
            label: "Implementer",
            providerLabel: "Claude Code",
            runtimeProvider: "claude-code",
            role: "worker",
            target: "@Implementer",
          },
        ]}
        claudeCodeControls={{
          permissionPreset: "ask-first",
          runtimeProfileId: "default",
          mcpProfileId: "none",
          effort: "medium",
          settingsSource: "inherit",
          hooksPolicy: "disabled",
        }}
      />,
    );

    expect(html).not.toContain("sessionId");
    expect(html).not.toContain("sessionBehavior");
  });

  it("scopes Claude Code composer controls to the selected runtime target", () => {
    const html = renderToStaticMarkup(
      <AgentMentionComposer
        selectedTarget="@Reviewer"
        targets={[
          {
            capabilityTags: ["code"],
            id: "agent_2",
            label: "Implementer",
            providerLabel: "Claude Code",
            runtimeProvider: "claude-code",
            role: "worker",
            target: "@Implementer",
            claudeCodeControls: {
              permissionPreset: "full-access",
              runtimeProfileId: "default",
              mcpProfileId: "none",
              effort: "high",
              settingsSource: "managed",
              hooksPolicy: "disabled",
            },
          },
          {
            capabilityTags: ["review"],
            id: "agent_3",
            label: "Reviewer",
            providerLabel: "Codex",
            runtimeProvider: "codex",
            role: "worker",
            target: "@Reviewer",
          },
        ]}
        claudeCodeControls={{
          permissionPreset: "full-access",
          runtimeProfileId: "default",
          mcpProfileId: "none",
          effort: "high",
          settingsSource: "managed",
          hooksPolicy: "disabled",
        }}
      />,
    );

    expect(html).not.toContain("Permission");
    expect(html).not.toContain("Effort");
    expect(html).not.toContain("Full access");
  });

  it("maps AgentHub themes into AgentHub tokens and renders wrapped controls", () => {
    const darkTheme = createAgentHubTheme("dark");
    const lightTheme = createAgentHubTheme("light");
    const html = renderToStaticMarkup(
      <AgentHubThemeProvider mode="dark">
        <AgentHubTextInput aria-label="Wrapped input" disabled placeholder="Wrapped input" />
      </AgentHubThemeProvider>,
    );

    expect(darkTheme.tokens.background).toBe("#10110f");
    expect(lightTheme.tokens.background).toBe("#f4f4f1");
    expect(darkTheme.tokens.controlHeight).toBe(34);
    expect(html).toContain("agenthub-input");
    expect(html).toContain("Wrapped input");
    expect(html).toContain("disabled");
  });

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
      <DiffCard
        files={[{ path: "a.ts", status: "modified", insertions: 1, deletions: 2 }]}
        state="stale"
      />,
    );
    const workbench = renderToStaticMarkup(<AgentHubWorkbench snapshot={snapshot()} />);
    expect(diff).toContain("1 files changed");
    expect(workbench).toContain("Conversation details");
    expect(workbench).toContain("agenthub-message-status-ticker");
    expect(workbench).not.toContain("Open conversation info");
    expect(workbench).toContain("Open chat information for MVP workbench");
    expect(workbench).toContain("Open run details");
    expect(workbench).toContain("Workspace navigation");
    expect(workbench).toContain('data-theme="dark"');
    expect(workbench).toContain('data-left-collapsed="false"');
    expect(workbench).toContain('data-right-collapsed="false"');
    expect(workbench).toContain("Collapse workspace navigation");
    expect(workbench).toContain("Switch to light mode");
    expect(workbench).toContain(
      '.agenthub-workbench[data-layout="standard"] .agenthub-motion-right-panel',
    );
  });

  it("keeps run audit metadata out of the conversation timeline", () => {
    const runId = "dada973d-443b-4bec-9f5f-123456789abc";
    const sessionId = "session_very_internal_123";
    const model = createWorkbenchViewModel({
      ...snapshot(),
      runs: snapshot().runs.map((run) => ({
        ...run,
        id: runId,
        failureReason: "Claude Code exited with 1: Not logged in. Please run /login",
        status: "failed" as const,
        claudeCode: {
          permissionPreset: "ask-first" as const,
          effectivePermissionPreset: "ask-first" as const,
          runtimeProfileId: "default",
          mcpProfileId: null,
          effort: "medium" as const,
          settingsSource: "managed" as const,
          effectiveSettingsSource: "managed" as const,
          hooksPolicy: "disabled" as const,
          session: { behavior: "continue" as const, sessionId },
          overrideSource: "run-override" as const,
        },
      })),
    });
    const timelineText = model.timeline
      .flatMap((item) => [item.title, item.subtitle, ...item.body])
      .join("\n");

    expect(model.timeline.map((item) => item.kind)).not.toContain("run-event");
    expect(timelineText).not.toContain("Claude Code run failed");
    expect(timelineText).not.toContain("Ask first");
    expect(timelineText).not.toContain("Medium");
    expect(timelineText).not.toContain(runId);
    expect(timelineText).not.toContain(sessionId);
    expect(timelineText).not.toContain("run-override");
    expect(timelineText).not.toContain("Not logged in");
  });

  it("classifies Claude Code login failures while preserving diagnostics in run detail", () => {
    const rawFailure = "Claude Code exited with 1: Not logged in. Please run /login";
    const model = createWorkbenchViewModel({
      ...snapshot(),
      runs: snapshot().runs.map((run) => ({
        ...run,
        failureReason: rawFailure,
        status: "failed" as const,
      })),
    });
    const run = model.inspector.runs[0];

    expect(run.failureCategory).toBe("claude-code-auth-required");
    expect(run.failureSummary).toContain("Claude Code CLI needs login");
    expect(run.failureReason).toBe(rawFailure);

    const html = renderToStaticMarkup(
      <AgentHubWorkbench
        initialInspectorSelection={{ id: run.id, mode: "run" }}
        snapshot={{
          ...snapshot(),
          runs: snapshot().runs.map((current) => ({
            ...current,
            failureReason: rawFailure,
            status: "failed" as const,
          })),
        }}
      />,
    );
    expect(html).toContain("Claude Code CLI needs login");
    expect(html).toContain(rawFailure);
  });

  it("hides Claude Code login output message deltas from the conversation timeline", () => {
    const rawFailure = "Claude Code exited with 1: Not logged in. Please run /login";
    const runId = "run_auth";
    const model = createWorkbenchViewModel({
      ...snapshot(),
      messages: [
        ...snapshot().messages,
        {
          authorId: "agent_2",
          authorKind: "agent" as const,
          conversationId: "conversation_1",
          createdAt: now,
          id: "message_auth",
          ownerUserId: "user_1",
          parts: [{ text: "Not logged in · Please run /login", type: "markdown" as const, runId }],
          replyToMessageId: null,
          updatedAt: now,
        },
      ],
      runs: snapshot().runs.map((run) => ({
        ...run,
        id: runId,
        failureReason: rawFailure,
        status: "failed" as const,
      })),
    });
    const timelineText = model.timeline
      .flatMap((item) => [item.title, item.subtitle, ...item.body])
      .join("\n");

    expect(timelineText).not.toContain("Claude Code run failed");
    expect(timelineText).not.toContain("Not logged in");
    expect(timelineText).not.toContain("/login");
  });

  it("does not render raw Claude Code login text passed directly to the timeline", () => {
    const html = renderToStaticMarkup(
      <ChatTimeline
        items={[
          {
            authorId: "agent_1",
            authorKind: "agent",
            body: ["Not logged in · Please run /login"],
            id: "legacy-auth-message",
            kind: "message",
            state: "success",
            subtitle: "agent message",
            title: "Orchestrator",
          },
          {
            body: ["Ask first · Medium"],
            id: "run-auth",
            kind: "run-event",
            state: "metadata-only",
            subtitle: "Orchestrator",
            title: "Claude Code run failed",
          },
        ]}
      />,
    );

    expect(html).toContain("Claude Code run failed");
    expect(html).not.toContain("Not logged in");
    expect(html).not.toContain("/login");
  });

  it("shows Claude Code login guidance in connection diagnostics", () => {
    const rawFailure = "Claude Code exited with 1: Not logged in. Please run /login";
    const model = createWorkbenchViewModel({
      ...snapshot(),
      providerHealth: {
        providerMode: "claude-code",
        status: "unavailable",
        binaryPathLabel: "/usr/local/bin/claude",
        checkedAt: now,
        failureReason: rawFailure,
      },
    });

    const provider = model.connections.items.find((item) => item.id === "provider");
    expect(provider?.failureReason).toContain("Claude Code CLI needs login");
    expect(provider?.setupGuidance?.messageKey).toBe("connections.guidance.authRequired");
    expect(JSON.stringify(provider?.metadata)).toContain(rawFailure);
    const html = renderToStaticMarkup(
      <AgentHubWorkbench initialCenterView="connections" viewModel={model} />,
    );
    expect(html).toContain("Authenticate the local Claude Code CLI");
  });

  it("renders the chat title as the conversation detail action and keeps run detail in the header", () => {
    const html = renderToStaticMarkup(<AgentHubWorkbench snapshot={snapshot()} />);

    expect(html).not.toContain("Open conversation info");
    expect(html).toContain("Open chat information for MVP workbench");
    expect(html).toContain("Open run details");
    expect(html.match(/aria-label="Open chat information for MVP workbench"/g)).toHaveLength(1);
    expect(html).not.toContain("agenthub-mobile-detail-action");
    expect(html).toContain("Collapse Context Inspector");
  });

  it("disables the run detail header action when the conversation has no runs", () => {
    const html = renderToStaticMarkup(<AgentHubWorkbench snapshot={{ ...snapshot(), runs: [] }} />);

    expect(html).toMatch(/aria-label="Open run details"[^>]*disabled=""/);
  });

  it("renders Claude Code agent warnings and discovery summaries", () => {
    const model = createWorkbenchViewModel(snapshot());
    const agents = renderToStaticMarkup(
      <AgentsPage model={model} selectedAgentId="agent_researcher" />,
    );

    expect(agents).toContain("Claude Code defaults");
    expect(agents).toContain("Runtime");
    expect(agents).toContain("Provider");
    expect(agents).toContain("Full access is a high-risk default");
    expect(agents).toContain("Hooks may execute local commands");
    const provider = model.connections.items.find((item) => item.id === "provider");
    expect(model.connections.items.map((item) => item.label)).not.toContain(
      "Claude Code capabilities",
    );
    expect(JSON.stringify(provider?.detailGroups)).toContain("superpowers");
    expect(JSON.stringify(provider?.detailGroups)).toContain("test-driven-development");
  });

  it("renders conversation messages as IM bubbles and active agent replies as one random status word with bouncing dots", () => {
    const html = renderToStaticMarkup(<AgentHubWorkbench snapshot={snapshot()} />);
    const statusWords = [
      "Absorbing",
      "Analyzing",
      "Building",
      "Compiling",
      "Composing",
      "Computing",
      "Diagnosing",
      "Generating",
      "Inferring",
      "Optimizing",
      "Processing",
      "Synthesizing",
    ];

    expect(html).toContain("agenthub-message-bubble");
    expect(html).toContain('data-author="agent"');
    expect(html).toContain("agenthub-message-avatar");
    expect(html).toContain('aria-label="Open Implementer agent"');
    expect(html).not.toContain("agent message");
    expect(html).toContain("Implemented ");
    expect(html).toContain("<strong>the shell</strong>");
    expect(html).toContain("<h2>Details</h2>");
    expect(html).toContain("<code>pnpm check</code>");
    expect(html).toContain("agenthub-message-status-ticker");
    expect(html).toContain("agenthub-message-status-dot");
    expect(html.match(/class="agenthub-message-status-dot"/g)).toHaveLength(3);
    expect(statusWords.filter((word) => html.includes(`${word}<`))).toHaveLength(1);
    expect(html).not.toContain(
      ".agenthub-message-bubble:has(.agenthub-message-status-ticker) {\n  min-width: 148px",
    );
    expect(html).not.toContain("agenthub-message-loading-dot");
    expect(html).not.toContain("Writing a reply");
    expect(html).not.toContain("Full access · High");
    expect(html).not.toContain("Run completed");
    expect(html).not.toContain("Claude Code process completed");
  });

  it("keeps hover-border controls transparent until interactive states", () => {
    const html = renderToStaticMarkup(<AgentHubWorkbench snapshot={snapshot()} />);

    expect(html).toContain("agenthub-hover-control");
    expect(html).toContain("border: 1px solid transparent");
    expect(html).toContain(".agenthub-hover-control:hover:not(:disabled)");
    expect(html).toContain(".agenthub-hover-control:focus-visible");
  });

  it("renders conversation rows as IM list rows without selected card borders", () => {
    const html = renderToStaticMarkup(<AgentHubWorkbench snapshot={snapshot()} />);

    expect(html).toContain("agenthub-conversation-row");
    expect(html).toContain('.agenthub-conversation-row[aria-current="page"]');
    expect(html).toContain("grid-template-areas:");
    expect(html).toContain("min-height: 64px");
    expect(html).toContain("border-radius: 0");
    expect(html).toContain("border-color: transparent");
    expect(html).not.toContain("translateY(-1px)");
    expect(html).not.toContain("translateX(2px)");
  });

  it("uses a denser IM top bar with coordinated content rows", () => {
    const html = renderToStaticMarkup(<AgentHubWorkbench snapshot={snapshot()} />);

    expect(html).toContain("grid-template-rows: 64px minmax(0, 1fr) auto");
    expect(html).toContain("height: 100dvh");
    expect(html).toContain("min-height: 64px");
    expect(html).toContain("font-size: 14px");
    expect(html).toContain("max-height: 100%");
  });

  it("keeps the timeline scrollable while the composer stays anchored", () => {
    const html = renderToStaticMarkup(<AgentHubWorkbench snapshot={snapshot()} />);

    expect(html).toContain("overflow-y: auto");
    expect(html).toContain("overscroll-behavior: contain");
    expect(html).toContain("position: sticky");
    expect(html).toContain("bottom: 0");
  });

  it("adds restrained motion for hover controls, composer growth, and side panels", () => {
    const html = renderToStaticMarkup(<AgentHubWorkbench snapshot={snapshot()} />);

    expect(html).toContain("--agenthub-motion-fast");
    expect(html).toContain("--agenthub-motion-medium");
    expect(html).toContain("transition: height var(--agenthub-motion-medium)");
    expect(html).toContain("agenthub-composer-suggestions");
    expect(html).toContain("agenthub-motion-left-panel");
    expect(html).toContain("agenthub-motion-right-panel");
    expect(html).toContain("@media (prefers-reduced-motion: reduce)");
  });

  it("defaults Claude Code composer settings to inherited user configuration", () => {
    const model = createWorkbenchViewModel(snapshot());

    expect(model.composer.claudeCodeControls?.settingsSource).toBe("inherit");
  });

  it("models conversation-scoped agent settings for participants and composer targets", () => {
    const model = createWorkbenchViewModel(
      {
        ...snapshot(),
        conversationParticipants: [
          {
            id: "participant_1",
            ownerUserId: "user_1",
            conversationId: "conversation_1",
            agentId: "agent_1",
            addedByUserId: "user_1",
            archivedAt: null,
            createdAt: "2026-05-21T00:00:00.000Z",
            updatedAt: "2026-05-21T00:00:00.000Z",
          },
          {
            id: "participant_2",
            ownerUserId: "user_1",
            conversationId: "conversation_1",
            agentId: "agent_2",
            addedByUserId: "user_1",
            archivedAt: null,
            conversationAgentSettings: {
              displayNameOverride: "Chat implementer",
              responsibilityOverride: "Only implement frontend changes.",
              enabled: false,
              participationMode: "manual",
              priority: "high",
              quietMode: true,
              contextScope: "conversation-artifacts",
              includeHistorySummary: false,
              scopedInstructions: "Keep replies short.",
              requireRunConfirmation: true,
              allowAutoDispatch: false,
            },
            createdAt: "2026-05-21T00:00:00.000Z",
            updatedAt: "2026-05-21T00:00:00.000Z",
          },
        ],
      },
      { selection: { id: "conversation_1:agent_2", mode: "conversation-agent" } },
    );

    expect(model.inspector.selection).toEqual({
      id: "conversation_1:agent_2",
      mode: "conversation-agent",
    });
    expect(model.inspector.agentInChat).toMatchObject({
      id: "conversation_1:agent_2",
      agentId: "agent_2",
      conversationId: "conversation_1",
      label: "Chat implementer",
      globalLabel: "Implementer",
      responsibility: "Only implement frontend changes.",
      enabled: false,
      participationMode: "manual",
      priority: "high",
      contextScope: "conversation-artifacts",
      allowAutoDispatch: false,
    });
    expect(
      model.inspector.chatInfo?.participants.find((participant) => participant.id === "agent_2"),
    ).toMatchObject({ label: "Chat implementer", target: "@Chat implementer" });
    expect(model.composer.targets.map((target) => target.id)).not.toContain("agent_2");
  });

  it("renders agent-in-chat settings in the conversation detail layout language", () => {
    const html = renderToStaticMarkup(
      <AgentHubWorkbench
        initialInspectorSelection={{ id: "conversation_1:agent_2", mode: "conversation-agent" }}
        snapshot={{
          ...snapshot(),
          conversationParticipants: [
            {
              id: "participant_1",
              ownerUserId: "user_1",
              conversationId: "conversation_1",
              agentId: "agent_1",
              addedByUserId: "user_1",
              archivedAt: null,
              createdAt: "2026-05-21T00:00:00.000Z",
              updatedAt: "2026-05-21T00:00:00.000Z",
            },
            {
              id: "participant_2",
              ownerUserId: "user_1",
              conversationId: "conversation_1",
              agentId: "agent_2",
              addedByUserId: "user_1",
              archivedAt: null,
              conversationAgentSettings: {
                displayNameOverride: "Chat implementer",
                responsibilityOverride: "Only implement frontend changes.",
                notes: "Local to this chat.",
                enabled: true,
                participationMode: "orchestrated",
                priority: "high",
                quietMode: true,
                contextScope: "conversation-artifacts",
                includeHistorySummary: false,
                scopedInstructions: "Keep replies short.",
                requireRunConfirmation: true,
                allowAutoDispatch: false,
              },
              createdAt: "2026-05-21T00:00:00.000Z",
              updatedAt: "2026-05-21T00:00:00.000Z",
            },
          ],
        }}
      />,
    );

    expect(html).toContain("Agent in this chat");
    expect(html).toContain("Chat implementer");
    expect(html).toContain("Only implement frontend changes.");
    expect(html).toContain("Global defaults");
    expect(html).toContain("Implementer");
    expect(html).toContain("Open global agent settings");
    expect(html).toContain("Remove agent from this chat");
    expect(html).toContain("agenthub-chat-global-agent-settings-button");
    expect(html).toContain("agenthub-chat-delete-conversation-button");
    expect(html).toContain("agenthub-inspector-body");
    expect(html).toContain("agenthub-agent-in-chat-detail");
    expect(html).toContain("agenthub-agent-in-chat-profile");
    expect(html).toContain("Worker · Claude Code");
    expect(html).toContain("Global name: Implementer");
    expect(html).toContain("agenthub-chat-settings-group");
    expect(html).toContain("agenthub-chat-settings-row");
    expect(html).not.toContain("Back to conversation details");
    expect(html).toContain("agenthub-inspector-floating-actions");
    expect(html).not.toContain(">Clear<");
    expect(workbenchCss).toContain(".agenthub-agent-in-chat-detail .agenthub-input");
    expect(workbenchCss).toContain("--agenthub-agent-in-chat-label-width: 128px");
    expect(workbenchCss).toContain(
      "grid-template-columns: var(--agenthub-agent-in-chat-label-width) minmax(0, 1fr)",
    );
    expect(workbenchCss).toContain(".agenthub-agent-in-chat-detail .agenthub-select");
    expect(workbenchCss).toContain(".agenthub-agent-in-chat-profile");
    expect(workbenchCss).toContain(".agenthub-button.agenthub-chat-global-agent-settings-button");
    expect(workbenchCss).toMatch(/\.agenthub-chat-delete-row \{[^}]*display: grid;[^}]*gap: 8px;/);
    expect(workbenchCss).toContain("grid-template-columns: 56px minmax(0, 1fr)");
    expect(workbenchCss).toContain("overflow-wrap: anywhere");
    expect(workbenchCss).toContain("max-width: none");
    expect(workbenchCss).toContain("border-color: transparent");
    expect(workbenchCss).toContain("text-align: right");
  });

  it("renders the composer as a compact rounded input with trigger-based suggestions", () => {
    const html = renderToStaticMarkup(
      <AgentMentionComposer
        selectedTarget="@Orchestrator"
        targets={["@Orchestrator", "@Implementer"]}
      />,
    );
    const workbench = renderToStaticMarkup(<AgentHubWorkbench snapshot={snapshot()} />);

    expect(html).toContain("agenthub-composer-box");
    expect(html).toContain("agenthub-input");
    expect(html).toContain("agenthub-button");
    expect(html).toContain('data-multiline="false"');
    expect(html).toContain("agenthub-composer-actions");
    expect(html).toContain("agenthub-composer-send");
    expect(workbench).toContain("resize: none");
    expect(workbench).toContain('grid-template-areas: "input actions"');
    expect(workbench).toContain('.agenthub-composer-box[data-multiline="true"]');
    expect(html).toContain("Message an agent, @mention or /command");
    expect(workbench).toContain("agenthub-composer-suggestions");
    expect(html).not.toContain("Agent target");
    expect(html).not.toContain(">Target<");
    expect(html).not.toContain(">Plan Mode<");
    expect(html).not.toContain("agenthub-composer-toolbar");
    expect(html).not.toContain("agenthub-composer-footer");
  });

  it("renders shared workbench chrome in Simplified Chinese when requested", () => {
    const model = createWorkbenchViewModel(snapshot(), { pendingPermissions: [pendingPermission] });
    const workbench = renderToStaticMarkup(
      <AgentHubWorkbench locale="zh-CN" snapshot={snapshot()} />,
    );
    const settingsGeneral = renderToStaticMarkup(
      <SettingsPage
        enterToSend
        locale="zh-CN"
        model={model}
        onSelect={() => undefined}
        onToggleEnterToSend={() => undefined}
        onToggleTheme={() => undefined}
        selectedCategory="general"
        theme="dark"
      />,
    );
    const settingsShortcuts = renderToStaticMarkup(
      <SettingsPage
        enterToSend
        locale="zh-CN"
        model={model}
        onSelect={() => undefined}
        onToggleEnterToSend={() => undefined}
        onToggleTheme={() => undefined}
        selectedCategory="shortcuts"
        theme="dark"
      />,
    );
    const settingsNotifications = renderToStaticMarkup(
      <SettingsPage
        enterToSend
        locale="zh-CN"
        model={model}
        onSelect={() => undefined}
        onToggleEnterToSend={() => undefined}
        onToggleTheme={() => undefined}
        selectedCategory="notifications"
        theme="dark"
      />,
    );
    const composer = renderToStaticMarkup(
      <AgentMentionComposer
        locale="zh-CN"
        selectedTarget="@Orchestrator"
        targets={["@Orchestrator", "@Implementer"]}
      />,
    );

    expect(workbench).toContain("工作区导航");
    expect(workbench).toContain("切换到浅色模式");
    expect(settingsGeneral).toContain("通用");
    expect(settingsGeneral).toContain("外观");
    expect(settingsShortcuts).toContain("回车发送消息");
    expect(settingsNotifications).toContain("权限");
    expect(composer).toContain("给智能体发送消息");
    expect(composer).toContain("发送消息");
  });

  it("keeps chat primary in narrow layouts with side panel toggles", () => {
    const html = renderToStaticMarkup(
      <AgentHubWorkbench layoutMode="narrow" snapshot={snapshot()} />,
    );

    expect(html).toContain('data-layout="narrow"');
    expect(html).toContain('data-mobile-left-open="false"');
    expect(html).toContain('data-mobile-right-open="false"');
    expect(html).toContain("agenthub-mobile-panel-actions");
    expect(html).toContain("Open workspace navigation");
    expect(html).not.toContain("Open conversation info");
    expect(html).toContain("Open chat information for MVP workbench");
    expect(html).toContain("agenthub-chat-thread");
    expect(html).toContain(".agenthub-mobile-panel-actions { display: none;");
    expect(html).toContain('.agenthub-workbench[data-layout="narrow"] .agenthub-motion-left-panel');
    expect(html).toContain(
      '.agenthub-workbench[data-layout="narrow"] .agenthub-motion-right-panel',
    );
  });

  it("hides mobile panel controls in standard desktop layouts", () => {
    const html = renderToStaticMarkup(
      <AgentHubWorkbench layoutMode="standard" snapshot={snapshot()} />,
    );

    expect(html).toContain('data-layout="standard"');
    expect(html).toContain(".agenthub-mobile-panel-actions { display: none;");
    expect(html).not.toContain(
      '.agenthub-workbench[data-layout="standard"] .agenthub-mobile-panel-actions { display: inline-flex; }',
    );
  });

  it("keeps workspace metadata out of the left navigation chrome", () => {
    const html = renderToStaticMarkup(<AgentHubWorkbench snapshot={snapshot()} />);

    expect(html).not.toContain('aria-label="Workspace status"');
    expect(html).toContain("Settings");
    expect(html).toContain("Runtime");
  });

  it("uses a WeChat-style split left navigation with rail tools and conversation search", () => {
    const html = renderToStaticMarkup(<AgentHubWorkbench snapshot={snapshot()} />);

    expect(html).toContain("agenthub-left-rail");
    expect(html).toContain("agenthub-chat-list-panel");
    expect(html).toContain("agenthub-chat-list-header");
    expect(html).toContain('aria-label="Search conversations"');
    expect(html).toContain("agenthub-sidebar-search");
    expect(html).toContain("agenthub-rail-button");
    expect(html).toContain("grid-template-columns: 58px minmax(0, 1fr)");
    expect(html).toContain("--agenthub-left-column: clamp(300px, 24vw, 340px)");
    expect(html).toContain("grid-template-columns: var(--agenthub-left-column) minmax(0, 1fr)");
    expect(html).toContain("grid-template-rows: 64px minmax(0, 1fr)");
    expect(html).toContain("border-bottom: 1px solid var(--agenthub-border)");
  });

  it("pins settings to the bottom navigation and renders a real settings page", () => {
    const model = createWorkbenchViewModel(snapshot(), { pendingPermissions: [pendingPermission] });
    const workbench = renderToStaticMarkup(
      <AgentHubWorkbench
        initialCenterView="settings"
        onSignOut={() => undefined}
        viewModel={model}
      />,
    );
    const settings = renderToStaticMarkup(
      <SettingsPage
        enterToSend
        model={model}
        onSelect={() => undefined}
        onToggleEnterToSend={() => undefined}
        onToggleTheme={() => undefined}
        selectedCategory="general"
        theme="dark"
      />,
    );
    const settingsAccount = renderToStaticMarkup(
      <SettingsPage
        enterToSend
        model={model}
        onSelect={() => undefined}
        onSignOut={() => undefined}
        onToggleEnterToSend={() => undefined}
        onToggleTheme={() => undefined}
        selectedCategory="account"
        theme="dark"
      />,
    );

    expect(workbench).toContain("agenthub-nav-bottom");
    const navBottom = workbench.slice(
      workbench.indexOf("agenthub-nav-bottom"),
      workbench.indexOf("</div>", workbench.indexOf("agenthub-nav-bottom")),
    );
    expect(navBottom.indexOf("Switch to light mode")).toBeGreaterThanOrEqual(0);
    expect(navBottom.indexOf("Switch to light mode")).toBeLessThan(
      navBottom.indexOf('aria-label="Settings"'),
    );
    const renderedConversationHeaderStart = workbench.indexOf(
      '<header class="agenthub-conversation-header"',
    );
    const conversationHeader = workbench.slice(
      renderedConversationHeaderStart,
      workbench.indexOf("</header>", renderedConversationHeaderStart),
    );
    expect(conversationHeader).not.toContain("Switch to light mode");
    expect(workbench).toContain('aria-current="page"');
    expect(workbench).toContain('data-view="settings"');
    expect(workbench).toContain('aria-label="Settings page"');
    expect(settingsAccount).toContain("~/IdeaProjects/agenthub");
    expect(settingsAccount).toContain("Sign out");
    expect(settingsAccount).toContain("agenthub-settings-sign-out");
    expect(workbench).toContain("agenthub-agent-directory-sidebar agenthub-settings-directory");
    expect(workbench).toContain("agenthub-agent-contact-row agenthub-settings-category-row");
    expect(workbench).toContain('aria-label="Search settings"');
    expect(settings).toContain("agenthub-agent-detail agenthub-settings-detail");
    expect(settings).toContain("agenthub-agent-profile");
    expect(settings).toContain("agenthub-agent-editor agenthub-settings-editor");
    expect(settings).toContain("agenthub-agent-settings-group");
    expect(settings).toContain("agenthub-agent-settings-body");
    expect(settings).toContain("agenthub-agent-readonly-row");
    expect(workbench).toContain("Account &amp; storage");
    expect(workbench).toContain("Shortcuts");
    expect(workbench).toContain("Notifications");
    expect(workbench).toContain("Plugins");
    expect(settings).toContain("General");
    expect(settings).toContain("Appearance");
    expect(settings).toContain("agenthub-switch");
    expect(settings).not.toContain("Claude Code");
    expect(settings).not.toContain("Long-term memory");
    expect(settings).not.toContain("Create agent role");
  });

  it("uses compact tokenized Settings typography and density", () => {
    const model = createWorkbenchViewModel(snapshot(), { pendingPermissions: [pendingPermission] });
    const html = renderToStaticMarkup(
      <AgentHubWorkbench initialCenterView="settings" viewModel={model} />,
    );

    const settingsGridCss =
      html.match(/\.agenthub-workbench\[data-center-view="settings"\] \{[^}]*\}/)?.[0] ?? "";
    const contactRowCss = html.match(/\.agenthub-agent-contact-row \{[^}]*\}/)?.[0] ?? "";
    const detailCss = html.match(/\.agenthub-agent-detail \{[^}]*\}/)?.[0] ?? "";
    const groupCss = html.match(/\.agenthub-agent-settings-group \{[^}]*\}/)?.[0] ?? "";
    const rowCss =
      html.match(
        /\.agenthub-agent-editor label,[\s\S]*?\.agenthub-agent-readonly-row \{[^}]*\}/,
      )?.[0] ?? "";
    const settingsCss = html.slice(
      html.indexOf(".agenthub-settings-page"),
      html.indexOf(".agenthub-agents-page"),
    );

    expect(settingsGridCss).toContain(
      "grid-template-columns: var(--agenthub-left-column) minmax(0, 1fr) 0px",
    );
    expect(html).toContain("agenthub-agent-directory-sidebar agenthub-settings-directory");
    expect(html).toContain("agenthub-agent-contact-row agenthub-settings-category-row");
    expect(html).toContain("agenthub-agent-detail agenthub-settings-detail");
    expect(html).toContain("agenthub-agent-profile");
    expect(html).toContain("agenthub-agent-settings-group");
    expect(contactRowCss).toContain("min-height: 64px");
    expect(detailCss).toContain("padding: 28px var(--agenthub-agent-detail-x) 104px");
    expect(groupCss).toContain("border-radius: var(--agenthub-radius)");
    expect(rowCss).toContain("grid-template-columns: minmax(136px, 28%) minmax(0, 1fr)");
    expect(rowCss).toContain("min-height: 54px");
    expect(rowCss).toContain("gap: 14px");
    expect(settingsCss).not.toContain(".agenthub-settings-nav-item {");
    expect(settingsCss).not.toContain(".agenthub-settings-content {");
    expect(settingsCss).not.toContain(".agenthub-settings-group {");
    expect(settingsCss).not.toContain(".agenthub-settings-row {");
    expect(settingsCss).not.toContain("font-size: 20px");
    expect(settingsCss).not.toContain("font-size: 22px");
    expect(settingsCss).not.toContain("font-size: 19px");
  });

  it("renders a dedicated agents page with a shared search field and readable configuration", () => {
    const model = createWorkbenchViewModel(snapshot());
    const html = renderToStaticMarkup(
      <AgentHubWorkbench
        initialCenterView="agents"
        viewModel={model}
        onArchiveAgentRole={() => undefined}
      />,
    );

    expect(html).toContain('data-center-view="agents"');
    expect(html).toContain("--agenthub-directory-column:316px");
    expect(html).toContain('data-view="agents"');
    expect(html).toContain("Agent roles");
    expect(html).toContain('aria-label="Agent directory"');
    expect(html).toContain('aria-label="Resize agent directory"');
    expect(html).toContain('aria-label="Search agents"');
    expect(html).toContain("agenthub-sidebar-search");
    expect(html).not.toMatch(/agenthub-conversation-search[\s\S]*agenthub-input/);
    expect(html).toContain("agenthub-avatar");
    expect(html).toContain("agenthub-badge");
    expect(html).toContain("agenthub-select");
    expect(html).toContain("Researcher");
    expect(html).toContain("Plan work");
    expect(html).toContain("Responsibilities");
    expect(html).toContain("Capability tags");
    expect(html).toContain("Basic information");
    expect(html).toContain("Advanced configuration");
    expect(html).toContain("agenthub-agent-readonly-row");
    expect(html).toContain("Memory namespace");
    expect(html).not.toContain("Configuration summary");
    expect(html).toContain("agenthub-agent-settings-group");
    expect(html).toContain("agenthub-agent-settings-body");
    expect(html).toContain("<summary");
    const agentProfileCss = html.match(/\.agenthub-agent-profile \{[^}]*\}/)?.[0] ?? "";
    expect(agentProfileCss).toContain(".agenthub-agent-profile");
    expect(agentProfileCss).not.toContain("border-bottom");
    const formActionsCss = html.match(/\.agenthub-agent-form-actions \{[^}]*\}/)?.[0] ?? "";
    expect(formActionsCss).toContain("width: min(100%, 820px)");
    expect(formActionsCss).toContain("justify-content: flex-end");
    const deleteButtonCss =
      html.match(/\.agenthub-button\.agenthub-agent-delete-button \{[^}]*\}/)?.[0] ?? "";
    expect(deleteButtonCss).toContain("border-color: transparent");
    expect(html).toContain("--agenthub-type-title: 16px");
    expect(html).toContain(
      ".agenthub-agent-settings-group > header,\n.agenthub-agent-advanced summary",
    );
    expect(html).toContain(".agenthub-agent-advanced summary::-webkit-details-marker");
    expect(html).toContain("list-style: none");
    const agentEditorLabelCss =
      html.match(
        /\.agenthub-agent-editor label,[\s\S]*?\.agenthub-agent-readonly-row \{[^}]*\}/,
      )?.[0] ?? "";
    expect(agentEditorLabelCss).toContain(
      "grid-template-columns: minmax(136px, 28%) minmax(0, 1fr)",
    );
    expect(agentEditorLabelCss).not.toContain("border-top");
    const agentEditorInputCss =
      html.match(
        /\.agenthub-agent-editor input,[\s\S]*?\.agenthub-role-form textarea \{[^}]*\}/,
      )?.[0] ?? "";
    expect(agentEditorInputCss).toContain("border: 1px solid transparent");
    expect(html).toContain(".agenthub-agent-editor .agenthub-input:hover");
    expect(html).not.toMatch(/<textarea(?=[^>]*aria-label="Responsibilities")[^>]*\srows=/);
    expect(html).not.toMatch(/<textarea(?=[^>]*aria-label="System prompt")[^>]*\srows=/);
    expect(html).not.toMatch(/<textarea(?=[^>]*aria-label="Policy JSON")[^>]*\srows=/);
    expect(html).toContain("max-height: 150px");
    expect(html).toContain(".agenthub-workbench textarea {\n  resize: none;");
    expect(html).toContain(".agenthub-agent-editor .agenthub-select");
    expect(html).not.toMatch(/agenthub-agent-profile-actions[\s\S]*New agent/);
    expect(html).toContain("agenthub-agent-form-actions");
    expect(html).toContain("agenthub-agent-delete-button");
    expect(html).toContain("Delete agent");
    expect(html).toContain("New conversation");
    expect(html).not.toContain("Save changes");
    expect(html).toContain("Default agent");
    expect(html).toContain('disabled="" type="button"');
    expect(html).not.toContain('aria-label="Conversation navigation"');
    expect(html).not.toContain("Conversation details");
  });

  it("renders template-assisted agent creation inside one create interface", () => {
    const model = createWorkbenchViewModel(snapshot());
    const html = renderToStaticMarkup(<AgentsPage model={model} selectedAgentId={null} />);

    expect(html).toContain("Start from a template");
    expect(html).toContain("agenthub-agent-settings-group");
    expect(html).toContain("agenthub-agent-settings-body");
    expect(html).toContain("Orchestrator");
    expect(html).toContain("Implementer");
    expect(html).toContain("Reviewer");
    expect(html).toContain("Researcher");
    expect(html).toContain("Responsibilities");
    expect(html).toContain("Advanced configuration");
    expect(html).toContain("<summary");
    expect(html).toContain("Policy JSON");
    expect(html).not.toContain("New conversation");
    expect(html).not.toContain("Save changes");
    expect(html).not.toContain("Choose template");
  });

  it("renders a dedicated connections page for provider-level connections", () => {
    const model = createWorkbenchViewModel(snapshot());
    const html = renderToStaticMarkup(
      <AgentHubWorkbench initialCenterView="connections" viewModel={model} />,
    );

    expect(html).toContain('data-center-view="connections"');
    expect(html).toContain('data-view="connections"');
    expect(html).toContain("Connections");
    expect(html).toContain('aria-label="Provider connections"');
    expect(html).toContain("agenthub-connection-directory");
    expect(html).toContain("agenthub-agent-directory-sidebar");
    expect(html).toContain("agenthub-agent-detail");
    expect(html).toContain("agenthub-agent-settings-group");
    expect(html).toContain("Claude Code");
    expect(html).toContain("agenthub-avatar");
    expect(html).toContain("agenthub-badge");
    expect(html).toContain('aria-label="Resize provider list"');
    expect(html).toContain("connected");
    expect(html).toContain("/usr/local/bin/claude");
    expect(html).toContain("Capabilities");
    expect(html).toContain("superpowers");
    expect(html).toContain("test-driven-development");
    expect(html).toContain("Refresh capabilities");
    expect(html).toMatch(
      /agenthub-connection-profile[\s\S]*Check connection[\s\S]*Refresh capabilities[\s\S]*<\/header>/,
    );
    expect(html).toContain("System Claude environment");
    expect(html).toContain("Inherited from ~/.claude when settings source is inherit");
    expect(html).toContain("Dependencies");
    expect(html).toContain("AgentHub-managed profile");
    expect(html).toContain("Check connection");
    expect(html).toContain("Check all");
    expect(html).toContain("Codex");
    expect(html).toContain("disabled");
    expect(html).not.toContain("Claude Code capabilities");
    expect(html).not.toContain("Desktop Runtime");
    expect(html).not.toContain("agentmemory");
    expect(html).not.toContain('aria-label="Conversation navigation"');
    expect(html).not.toContain("Conversation details");
    expect(html).not.toContain("agenthub-connections-panel");
  });

  it("renders Connections offline, failed, disabled, and checking states", () => {
    const failedSnapshot = {
      ...snapshot("offline"),
      providerHealth: {
        providerMode: "claude-code" as const,
        status: "missing" as const,
        binaryPathLabel: "claude",
        checkedAt: now,
        failureReason: "Claude Code binary was not found",
      },
      memoryHealth: {
        enabled: false,
        status: "disabled" as const,
        url: "http://127.0.0.1:3111",
        viewerUrl: "http://127.0.0.1:3113",
        checkedAt: now,
        failureReason: null,
      },
    };
    const model = createWorkbenchViewModel(failedSnapshot, {
      checkingConnectionIds: ["provider"],
    });
    const html = renderToStaticMarkup(
      <AgentHubWorkbench initialCenterView="connections" viewModel={model} />,
    );

    expect(html).toContain("Checking");
    expect(html).toContain("Claude Code binary was not found");
    expect(html).toContain("Setup guidance");
    expect(html).toContain("Install or expose the Claude Code CLI, then check again.");
    expect(html).toContain("Desktop Runtime must be online");
    expect(html).toContain("Not configured yet");
    expect(html).not.toContain("agentmemory is disabled");
  });

  it("uses rail tools to open agents and connections pages", () => {
    const baseModel = createWorkbenchViewModel(snapshot());
    const html = renderToStaticMarkup(
      <AgentHubWorkbench
        viewModel={{
          ...baseModel,
          workspace: {
            ...baseModel.workspace,
            unreadMessageCount: 2,
          },
        }}
      />,
    );

    expect(html).toContain('aria-label="Open conversation"');
    expect(html).toContain('aria-label="Open agents"');
    expect(html).toContain('aria-label="Open connections"');
    expect(html).toContain('aria-label="Resize conversation list"');
    expect(html).toContain("lucide-message-square");
    expect(html).toContain("lucide-cable");
    expect(html).not.toContain("agenthub-rail-status-dot");
    expect(html).toMatch(
      /aria-label="Open conversation"[\s\S]*<small>2<\/small>[\s\S]*aria-label="Open agents"/,
    );
    expect(html).not.toMatch(
      /aria-label="Open agents"[\s\S]*<small>3<\/small>[\s\S]*aria-label="Open connections"/,
    );
    expect(html).toMatch(
      /aria-label="Search conversations"[\s\S]*aria-label="Collapse workspace navigation"/,
    );
  });

  it("renders conversation rows with avatar, message time, preview, and unread count", () => {
    const baseModel = createWorkbenchViewModel(snapshot());
    const html = renderToStaticMarkup(
      <AgentHubWorkbench
        viewModel={{
          ...baseModel,
          workspace: {
            ...baseModel.workspace,
            conversations: baseModel.workspace.conversations.map((conversation) => ({
              ...conversation,
              unreadCount: 2,
            })),
          },
        }}
      />,
    );

    expect(html).toContain("agenthub-conversation-avatar");
    expect(html).toMatch(
      /class="agenthub-conversation-title"[\s\S]*MVP workbench[\s\S]*class="agenthub-conversation-time"[\s\S]*00:00/,
    );
    expect(html).toContain("Implementer: Implemented the shell Details pnpm check");
    expect(html).toMatch(/class="agenthub-conversation-unread"[\s\S]*>2<\/span>/);
    expect(html).not.toContain(">Orchestrator, Implementer, Researcher</small>");
    expect(html).not.toContain(">Run running</span>");
  });

  it("keeps the left rail visible when conversation navigation is collapsed", () => {
    const html = renderToStaticMarkup(
      <AgentHubWorkbench snapshot={snapshot()} initialLeftCollapsed />,
    );

    expect(html).toContain('data-left-collapsed="true"');
    expect(html).toContain('aria-label="Workspace tools"');
    expect(html).toContain('aria-label="Open conversation"');
    expect(html).not.toContain('aria-label="Conversation navigation"');
  });

  it("maps snapshots into MVP view models without client-only transcript fixtures", () => {
    const model = createWorkbenchViewModel(snapshot(), {
      activeDiff: {
        baseCommit: "abc123",
        files: [
          { path: "packages/ui/src/index.tsx", status: "modified", insertions: 20, deletions: 4 },
        ],
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
    expect(model.runtime.providerStatusLabel).toBe("Claude Code connected");
    expect(model.runtime.memoryStatusLabel).toBe("Memory connected");
    expect(model.agentsPage.agents.map((agent) => agent.label)).toContain("Researcher");
    expect(model.connections.items.map((connection) => connection.label)).toEqual([
      "Claude Code",
      "Codex",
    ]);
    expect(
      model.connections.items.find((connection) => connection.id === "provider")?.checkable,
    ).toBe(true);
    expect(
      JSON.stringify(
        model.connections.items.find((connection) => connection.id === "provider")?.detailGroups,
      ),
    ).toContain("superpowers");
    expect(
      model.connections.items.find((connection) => connection.id === "memory"),
    ).toBeUndefined();
    expect(model.timeline.map((item) => item.kind)).toEqual([
      "message",
      "message",
      "permission",
      "diff",
      "artifact",
    ]);
    expect(model.workspace.pendingPermissionCount).toBe(1);
    expect(model.inspector.selection?.mode).toBe("permission");
  });

  it("keeps runtime executable when old Claude Code login failures are only conversation history", () => {
    const authFailureSnapshot = {
      ...snapshot(),
      messages: [
        ...snapshot().messages,
        {
          authorId: "agent_1",
          authorKind: "agent" as const,
          conversationId: "conversation_1",
          createdAt: now,
          id: "message_auth_failure",
          ownerUserId: "user_1",
          parts: [
            {
              runId: "run_auth_failure",
              text: "Not logged in · Please run /login",
              type: "markdown" as const,
            },
          ],
          replyToMessageId: null,
          updatedAt: now,
        },
      ],
      runs: [
        ...snapshot().runs,
        {
          ...snapshot().runs[0],
          completedAt: now,
          failureReason:
            "Claude Code exited with 1: Warning: no stdin data received in 3s, proceeding without it.",
          id: "run_auth_failure",
          status: "failed" as const,
        },
      ],
    };
    const model = createWorkbenchViewModel(authFailureSnapshot);

    expect(model.runtime.canExecute).toBe(true);
    expect(model.runtime.providerStatusLabel).toBe("Claude Code connected");
    expect(model.runtime.explanation).toBe("Runtime can receive local execution requests.");
    expect(model.composer.disabled).toBe(false);
    expect(model.composer.disabledReason).toBeNull();

    const html = renderToStaticMarkup(<AgentHubWorkbench viewModel={model} />);
    expect(html).toContain("online");
    expect(html).not.toContain("auth required");
  });

  it("tracks connection checking state and runtime-gated disabled reasons", () => {
    const model = createWorkbenchViewModel(snapshot("offline"), {
      checkingConnectionIds: ["provider"],
    });

    const provider = model.connections.items.find((connection) => connection.id === "provider");
    const codex = model.connections.items.find((connection) => connection.id === "codex");

    expect(
      model.connections.items.find((connection) => connection.id === "runtime"),
    ).toBeUndefined();
    expect(provider?.checking).toBe(true);
    expect(provider?.status).toBe("connected");
    expect(provider?.checkable).toBe(false);
    expect(provider?.disabledReason).toContain("Desktop Runtime");
    expect(
      model.connections.items.find((connection) => connection.id === "memory"),
    ).toBeUndefined();
    expect(codex?.checkable).toBe(false);
    expect(codex?.statusTone).toBe("disabled");
  });

  it("scopes timeline and composer to the active same-agent conversation", () => {
    const base = snapshot();
    const directSnapshot = {
      ...base,
      activeConversationId: "conversation_direct_2",
      conversations: [
        ...base.conversations,
        {
          archivedAt: null,
          createdAt: now,
          id: "conversation_direct_1",
          kind: "single-agent" as const,
          notificationsMuted: false,
          ownerUserId: "user_1",
          pinnedAt: null,
          title: "Researcher",
          updatedAt: now,
          workspaceId: "workspace_1",
        },
        {
          archivedAt: null,
          createdAt: now,
          id: "conversation_direct_2",
          kind: "single-agent" as const,
          notificationsMuted: false,
          ownerUserId: "user_1",
          pinnedAt: null,
          title: "Researcher",
          updatedAt: now,
          workspaceId: "workspace_1",
        },
      ],
      conversationParticipants: [
        {
          agentId: "agent_researcher",
          archivedAt: null,
          addedByUserId: "user_1",
          conversationId: "conversation_direct_1",
          createdAt: now,
          id: "participant_direct_1",
          ownerUserId: "user_1",
          updatedAt: now,
        },
        {
          agentId: "agent_researcher",
          archivedAt: null,
          addedByUserId: "user_1",
          conversationId: "conversation_direct_2",
          createdAt: now,
          id: "participant_direct_2",
          ownerUserId: "user_1",
          updatedAt: now,
        },
      ],
      messages: [
        {
          authorId: "agent_2",
          authorKind: "agent" as const,
          conversationId: "conversation_1",
          createdAt: now,
          id: "message_old_group",
          ownerUserId: "user_1",
          parts: [{ text: "old group message", type: "markdown" as const }],
          replyToMessageId: null,
          updatedAt: now,
        },
      ],
      runs: [],
    };

    const model = createWorkbenchViewModel(directSnapshot);

    expect(model.timeline).toEqual([
      expect.objectContaining({
        id: "empty-conversation",
        title: "Empty conversation",
      }),
    ]);
    expect(model.composer.selectedTarget).toBe("@Researcher");
    expect(
      model.workspace.conversations.filter((conversation) => conversation.title === "Researcher"),
    ).toHaveLength(2);
  });

  it("hides synthetic run placeholders and failed run errors after output starts", () => {
    const base = snapshot();
    const withRunMessage = {
      ...base,
      messages: [
        ...base.messages,
        {
          authorId: "agent_2",
          authorKind: "agent" as const,
          conversationId: "conversation_1",
          createdAt: now,
          id: "message_run_1",
          ownerUserId: "user_1",
          parts: [{ text: "partial output", type: "markdown" as const, runId: "run_1" }],
          replyToMessageId: null,
          updatedAt: now,
        },
      ],
    };
    const failedAfterOutput = {
      ...withRunMessage,
      runs: withRunMessage.runs.map((run) => ({
        ...run,
        failureReason: "Command failed",
        status: "failed" as const,
      })),
    };

    expect(createWorkbenchViewModel(withRunMessage).timeline.map((item) => item.id)).not.toContain(
      "run-message-run_1",
    );
    expect(
      createWorkbenchViewModel(failedAfterOutput).timeline.map((item) => item.id),
    ).not.toContain("run-message-run_1");
    expect(
      createWorkbenchViewModel(failedAfterOutput).timeline.some((item) =>
        item.body.includes("Command failed"),
      ),
    ).toBe(false);
  });

  it("maps offline runtime to disabled composer state while preserving navigation", () => {
    const model = createWorkbenchViewModel(snapshot("offline"));
    const html = renderToStaticMarkup(<AgentHubWorkbench viewModel={model} />);

    expect(model.composer.disabled).toBe(true);
    expect(html).toContain("Agents");
    expect(html).toContain("Runs");
    expect(html).toContain("Desktop Runtime must be online");
    expect(html).not.toMatch(/<textarea(?=[^>]*agenthub-composer-disabled-reason)[^>]*\sdisabled=/);
  });

  it("normalizes unavailable inspector selection to empty state", () => {
    const model = createWorkbenchViewModel(snapshot(), {
      selection: { id: "missing_permission", mode: "permission" },
    });

    expect(model.inspector.selection).toBeNull();
  });

  it("maps collaboration summaries into compact agent status rows", () => {
    const model = createWorkbenchViewModel({
      ...snapshot(),
      collaborationStatus: {
        agents: [
          {
            agentId: "agent_1",
            availability: "active",
            blockedQuestionCount: 0,
            currentTaskId: "task_1",
            currentTaskTitle: "Shape OpenSpec runtime",
            displayName: "Orchestrator",
            stale: false,
          },
          {
            agentId: "agent_2",
            availability: "blocked",
            blockedQuestionCount: 1,
            currentTaskId: "task_2",
            currentTaskTitle: "Build collaboration plugin",
            displayName: "Implementer",
            stale: true,
          },
        ],
        conversationId: "conversation_1",
        openSpecLinks: [
          {
            artifact: "tasks",
            changeName: "add-openspec-agent-collaboration-plugin",
            projectionStatus: "projected",
          },
        ],
        pendingUserQuestions: [
          {
            createdAt: now,
            prompt: "Which agent should own unaddressed group messages?",
            questionId: "question_1",
            requestingAgentId: "agent_2",
            taskId: "task_2",
          },
        ],
        projectId: "project_1",
        state: "available",
      },
    });

    expect(model.inspector.collaborationStatus?.agents).toMatchObject([
      {
        availability: "active",
        blockedQuestionCount: 0,
        currentTaskTitle: "Shape OpenSpec runtime",
        displayName: "Orchestrator",
      },
      {
        availability: "blocked",
        blockedQuestionCount: 1,
        currentTaskTitle: "Build collaboration plugin",
        displayName: "Implementer",
        stale: true,
      },
    ]);
    expect(model.inspector.collaborationStatus?.openSpecLinks[0]).toMatchObject({
      artifactLabel: "tasks",
      changeName: "add-openspec-agent-collaboration-plugin",
    });
    expect(model.inspector.collaborationStatus?.pendingUserQuestions[0]).toMatchObject({
      agentName: "Implementer",
      questionId: "question_1",
    });
  });

  it("renders inspector modes for chat info, collaboration status, permission, diff, runtime, artifact, run, and empty states", () => {
    const model = createWorkbenchViewModel(
      {
        ...snapshot(),
        collaborationStatus: {
          agents: [
            {
              agentId: "agent_2",
              availability: "blocked",
              blockedQuestionCount: 1,
              currentTaskId: "task_2",
              currentTaskTitle: "Build collaboration plugin",
              displayName: "Implementer",
              stale: false,
            },
          ],
          conversationId: "conversation_1",
          openSpecLinks: [
            {
              artifact: "design",
              changeName: "add-openspec-agent-collaboration-plugin",
              projectionStatus: "projected",
            },
          ],
          pendingUserQuestions: [
            {
              createdAt: now,
              prompt: "Confirm the sidebar scope.",
              questionId: "question_1",
              requestingAgentId: "agent_2",
              taskId: "task_2",
            },
          ],
          projectId: "project_1",
          state: "available",
        },
      },
      {
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
          files: [
            { path: "packages/ui/src/index.tsx", status: "modified", insertions: 20, deletions: 4 },
          ],
          id: "diff_1",
          runId: "run_1",
          state: "metadata-only",
          warning: "Full diff requires runtime",
        },
        artifacts: [artifact],
        pendingPermissions: [pendingPermission],
      },
    );

    expect(
      renderToStaticMarkup(
        <AgentHubWorkbench initialInspectorSelection={null} viewModel={model} />,
      ),
    ).toContain("Participants");
    expect(
      renderToStaticMarkup(
        <AgentHubWorkbench
          initialInspectorSelection={{ id: "plan_1", mode: "plan" }}
          viewModel={model}
        />,
      ),
    ).toContain("Ask to revise");
    expect(
      renderToStaticMarkup(
        <AgentHubWorkbench
          initialInspectorSelection={{ id: "conversation_1", mode: "chat-info" }}
          viewModel={model}
        />,
      ),
    ).toContain("Basic information");
    expect(
      renderToStaticMarkup(
        <AgentHubWorkbench
          initialInspectorSelection={{ id: "conversation_1", mode: "collaboration-status" }}
          viewModel={model}
        />,
      ),
    ).toContain("Agent status");
    expect(
      renderToStaticMarkup(
        <AgentHubWorkbench
          initialInspectorSelection={{ id: "conversation_1", mode: "collaboration-status" }}
          viewModel={model}
        />,
      ),
    ).toContain("Confirm the sidebar scope.");
    expect(
      renderToStaticMarkup(
        <AgentHubWorkbench
          initialInspectorSelection={{ id: "conversation_1", mode: "collaboration-status" }}
          viewModel={model}
        />,
      ),
    ).toContain("add-openspec-agent-collaboration-plugin");
    expect(
      renderToStaticMarkup(
        <AgentHubWorkbench
          initialInspectorSelection={{ id: "permission_1", mode: "permission" }}
          viewModel={model}
        />,
      ),
    ).toContain("Allow once");
    expect(
      renderToStaticMarkup(
        <AgentHubWorkbench
          initialInspectorSelection={{ id: "diff_1", mode: "diff" }}
          viewModel={model}
        />,
      ),
    ).toContain("Open full-screen diff review");
    expect(
      renderToStaticMarkup(
        <AgentHubWorkbench
          initialInspectorSelection={{ id: "runtime", mode: "runtime" }}
          viewModel={model}
        />,
      ),
    ).toContain("Capabilities");
    expect(
      renderToStaticMarkup(
        <AgentHubWorkbench
          initialInspectorSelection={{ id: "artifact_1", mode: "artifact" }}
          viewModel={model}
        />,
      ),
    ).toContain("Updated shared UI");
    expect(
      renderToStaticMarkup(
        <AgentHubWorkbench
          initialInspectorSelection={{ id: "run_1", mode: "run" }}
          viewModel={model}
        />,
      ),
    ).toContain("Run running");
    expect(
      renderToStaticMarkup(
        <AgentHubWorkbench initialFullScreenDiffId="diff_1" viewModel={model} />,
      ),
    ).toContain("Return to conversation");
  });

  it("renders unavailable collaboration state in the inspector", () => {
    const model = createWorkbenchViewModel({
      ...snapshot(),
      collaborationStatus: {
        agents: [],
        conversationId: "conversation_1",
        openSpecLinks: [],
        pendingUserQuestions: [],
        projectId: "project_1",
        state: "unavailable",
        unavailableReason: "Project directory is unavailable.",
      },
    });

    const html = renderToStaticMarkup(
      <AgentHubWorkbench
        initialInspectorSelection={{ id: "conversation_1", mode: "collaboration-status" }}
        viewModel={model}
      />,
    );

    expect(html).toContain("Agent status unavailable");
    expect(html).toContain("Project directory is unavailable.");
  });

  it("renders collaboration status rows for active, idle, blocked, stale, and completed agents", () => {
    const model = createWorkbenchViewModel({
      ...snapshot(),
      collaborationStatus: {
        agents: [
          {
            agentId: "agent_1",
            availability: "active",
            blockedQuestionCount: 0,
            currentTaskId: "task_active",
            currentTaskTitle: "Coordinate dispatch",
            displayName: "Orchestrator",
            stale: false,
          },
          {
            agentId: "agent_2",
            availability: "idle",
            blockedQuestionCount: 0,
            currentTaskId: null,
            currentTaskTitle: null,
            displayName: "Implementer",
            stale: false,
          },
          {
            agentId: "agent_researcher",
            availability: "stale",
            blockedQuestionCount: 0,
            currentTaskId: null,
            currentTaskTitle: null,
            displayName: "Researcher",
            stale: true,
          },
          {
            agentId: "agent_completed",
            availability: "completed",
            blockedQuestionCount: 0,
            currentTaskId: null,
            currentTaskTitle: null,
            displayName: "Reviewer",
            stale: false,
          },
        ],
        conversationId: "conversation_1",
        openSpecLinks: [],
        pendingUserQuestions: [],
        projectId: "project_1",
        state: "available",
      },
    });

    const html = renderToStaticMarkup(
      <AgentHubWorkbench
        initialInspectorSelection={{ id: "conversation_1", mode: "collaboration-status" }}
        viewModel={model}
      />,
    );

    expect(html).toContain("Coordinate dispatch");
    expect(html).toContain("No current task");
    expect(html).toContain(">active<");
    expect(html).toContain(">idle<");
    expect(html).toContain(">stale<");
    expect(html).toContain(">completed<");
  });

  it("derives chat info membership from explicit participants with legacy fallback", () => {
    const explicitSnapshot: WorkbenchSnapshot = {
      ...snapshot(),
      conversationParticipants: [
        {
          agentId: "agent_1",
          archivedAt: null,
          addedByUserId: "user_1",
          conversationId: "conversation_1",
          createdAt: now,
          id: "participant_1",
          ownerUserId: "user_1",
          updatedAt: now,
        },
        {
          agentId: "agent_2",
          archivedAt: null,
          addedByUserId: "user_1",
          conversationId: "conversation_1",
          createdAt: now,
          id: "participant_2",
          ownerUserId: "user_1",
          updatedAt: now,
        },
      ],
    };
    const explicitModel = createWorkbenchViewModel(explicitSnapshot);
    expect(explicitModel.inspector.chatInfo?.participants.map((agent) => agent.label)).toEqual([
      "Orchestrator",
      "Implementer",
    ]);
    expect(explicitModel.inspector.chatInfo?.availableAgents.map((agent) => agent.label)).toEqual([
      "Researcher",
    ]);
    expect(explicitModel.composer.targets.map((target) => target.label)).toEqual([
      "Orchestrator",
      "Implementer",
    ]);

    const legacyModel = createWorkbenchViewModel(snapshot());
    expect(legacyModel.inspector.chatInfo?.participants).toHaveLength(3);
    expect(legacyModel.inspector.chatInfo?.availableAgents).toHaveLength(0);
  });

  it("renders chat title activation and participant management states", () => {
    const explicitSnapshot: WorkbenchSnapshot = {
      ...snapshot(),
      conversationParticipants: [
        {
          agentId: "agent_1",
          archivedAt: null,
          addedByUserId: "user_1",
          conversationId: "conversation_1",
          createdAt: now,
          id: "participant_1",
          ownerUserId: "user_1",
          updatedAt: now,
        },
      ],
    };
    const model = createWorkbenchViewModel(explicitSnapshot);
    const withoutCallbacks = renderToStaticMarkup(
      <AgentHubWorkbench
        initialInspectorSelection={{ id: "conversation_1", mode: "chat-info" }}
        viewModel={model}
      />,
    );
    const withCallbacks = renderToStaticMarkup(
      <AgentHubWorkbench
        initialInspectorSelection={{ id: "conversation_1", mode: "chat-info" }}
        onAddAgentToChat={() => undefined}
        onRemoveAgentFromChat={() => undefined}
        viewModel={model}
      />,
    );

    expect(withoutCallbacks).not.toContain("Open conversation info");
    expect(withoutCallbacks).toContain("Open chat information for MVP workbench");
    expect(withoutCallbacks).toContain("Participants");
    expect(withoutCallbacks).toContain("Add agent");
    expect(withoutCallbacks).toContain("Implementer");
    expect(withoutCallbacks).toContain("disabled");
    expect(withoutCallbacks).toContain("agenthub-desktop-inspector-toggle");
    expect(withoutCallbacks).toContain("agenthub-inspector-floating-actions");
    expect(withCallbacks).toContain("agenthub-chat-add-agent-list");
    expect(withCallbacks).toContain("agenthub-chat-add-agent-option");
    expect(withCallbacks).toContain("agenthub-chat-add-agent-check");
    expect(withoutCallbacks).not.toContain("<h3>MVP workbench</h3>");
    expect(withoutCallbacks).toContain("Conversation settings");
    expect(withoutCallbacks).toContain("Pin conversation");
    expect(withoutCallbacks).toContain("Notifications");
    expect(withoutCallbacks).toContain("Delete conversation");
    expect(withoutCallbacks).not.toContain("<dt>Runtime</dt>");
    expect(withoutCallbacks).not.toContain("<dt>Created</dt>");
    expect(withoutCallbacks).not.toContain("<dt>Updated</dt>");
    expect(withoutCallbacks).not.toContain("agent participant");
    expect(withoutCallbacks).not.toContain("<small>orchestrator</small>");
    expect(withoutCallbacks).not.toContain("<small>worker</small>");
    expect(withoutCallbacks).not.toContain(">Clear<");
    expect(withCallbacks).not.toContain("Remove Orchestrator from chat");
  });

  it("lays out chat participants in four columns with avatar-sized add control", () => {
    expect(workbenchCss).toContain("grid-template-columns: repeat(4, minmax(0, 1fr))");
    expect(workbenchCss).toContain(
      ".agenthub-chat-participant-tile {\n  position: relative;\n  width: 64px;",
    );
    expect(workbenchCss).toContain(".agenthub-chat-add-agent-button {\n  width: 48px;");
    expect(workbenchCss).toContain("border: 1px dashed var(--agenthub-border);");
    expect(workbenchCss).toContain("--agenthub-right-column: clamp(300px, 24vw, 340px);");
    expect(workbenchCss).toContain(".agenthub-chat-settings-group");
    expect(workbenchCss).toContain(".agenthub-inspector-floating-actions");
    expect(workbenchCss).toContain(".agenthub-desktop-inspector-toggle");
    expect(workbenchCss).toContain(
      '.agenthub-workbench[data-layout="narrow"] .agenthub-desktop-inspector-toggle',
    );
    expect(workbenchCss).toContain("inset: 0 0 0 auto");
    expect(workbenchCss).toContain(".agenthub-detail-section:first-child");
  });

  it("places the desktop inspector beside the conversation instead of overlaying it", () => {
    const wideInspectorCss =
      workbenchCss.match(
        /\.agenthub-workbench\[data-layout="wide"\] \.agenthub-motion-right-panel,[\s\S]*?\.agenthub-workbench\[data-layout="standard"\] \.agenthub-motion-right-panel \{[^}]*\}/,
      )?.[0] ?? "";

    expect(workbenchCss).toContain(
      '.agenthub-workbench[data-layout="wide"][data-left-collapsed="false"] { grid-template-columns: var(--agenthub-left-column) minmax(0, 1fr); }',
    );
    expect(workbenchCss).toContain(
      '.agenthub-workbench[data-layout="standard"] { grid-template-columns: var(--agenthub-left-column) minmax(0, 1fr); }',
    );
    expect(workbenchCss).toContain(
      '.agenthub-workbench[data-layout="wide"][data-center-view="conversation"] .agenthub-center',
    );
    expect(workbenchCss).toContain(
      '.agenthub-workbench[data-layout="standard"][data-center-view="conversation"] .agenthub-center',
    );
    expect(workbenchCss).toContain(
      "grid-template-columns: minmax(0, 1fr) var(--agenthub-right-column)",
    );
    expect(workbenchCss).toContain("grid-template-columns: minmax(0, 1fr) 0px");
    expect(workbenchCss).toContain(
      '.agenthub-workbench[data-layout="wide"][data-center-view="conversation"] .agenthub-conversation-header',
    );
    expect(workbenchCss).toContain("grid-column: 1 / 3");
    expect(wideInspectorCss).toContain("position: relative");
    expect(wideInspectorCss).toContain("grid-column: 2");
    expect(wideInspectorCss).toContain("grid-row: 2 / 4");
    expect(wideInspectorCss).toContain("height: auto");
    expect(wideInspectorCss).not.toContain("position: fixed");
    expect(wideInspectorCss).not.toContain("inset:");
    expect(wideInspectorCss).not.toContain("margin-top:");
  });

  it("shows the inline inspector collapse control on desktop layouts", () => {
    const html = renderToStaticMarkup(
      <AgentHubWorkbench layoutMode="standard" snapshot={snapshot()} />,
    );

    expect(html).toContain("Collapse Context Inspector");
    expect(html).toContain("agenthub-inspector-floating-actions");
  });

  it("renders Control Plane offline and loading states", () => {
    expect(
      renderToStaticMarkup(
        <AgentHubWorkbench error="Control plane request failed" loading={false} />,
      ),
    ).toContain("Control Plane offline");
    const loading = renderToStaticMarkup(<AgentHubWorkbench loading />);
    expect(loading).toContain("Loading AgentHub");
    expect(loading).toContain("agenthub-workbench-loading-screen");
    expect(loading).toContain("agenthub-loading-orbit");
    expect(loading).toContain('role="status"');
  });

  it("renders empty conversation and narrow layout verification surfaces", () => {
    const emptySnapshot = { ...snapshot(), messages: [], runs: [] };
    const html = renderToStaticMarkup(
      <AgentHubWorkbench layoutMode="narrow" snapshot={emptySnapshot} />,
    );
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

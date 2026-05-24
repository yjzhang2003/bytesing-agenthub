import type { Artifact, PermissionRequest, WorkbenchSnapshot } from "@agenthub/contracts";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import {
  AgentMentionComposer,
  AgentsPage,
  Button,
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
        policy: { network: "ask" },
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
    expect(workbench).toContain("Context Inspector");
    expect(workbench).toContain("Workspace navigation");
    expect(workbench).toContain('data-theme="dark"');
    expect(workbench).toContain('data-left-collapsed="false"');
    expect(workbench).toContain('data-right-collapsed="false"');
    expect(workbench).toContain("Collapse workspace navigation");
    expect(workbench).toContain("Collapse Context Inspector");
    expect(workbench).toContain("Switch to light mode");
    expect(workbench).toContain(
      '.agenthub-workbench[data-layout="standard"] .agenthub-motion-right-panel',
    );
  });

  it("renders conversation messages as IM bubbles and active agent replies as loading bubbles", () => {
    const html = renderToStaticMarkup(<AgentHubWorkbench snapshot={snapshot()} />);

    expect(html).toContain("agenthub-message-bubble");
    expect(html).toContain('data-author="agent"');
    expect(html).toContain("agenthub-message-avatar");
    expect(html).toContain('aria-label="Open Implementer agent"');
    expect(html).not.toContain("agent message");
    expect(html).toContain("Implemented ");
    expect(html).toContain("<strong>the shell</strong>");
    expect(html).toContain("<h2>Details</h2>");
    expect(html).toContain("<code>pnpm check</code>");
    expect(html).toContain("agenthub-message-loading");
    expect(html).toContain("Writing a reply");
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
    expect(html).toContain("max-height: calc(100dvh - 64px)");
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
    expect(workbench).toContain("上下文检查器");
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
    expect(html).toContain("Open conversation details");
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
      <AgentHubWorkbench initialCenterView="settings" viewModel={model} />,
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
      html.match(
        /\.agenthub-workbench\[data-center-view="settings"\] \{[^}]*\}/,
      )?.[0] ?? "";
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
    expect(html).toContain("Check connection");
    expect(html).toContain("Check all");
    expect(html).toContain("Codex");
    expect(html).toContain("disabled");
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
    expect(html).toContain("Desktop Runtime must be online");
    expect(html).toContain("Not configured yet");
    expect(html).not.toContain("agentmemory is disabled");
  });

  it("uses rail tools to open agents and connections pages", () => {
    const html = renderToStaticMarkup(<AgentHubWorkbench snapshot={snapshot()} />);

    expect(html).toContain('aria-label="Open conversation"');
    expect(html).toContain('aria-label="Open agents"');
    expect(html).toContain('aria-label="Open connections"');
    expect(html).toContain('aria-label="Resize conversation list"');
    expect(html).toContain("lucide-message-square");
    expect(html).toContain("lucide-cable");
    expect(html).toMatch(
      /aria-label="Search conversations"[\s\S]*aria-label="Collapse workspace navigation"/,
    );
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
    expect(model.connections.items.find((connection) => connection.id === "provider")?.checkable).toBe(
      true,
    );
    expect(model.connections.items.find((connection) => connection.id === "memory")).toBeUndefined();
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

  it("tracks connection checking state and runtime-gated disabled reasons", () => {
    const model = createWorkbenchViewModel(snapshot("offline"), {
      checkingConnectionIds: ["provider"],
    });

    const provider = model.connections.items.find((connection) => connection.id === "provider");
    const codex = model.connections.items.find((connection) => connection.id === "codex");

    expect(model.connections.items.find((connection) => connection.id === "runtime")).toBeUndefined();
    expect(provider?.checking).toBe(true);
    expect(provider?.status).toBe("connected");
    expect(provider?.checkable).toBe(false);
    expect(provider?.disabledReason).toContain("Desktop Runtime");
    expect(model.connections.items.find((connection) => connection.id === "memory")).toBeUndefined();
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
          ownerUserId: "user_1",
          title: "Researcher",
          updatedAt: now,
          workspaceId: "workspace_1",
        },
        {
          archivedAt: null,
          createdAt: now,
          id: "conversation_direct_2",
          kind: "single-agent" as const,
          ownerUserId: "user_1",
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

  it("hides only active loading placeholders after a run message starts", () => {
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
    expect(createWorkbenchViewModel(failedAfterOutput).timeline).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          body: ["Command failed"],
          id: "run-message-run_1",
          state: "error",
        }),
      ]),
    );
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

  it("renders inspector modes for chat info, permission, diff, runtime, artifact, run, and empty states", () => {
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
    });

    expect(
      renderToStaticMarkup(
        <AgentHubWorkbench initialInspectorSelection={null} viewModel={model} />,
      ),
    ).toContain("Runtime details");
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

    expect(withoutCallbacks).toContain("Open chat information for MVP workbench");
    expect(withoutCallbacks).toContain("Participants");
    expect(withoutCallbacks).toContain("Add agent");
    expect(withoutCallbacks).toContain("Implementer");
    expect(withoutCallbacks).toContain("disabled");
    expect(withCallbacks).toContain("agenthub-chat-add-agent-list");
    expect(withCallbacks).toContain("agenthub-chat-add-agent-option");
    expect(withCallbacks).toContain("agenthub-chat-add-agent-check");
    expect(withoutCallbacks).not.toContain("agent participant");
    expect(withoutCallbacks).not.toContain("<small>orchestrator</small>");
    expect(withoutCallbacks).not.toContain("<small>worker</small>");
    expect(withoutCallbacks).not.toContain(">Clear<");
    expect(withCallbacks).not.toContain("Remove Orchestrator from chat");
  });

  it("renders Control Plane offline and loading states", () => {
    expect(
      renderToStaticMarkup(
        <AgentHubWorkbench error="Control plane request failed" loading={false} />,
      ),
    ).toContain("Control Plane offline");
    expect(renderToStaticMarkup(<AgentHubWorkbench loading />)).toContain("Loading AgentHub");
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

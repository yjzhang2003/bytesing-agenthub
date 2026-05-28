import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import {
  AGENTHUB_LOCALE_STORAGE_KEY,
  AgentHubWorkbench,
  agentHubTranslationKeys,
  createAgentHubI18n,
  normalizeAgentHubLocale,
  readStoredAgentHubLocale,
  supportedAgentHubLocales,
  writeStoredAgentHubLocale,
} from "../src/index.js";
import { createWorkbenchViewModel } from "../src/view-model.js";
import { snapshot } from "./test-fixtures.js";

describe("@agenthub/ui localization", () => {
  it("defines supported locales with English fallback and Simplified Chinese translations", () => {
    expect(supportedAgentHubLocales).toEqual(["en-US", "zh-CN"]);
    expect(normalizeAgentHubLocale("en")).toBe("en-US");
    expect(normalizeAgentHubLocale("en-US")).toBe("en-US");
    expect(normalizeAgentHubLocale("zh")).toBe("zh-CN");
    expect(normalizeAgentHubLocale("zh-CN")).toBe("zh-CN");
    expect(normalizeAgentHubLocale("")).toBe("en-US");
    expect(normalizeAgentHubLocale("bogus")).toBe("en-US");
    expect(createAgentHubI18n("zh" as never).locale).toBe("zh-CN");
    expect(createAgentHubI18n("en-US").t("actions.allowOnce")).toBe("Allow once");
    expect(createAgentHubI18n("zh-CN").t("actions.allowOnce")).toBe("允许一次");
  });

  it("normalizes persisted locale reads and writes", () => {
    const values = new Map<string, string>();
    const storage = {
      getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => values.set(key, value),
    };

    values.set(AGENTHUB_LOCALE_STORAGE_KEY, "zh");
    expect(readStoredAgentHubLocale(storage)).toBe("zh-CN");

    writeStoredAgentHubLocale(storage, "zh" as never);
    expect(values.get(AGENTHUB_LOCALE_STORAGE_KEY)).toBe("zh-CN");

    values.set(AGENTHUB_LOCALE_STORAGE_KEY, "fr-FR");
    expect(readStoredAgentHubLocale(storage)).toBe("en-US");
  });

  it("keeps the Simplified Chinese catalog aligned with known product chrome keys", () => {
    const zh = createAgentHubI18n("zh-CN");

    expect(agentHubTranslationKeys).toContain("language.language");
    expect(agentHubTranslationKeys).toContain("chat.addAgent");
    expect(agentHubTranslationKeys).toContain("collaboration.agentStatus");
    expect(agentHubTranslationKeys).toContain("collaboration.answerQuestion");
    expect(agentHubTranslationKeys).toContain("chat.searchAgentsToAdd");
    expect(agentHubTranslationKeys).toContain("chat.noMatchingAgents");
    expect(agentHubTranslationKeys).toContain("settings.permissions");
    expect(agentHubTranslationKeys).toContain("composer.placeholder");
    for (const key of agentHubTranslationKeys) {
      expect(zh.t(key), key).not.toBe(key);
    }
  });

  it("renders language selection and broad workbench chrome in Simplified Chinese", () => {
    const model = createWorkbenchViewModel(snapshot(), {
      pendingPermissions: [
        {
          actionKind: "command.run",
          agentId: "agent_2",
          command: "pnpm check",
          conversationId: "conversation_1",
          createdAt: "2026-05-21T00:00:00.000Z",
          decidedAt: null,
          id: "permission_1",
          ownerUserId: "user_1",
          paths: [],
          risk: "high",
          runId: "run_1",
          status: "pending",
          summary: "Run validation",
          updatedAt: "2026-05-21T00:00:00.000Z",
          workspaceId: "workspace_1",
        },
      ],
    });
    const settings = renderToStaticMarkup(
      <AgentHubWorkbench initialCenterView="settings" locale="zh-CN" viewModel={model} />,
    );
    const agents = renderToStaticMarkup(
      <AgentHubWorkbench initialCenterView="agents" locale="zh-CN" viewModel={model} />,
    );
    const connections = renderToStaticMarkup(
      <AgentHubWorkbench initialCenterView="connections" locale="zh-CN" viewModel={model} />,
    );
    const narrow = renderToStaticMarkup(
      <AgentHubWorkbench layoutMode="narrow" locale="zh-CN" snapshot={snapshot()} />,
    );
    const chatInfo = renderToStaticMarkup(
      <AgentHubWorkbench
        initialInspectorSelection={{ id: "conversation_1", mode: "chat-info" }}
        locale="zh-CN"
        snapshot={{
          ...snapshot(),
          conversationParticipants: [
            {
              agentId: "agent_1",
              archivedAt: null,
              addedByUserId: "user_1",
              conversationId: "conversation_1",
              createdAt: "2026-05-21T00:00:00.000Z",
              id: "participant_1",
              ownerUserId: "user_1",
              updatedAt: "2026-05-21T00:00:00.000Z",
            },
          ],
        }}
      />,
    );

    expect(settings).toContain("语言");
    expect(settings).toContain("English");
    expect(settings).toContain("简体中文");
    expect(settings).toContain("搜索设置");
    expect(settings).toContain("快捷键");
    expect(settings).toContain("权限");
    expect(agents).toContain("智能体角色");
    expect(agents).toContain("新对话");
    expect(agents).toContain("能力标签");
    expect(agents).toContain("高级配置");
    expect(agents).not.toContain("保存更改");
    expect(connections).toContain("连接");
    expect(connections).toContain("检查连接");
    expect(connections).toContain("刷新能力");
    expect(connections).toContain("能力");
    expect(connections).toContain("依赖");
    expect(connections).toContain("系统 Claude 环境");
    expect(connections).toContain("设置来源为继承时使用 ~/.claude");
    expect(connections).toContain("AgentHub 托管配置");
    expect(connections).toContain("全部检查");
    expect(narrow).toContain("打开工作区导航");
    expect(narrow).toContain("打开 MVP workbench 的聊天信息");
    expect(narrow).toContain("打开运行详情");
    expect(narrow).toContain("给智能体发送消息");
    expect(chatInfo).toContain("参与者");
    expect(chatInfo).toContain("添加智能体");
    expect(chatInfo).not.toContain("选择要添加的智能体");
    expect(createAgentHubI18n("zh-CN").t("chat.searchAgentsToAdd")).toBe("搜索");
    expect(createAgentHubI18n("zh-CN").t("chat.addSelectedAgents", { count: "2" })).toBe(
      "添加 2 个",
    );
    expect(createAgentHubI18n("zh-CN").t("collaboration.agentStatus")).toBe("智能体状态");
    expect(createAgentHubI18n("zh-CN").t("collaboration.answerQuestion")).toBe("回答问题");
    expect(createAgentHubI18n("zh-CN").t("chat.noMatchingAgents")).toBe("没有匹配的智能体");
    expect(chatInfo).toContain("基本信息");
    expect(narrow).toContain("Implemented ");
    expect(narrow).toContain("<code>pnpm check</code>");
  });

  it("localizes run detail product chrome while preserving technical values", () => {
    const now = "2026-05-21T00:00:00.000Z";
    const localized = renderToStaticMarkup(
      <AgentHubWorkbench
        initialInspectorSelection={{ id: "run_claude", mode: "run" }}
        locale="zh-CN"
        snapshot={{
          ...snapshot(),
          runs: [
            {
              agentId: "agent_2",
              claudeCode: {
                effectivePermissionPreset: "full-access",
                effectiveSettingsSource: "project",
                effort: "high",
                hooksPolicy: "enabled",
                mcpProfileId: "mcp.local",
                overrideSource: "conversation",
                permissionPreset: "workspace-write",
                runtimeProfileId: "runtime.local",
                settingsSource: "user",
              },
              completedAt: null,
              conversationId: "conversation_1",
              createdAt: now,
              failureReason: "stderr: permission denied",
              failureSummary: null,
              id: "run_claude",
              ownerUserId: "user_1",
              planId: "plan_1",
              projectId: "project_1",
              startedAt: now,
              status: "failed",
              updatedAt: now,
              workspaceId: "workspace_1",
            },
          ],
        }}
      />,
    );

    expect(localized).toContain("权限");
    expect(localized).toContain("运行时配置");
    expect(localized).toContain("MCP 配置");
    expect(localized).toContain("推理强度");
    expect(localized).toContain("设置");
    expect(localized).toContain("来源");
    expect(localized).toContain("诊断");
    expect(localized).toContain("本次运行选择了完全访问权限。");
    expect(localized).toContain("runtime.local");
    expect(localized).toContain("mcp.local");
    expect(localized).toContain("stderr: permission denied");
    expect(localized).not.toContain("Full access was selected for this run.");
    expect(localized).not.toContain(">Permission<");
    expect(localized).not.toContain(">Diagnostics<");
  });
});

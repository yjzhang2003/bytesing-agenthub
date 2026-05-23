import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import {
  AgentHubWorkbench,
  agentHubTranslationKeys,
  createAgentHubI18n,
  normalizeAgentHubLocale,
  supportedAgentHubLocales,
} from "../src/index.js";
import { createWorkbenchViewModel } from "../src/view-model.js";
import { snapshot } from "./test-fixtures.js";

describe("@agenthub/ui localization", () => {
  it("defines supported locales with English fallback and Simplified Chinese translations", () => {
    expect(supportedAgentHubLocales).toEqual(["en-US", "zh-CN"]);
    expect(normalizeAgentHubLocale("zh-CN")).toBe("zh-CN");
    expect(normalizeAgentHubLocale("bogus")).toBe("en-US");
    expect(createAgentHubI18n("en-US").t("actions.allowOnce")).toBe("Allow once");
    expect(createAgentHubI18n("zh-CN").t("actions.allowOnce")).toBe("允许一次");
  });

  it("keeps the Simplified Chinese catalog aligned with known product chrome keys", () => {
    const zh = createAgentHubI18n("zh-CN");

    expect(agentHubTranslationKeys).toContain("language.language");
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

    expect(settings).toContain("语言");
    expect(settings).toContain("English");
    expect(settings).toContain("简体中文");
    expect(settings).toContain("键盘");
    expect(settings).toContain("审查");
    expect(agents).toContain("智能体角色");
    expect(agents).toContain("能力标签");
    expect(agents).toContain("保存更改");
    expect(connections).toContain("连接");
    expect(connections).toContain("刷新状态");
    expect(narrow).toContain("打开工作区导航");
    expect(narrow).toContain("打开会话详情");
    expect(narrow).toContain("给智能体发送消息");
    expect(narrow).toContain("Implemented ");
    expect(narrow).toContain("<code>pnpm check</code>");
  });
});

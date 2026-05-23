import React from "react";

export type AgentHubLocale = "en-US" | "zh-CN";

type TranslationKey =
  | "actions.askToRevise"
  | "actions.cancel"
  | "actions.cancelPlan"
  | "actions.clear"
  | "actions.deny"
  | "actions.openReview"
  | "actions.approve"
  | "actions.allowOnce"
  | "actions.retry"
  | "actions.review"
  | "actions.revise"
  | "actions.returnToConversation"
  | "actions.sendMessage"
  | "actions.switchToDark"
  | "actions.switchToLight"
  | "agents.openAgent"
  | "composer.commandDirect"
  | "composer.commandPlan"
  | "composer.disabledReason"
  | "composer.messageAgent"
  | "composer.offline"
  | "composer.placeholder"
  | "composer.suggestions"
  | "connections.statusRuntime"
  | "nav.chat"
  | "nav.collapse"
  | "nav.collapseInspector"
  | "nav.collapseWorkspace"
  | "nav.conversationDetails"
  | "nav.conversationNavigation"
  | "nav.conversations"
  | "nav.expand"
  | "nav.expandInspector"
  | "nav.expandWorkspace"
  | "nav.openAgents"
  | "nav.openConnections"
  | "nav.openConversation"
  | "nav.openConversationDetails"
  | "nav.openWorkspaceNavigation"
  | "nav.pendingPermissions"
  | "nav.runs"
  | "nav.search"
  | "nav.searchConversations"
  | "nav.settings"
  | "nav.workspaceNavigation"
  | "nav.workspaceStatus"
  | "nav.workspaceTools"
  | "settings.appearance"
  | "settings.branch"
  | "settings.darkMode"
  | "settings.device"
  | "settings.enterToSend"
  | "settings.heartbeat"
  | "settings.keyboard"
  | "settings.keyboardDescription"
  | "settings.messageInput"
  | "settings.name"
  | "settings.path"
  | "settings.permissions"
  | "settings.permissionsPending"
  | "settings.platform"
  | "settings.project"
  | "settings.runtime"
  | "settings.runtimeDescription"
  | "settings.shiftEnter"
  | "settings.version"
  | "settings.workbenchDisplay"
  | "settings.workspace"
  | "settings.workspaceDescription"
  | "state.connectionError"
  | "state.controlPlaneOffline"
  | "state.fetchingSnapshot"
  | "state.loadingAgentHub"
  | "state.loadingWorkbench"
  | "state.noBranch"
  | "state.noConversations"
  | "state.noParticipants"
  | "state.noWorkspacePath"
  | "state.runStatus"
  | "state.idle";

type TranslationValues = Readonly<Record<string, string | number>>;

type AgentHubI18n = {
  readonly locale: AgentHubLocale;
  readonly t: (key: TranslationKey, values?: TranslationValues) => string;
};

const zhCN: Record<TranslationKey, string> = {
  "actions.allowOnce": "允许一次",
  "actions.approve": "批准",
  "actions.askToRevise": "要求修改",
  "actions.cancel": "取消",
  "actions.cancelPlan": "取消计划",
  "actions.clear": "清除",
  "actions.deny": "拒绝",
  "actions.openReview": "打开审查",
  "actions.retry": "重试",
  "actions.review": "审查",
  "actions.revise": "修改",
  "actions.returnToConversation": "返回会话",
  "actions.sendMessage": "发送消息",
  "actions.switchToDark": "切换到深色模式",
  "actions.switchToLight": "切换到浅色模式",
  "agents.openAgent": "打开 {agent} 智能体",
  "composer.commandDirect": "发送直接智能体消息",
  "composer.commandPlan": "使用协调智能体制定计划",
  "composer.disabledReason": "桌面运行时在线后才能发送。",
  "composer.messageAgent": "给 {target} 发送消息",
  "composer.offline": "运行时离线",
  "composer.placeholder": "给智能体发送消息，@提及或使用 /命令",
  "composer.suggestions": "输入建议",
  "connections.statusRuntime": "运行时 {status}",
  "nav.chat": "聊天",
  "nav.collapse": "折叠",
  "nav.collapseInspector": "折叠上下文检查器",
  "nav.collapseWorkspace": "折叠工作区导航",
  "nav.conversationDetails": "会话详情",
  "nav.conversationNavigation": "会话导航",
  "nav.conversations": "会话",
  "nav.expand": "展开",
  "nav.expandInspector": "展开上下文检查器",
  "nav.expandWorkspace": "展开工作区导航",
  "nav.openAgents": "打开智能体",
  "nav.openConnections": "打开连接",
  "nav.openConversation": "打开会话",
  "nav.openConversationDetails": "打开会话详情",
  "nav.openWorkspaceNavigation": "打开工作区导航",
  "nav.pendingPermissions": "{count} 个待处理权限",
  "nav.runs": "{count} 次运行",
  "nav.search": "搜索",
  "nav.searchConversations": "搜索会话",
  "nav.settings": "设置",
  "nav.workspaceNavigation": "工作区导航",
  "nav.workspaceStatus": "工作区状态",
  "nav.workspaceTools": "工作区工具",
  "settings.appearance": "外观",
  "settings.branch": "分支",
  "settings.darkMode": "深色模式",
  "settings.device": "设备",
  "settings.enterToSend": "回车发送消息",
  "settings.heartbeat": "心跳",
  "settings.keyboard": "键盘",
  "settings.keyboardDescription": "消息输入快捷键",
  "settings.messageInput": "消息输入",
  "settings.name": "名称",
  "settings.path": "路径",
  "settings.permissions": "权限",
  "settings.permissionsPending": "{count} 个待处理请求",
  "settings.platform": "平台",
  "settings.project": "项目",
  "settings.runtime": "运行时",
  "settings.runtimeDescription": "桌面运行时连接",
  "settings.shiftEnter": "Shift+Enter 插入新行。",
  "settings.version": "版本",
  "settings.workbenchDisplay": "工作台显示偏好",
  "settings.workspace": "工作区",
  "settings.workspaceDescription": "本地项目元数据",
  "state.connectionError": "连接错误",
  "state.controlPlaneOffline": "控制平面离线",
  "state.fetchingSnapshot": "正在获取最新控制平面快照。",
  "state.idle": "空闲",
  "state.loadingAgentHub": "正在加载 AgentHub",
  "state.loadingWorkbench": "正在加载工作台",
  "state.noBranch": "无分支",
  "state.noConversations": "还没有会话",
  "state.noParticipants": "无参与者",
  "state.noWorkspacePath": "无工作区路径",
  "state.runStatus": "运行 {status}",
};

function interpolate(template: string, values: TranslationValues = {}): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => String(values[key] ?? `{${key}}`));
}

export function createAgentHubI18n(locale: AgentHubLocale = "en-US"): AgentHubI18n {
  return {
    locale,
    t: (key, values) => {
      if (locale === "zh-CN") {
        return interpolate(zhCN[key], values);
      }
      return interpolate(String(values?.fallback ?? key), values);
    },
  };
}

const AgentHubI18nContext = React.createContext<AgentHubI18n>(createAgentHubI18n());

export function AgentHubI18nProvider(props: {
  readonly children: React.ReactNode;
  readonly locale?: AgentHubLocale | undefined;
}): React.ReactElement {
  const value = React.useMemo(() => createAgentHubI18n(props.locale), [props.locale]);
  return (
    <AgentHubI18nContext.Provider value={value}>{props.children}</AgentHubI18nContext.Provider>
  );
}

export function useAgentHubI18n(locale?: AgentHubLocale): AgentHubI18n {
  const context = React.useContext(AgentHubI18nContext);
  return React.useMemo(() => (locale ? createAgentHubI18n(locale) : context), [context, locale]);
}

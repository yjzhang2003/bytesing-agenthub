import { Bell, Info, Keyboard, Plug, Settings as SettingsIcon, UserRound } from "lucide-react";
import React from "react";
import type { AgentHubLocale } from "../i18n.js";
import { supportedAgentHubLocales, useAgentHubI18n } from "../i18n.js";
import type { InspectorSelection, WorkbenchViewModel } from "../types.js";
import { AgentHubButton, AgentHubSelect, AgentHubSwitch } from "./antd-primitives.js";
import { Icon, RuntimeStatusBadge } from "./primitives.js";

function SettingsNavItem(props: {
  readonly active?: boolean;
  readonly icon: React.ComponentProps<typeof Icon>["icon"];
  readonly label: string;
}): React.ReactElement {
  return (
    <button
      aria-current={props.active ? "page" : undefined}
      className="agenthub-settings-nav-item"
      type="button"
    >
      <Icon icon={props.icon} />
      <span>{props.label}</span>
    </button>
  );
}

function SettingsGroup(props: {
  readonly children: React.ReactNode;
  readonly title: string;
  readonly action?: React.ReactNode;
}): React.ReactElement {
  return (
    <section className="agenthub-settings-group">
      <header>
        <h3>{props.title}</h3>
        {props.action}
      </header>
      <div className="agenthub-settings-group-body">{props.children}</div>
    </section>
  );
}

function SettingsRow(props: {
  readonly title: string;
  readonly description?: React.ReactNode;
  readonly control?: React.ReactNode;
}): React.ReactElement {
  return (
    <div className="agenthub-settings-row">
      <span>
        <strong>{props.title}</strong>
        {props.description ? <small>{props.description}</small> : null}
      </span>
      {props.control ? <div className="agenthub-settings-row-control">{props.control}</div> : null}
    </div>
  );
}

export function SettingsPage(props: {
  readonly model: WorkbenchViewModel;
  readonly enterToSend: boolean;
  readonly locale?: AgentHubLocale | undefined;
  readonly theme: "light" | "dark";
  readonly onLocaleChange?: (locale: AgentHubLocale) => void;
  readonly onToggleEnterToSend: (enabled: boolean) => void;
  readonly onToggleTheme: () => void;
  readonly onSelect: (selection: InspectorSelection) => void;
}): React.ReactElement {
  const i18n = useAgentHubI18n(props.locale);
  const firstPermission = props.model.inspector.permissions[0];

  return (
    <div aria-label={i18n.t("settings.page")} className="agenthub-settings-page">
      <aside aria-label={i18n.t("settings.categories")} className="agenthub-settings-sidebar">
        <SettingsNavItem icon={UserRound} label={i18n.t("settings.accountStorage")} />
        <SettingsNavItem active icon={SettingsIcon} label={i18n.t("settings.general")} />
        <SettingsNavItem icon={Keyboard} label={i18n.t("settings.shortcuts")} />
        <SettingsNavItem icon={Bell} label={i18n.t("settings.notifications")} />
        <SettingsNavItem icon={Plug} label={i18n.t("settings.plugins")} />
        <SettingsNavItem icon={Info} label={i18n.t("settings.aboutAgentHub")} />
      </aside>

      <main className="agenthub-settings-content">
        <SettingsGroup
          action={
            <AgentHubSelect
              aria-label={i18n.t("language.language")}
              value={i18n.locale}
              onChange={(value) => props.onLocaleChange?.(value)}
              options={supportedAgentHubLocales.map((locale) => ({
                label:
                  locale === "zh-CN"
                    ? i18n.t("language.simplifiedChinese")
                    : i18n.t("language.english"),
                value: locale,
              }))}
            />
          }
          title={i18n.t("language.language")}
        >
          <SettingsRow
            description={`${i18n.t("language.preferences")} · ${i18n.t("language.english")} / ${i18n.t("language.simplifiedChinese")}`}
            title={i18n.t("settings.translateTextTo")}
          />
        </SettingsGroup>

        <SettingsGroup
          action={
            <AgentHubSwitch checked={props.theme === "dark"} onChange={props.onToggleTheme} />
          }
          title={i18n.t("settings.appearance", { fallback: "Appearance" })}
        >
          <SettingsRow
            description={i18n.t("settings.workbenchDisplay", {
              fallback: "Workbench display preferences",
            })}
            title={i18n.t("settings.darkMode", { fallback: "Dark mode" })}
          />
        </SettingsGroup>

        <SettingsGroup title={i18n.t("settings.keyboard", { fallback: "Keyboard" })}>
          <SettingsRow
            control={
              <AgentHubSwitch checked={props.enterToSend} onChange={props.onToggleEnterToSend} />
            }
            description={i18n.t("settings.shiftEnter", {
              fallback: "Shift+Enter inserts a new line.",
            })}
            title={i18n.t("settings.enterToSend", { fallback: "Enter sends message" })}
          />
        </SettingsGroup>

        <SettingsGroup title={i18n.t("settings.workspace", { fallback: "Workspace" })}>
          <SettingsRow
            description={props.model.workspace.workspacePathLabel}
            title={props.model.workspace.workspaceName}
          />
          <SettingsRow
            description={props.model.workspace.branchLabel}
            title={i18n.t("settings.branch", { fallback: "Branch" })}
          />
        </SettingsGroup>

        <SettingsGroup
          action={<RuntimeStatusBadge status={props.model.runtime.status} />}
          title={i18n.t("settings.runtime", { fallback: "Runtime" })}
        >
          <SettingsRow
            description={`${props.model.runtime.platform} · ${props.model.runtime.appVersion}`}
            title={props.model.runtime.label}
          />
          <SettingsRow
            description={props.model.runtime.lastHeartbeatLabel}
            title={i18n.t("settings.heartbeat", { fallback: "Heartbeat" })}
          />
        </SettingsGroup>

        <SettingsGroup title={i18n.t("settings.permissions", { fallback: "Permissions" })}>
          <SettingsRow
            control={
              firstPermission ? (
                <AgentHubButton
                  htmlType="button"
                  onClick={() => props.onSelect({ id: firstPermission.id, mode: "permission" })}
                >
                  {i18n.t("actions.review", { fallback: "Review" })}
                </AgentHubButton>
              ) : null
            }
            description={i18n.t("settings.permissionsPending", {
              fallback: `${props.model.workspace.pendingPermissionCount} pending request(s)`,
              count: props.model.workspace.pendingPermissionCount,
            })}
            title={i18n.t("settings.permissions", { fallback: "Permissions" })}
          />
        </SettingsGroup>
      </main>
    </div>
  );
}

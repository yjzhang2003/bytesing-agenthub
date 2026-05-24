import { Bell, Info, Keyboard, Plug, Settings as SettingsIcon, UserRound } from "lucide-react";
import React from "react";
import type { AgentHubLocale } from "../i18n.js";
import { supportedAgentHubLocales, useAgentHubI18n } from "../i18n.js";
import type { InspectorSelection, WorkbenchViewModel } from "../types.js";
import {
  AgentHubAvatar,
  AgentHubBadge,
  AgentHubButton,
  AgentHubSelect,
  AgentHubSwitch,
} from "./system.js";
import { Icon, RuntimeStatusBadge, SidebarSearchField } from "./primitives.js";

export type SettingsCategoryId =
  | "account"
  | "general"
  | "shortcuts"
  | "notifications"
  | "plugins"
  | "about";

function SettingsCategoryRow(props: {
  readonly active?: boolean;
  readonly icon: React.ComponentProps<typeof Icon>["icon"];
  readonly label: string;
  readonly description: string;
  readonly count?: number;
  readonly onSelect: () => void;
}): React.ReactElement {
  return (
    <AgentHubButton
      aria-pressed={props.active}
      className="agenthub-agent-contact-row agenthub-settings-category-row"
      htmlType="button"
      onClick={props.onSelect}
    >
      <AgentHubAvatar className="agenthub-agent-avatar" size={44}>
        <Icon icon={props.icon} />
      </AgentHubAvatar>
      <span className="agenthub-agent-contact-copy">
        <span className="agenthub-row-main">{props.label}</span>
        <small>{props.description}</small>
      </span>
      {typeof props.count === "number" ? <AgentHubBadge count={props.count} size="small" /> : null}
    </AgentHubButton>
  );
}

export function SettingsDirectory(props: {
  readonly pendingPermissionCount: number;
  readonly selectedCategory: SettingsCategoryId;
  readonly onSelectCategory: (category: SettingsCategoryId) => void;
}): React.ReactElement {
  const i18n = useAgentHubI18n();
  const [query, setQuery] = React.useState("");
  const categories: readonly {
    readonly id: SettingsCategoryId;
    readonly icon: React.ComponentProps<typeof Icon>["icon"];
    readonly label: string;
    readonly description: string;
    readonly count?: number;
  }[] = [
    {
      id: "account",
      icon: UserRound,
      label: i18n.t("settings.accountStorage"),
      description: i18n.t("settings.workspaceDescription"),
    },
    {
      id: "general",
      icon: SettingsIcon,
      label: i18n.t("settings.general"),
      description: i18n.t("settings.workbenchDisplay"),
    },
    {
      id: "shortcuts",
      icon: Keyboard,
      label: i18n.t("settings.shortcuts"),
      description: i18n.t("settings.keyboardDescription"),
    },
    {
      id: "notifications",
      icon: Bell,
      label: i18n.t("settings.notifications"),
      description: i18n.t("settings.permissions"),
      count: props.pendingPermissionCount,
    },
    {
      id: "plugins",
      icon: Plug,
      label: i18n.t("settings.plugins"),
      description: i18n.t("settings.runtimeDescription"),
    },
    {
      id: "about",
      icon: Info,
      label: i18n.t("settings.aboutAgentHub"),
      description: i18n.t("settings.runtime"),
    },
  ];
  const normalizedQuery = query.trim().toLowerCase();
  const filteredCategories = normalizedQuery
    ? categories.filter((category) =>
        [category.label, category.description].some((value) =>
          value.toLowerCase().includes(normalizedQuery),
        ),
      )
    : categories;

  return (
    <section
      aria-label={i18n.t("settings.categories")}
      className="agenthub-chat-list-panel agenthub-agent-directory-sidebar agenthub-settings-directory"
    >
      <header className="agenthub-chat-list-header">
        <SidebarSearchField
          label={i18n.t("settings.searchSettings", { fallback: "Search settings" })}
          onChange={(event) => setQuery(event.currentTarget.value)}
          placeholder={i18n.t("settings.searchSettings", { fallback: "Search settings" })}
          value={query}
        />
      </header>
      <nav aria-label={i18n.t("settings.categories")} className="agenthub-agent-directory-list">
        <small className="agenthub-agent-directory-group">{i18n.t("settings.general")}</small>
        {filteredCategories.map((category) => (
          <SettingsCategoryRow
            active={props.selectedCategory === category.id}
            description={category.description}
            icon={category.icon}
            key={category.id}
            label={category.label}
            onSelect={() => props.onSelectCategory(category.id)}
            {...(typeof category.count === "number" ? { count: category.count } : {})}
          />
        ))}
      </nav>
    </section>
  );
}

function SettingsGroup(props: {
  readonly children: React.ReactNode;
  readonly title: string;
}): React.ReactElement {
  return (
    <section className="agenthub-agent-settings-group agenthub-settings-section">
      <header>
        <h3>{props.title}</h3>
      </header>
      <div className="agenthub-agent-settings-body">{props.children}</div>
    </section>
  );
}

function SettingsRow(props: {
  readonly title: string;
  readonly description?: React.ReactNode;
  readonly control?: React.ReactNode;
  readonly code?: boolean;
}): React.ReactElement {
  const value = props.code ? (
    <code>{props.description}</code>
  ) : props.description ? (
    <strong>{props.description}</strong>
  ) : props.control ? (
    <div className="agenthub-settings-control-value">{props.control}</div>
  ) : (
    <strong />
  );

  return (
    <div className="agenthub-agent-readonly-row agenthub-settings-row">
      <span>{props.title}</span>
      {props.control && props.description ? (
        <div className="agenthub-settings-control-value">
          <span className="agenthub-settings-control-copy">{props.description}</span>
          {props.control}
        </div>
      ) : (
        value
      )}
    </div>
  );
}

export function SettingsPage(props: {
  readonly model: WorkbenchViewModel;
  readonly enterToSend: boolean;
  readonly locale?: AgentHubLocale | undefined;
  readonly selectedCategory?: SettingsCategoryId;
  readonly theme: "light" | "dark";
  readonly onLocaleChange?: (locale: AgentHubLocale) => void;
  readonly onToggleEnterToSend: (enabled: boolean) => void;
  readonly onToggleTheme: () => void;
  readonly onSelect: (selection: InspectorSelection) => void;
}): React.ReactElement {
  const i18n = useAgentHubI18n(props.locale);
  const firstPermission = props.model.inspector.permissions[0];
  const selectedCategory = props.selectedCategory ?? "general";
  const titleByCategory: Record<SettingsCategoryId, string> = {
    account: i18n.t("settings.accountStorage"),
    general: i18n.t("settings.general"),
    shortcuts: i18n.t("settings.shortcuts"),
    notifications: i18n.t("settings.notifications"),
    plugins: i18n.t("settings.plugins"),
    about: i18n.t("settings.aboutAgentHub"),
  };
  const descriptionByCategory: Record<SettingsCategoryId, string> = {
    account: i18n.t("settings.workspaceDescription"),
    general: i18n.t("settings.workbenchDisplay"),
    shortcuts: i18n.t("settings.keyboardDescription"),
    notifications: i18n.t("settings.permissions"),
    plugins: i18n.t("settings.runtimeDescription"),
    about: i18n.t("settings.runtime"),
  };

  return (
    <div aria-label={i18n.t("settings.page")} className="agenthub-agents-page agenthub-settings-page">
      <section className="agenthub-agent-detail agenthub-settings-detail">
        <header className="agenthub-agent-profile">
          <AgentHubAvatar className="agenthub-agent-profile-avatar" size={52}>
            <Icon icon={SettingsIcon} />
          </AgentHubAvatar>
          <div className="agenthub-agent-profile-copy">
            <strong>{titleByCategory[selectedCategory]}</strong>
            <span className="agenthub-agent-status-pill">
              {descriptionByCategory[selectedCategory]}
            </span>
          </div>
        </header>
        <div className="agenthub-agent-editor agenthub-settings-editor">
          {selectedCategory === "general" ? (
            <>
              <SettingsGroup title={i18n.t("language.language")}>
                <SettingsRow
                  control={
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
                  description={`${i18n.t("language.preferences")} · ${i18n.t("language.english")} / ${i18n.t("language.simplifiedChinese")}`}
                  title={i18n.t("settings.translateTextTo")}
                />
              </SettingsGroup>

              <SettingsGroup title={i18n.t("settings.appearance", { fallback: "Appearance" })}>
                <SettingsRow
                  control={
                    <AgentHubSwitch
                      ariaLabel={i18n.t("settings.darkMode", { fallback: "Dark mode" })}
                      checked={props.theme === "dark"}
                      onChange={props.onToggleTheme}
                    />
                  }
                  description={i18n.t("settings.workbenchDisplay", {
                    fallback: "Workbench display preferences",
                  })}
                  title={i18n.t("settings.darkMode", { fallback: "Dark mode" })}
                />
              </SettingsGroup>
            </>
          ) : null}

          {selectedCategory === "shortcuts" ? (
            <SettingsGroup title={i18n.t("settings.keyboard", { fallback: "Keyboard" })}>
              <SettingsRow
                control={
                  <AgentHubSwitch
                    ariaLabel={i18n.t("settings.enterToSend", { fallback: "Enter sends message" })}
                    checked={props.enterToSend}
                    onChange={props.onToggleEnterToSend}
                  />
                }
                description={i18n.t("settings.shiftEnter", {
                  fallback: "Shift+Enter inserts a new line.",
                })}
                title={i18n.t("settings.enterToSend", { fallback: "Enter sends message" })}
              />
            </SettingsGroup>
          ) : null}

          {selectedCategory === "account" ? (
            <SettingsGroup title={i18n.t("settings.workspace", { fallback: "Workspace" })}>
              <SettingsRow
                code
                description={props.model.workspace.workspacePathLabel}
                title={props.model.workspace.workspaceName}
              />
              <SettingsRow
                description={props.model.workspace.branchLabel}
                title={i18n.t("settings.branch", { fallback: "Branch" })}
              />
            </SettingsGroup>
          ) : null}

          {selectedCategory === "plugins" || selectedCategory === "about" ? (
            <SettingsGroup title={i18n.t("settings.runtime", { fallback: "Runtime" })}>
              <SettingsRow
                control={<RuntimeStatusBadge status={props.model.runtime.status} />}
                description={`${props.model.runtime.platform} · ${props.model.runtime.appVersion}`}
                title={props.model.runtime.label}
              />
              <SettingsRow
                description={props.model.runtime.lastHeartbeatLabel}
                title={i18n.t("settings.heartbeat", { fallback: "Heartbeat" })}
              />
            </SettingsGroup>
          ) : null}

          {selectedCategory === "notifications" ? (
            <SettingsGroup title={i18n.t("settings.permissions", { fallback: "Permissions" })}>
              <SettingsRow
                control={
                  firstPermission ? (
                    <AgentHubButton
                      htmlType="button"
                      onClick={() =>
                        props.onSelect({ id: firstPermission.id, mode: "permission" })
                      }
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
          ) : null}

          {selectedCategory === "about" ? (
            <SettingsGroup title={i18n.t("settings.aboutAgentHub")}>
              <SettingsRow
                description={props.model.workspace.workspaceName}
                title={i18n.t("settings.project")}
              />
              <SettingsRow
                description={props.model.runtime.appVersion}
                title={i18n.t("settings.version")}
              />
            </SettingsGroup>
          ) : null}
        </div>
      </section>
    </div>
  );
}

import React from "react";
import type { AgentHubLocale } from "../i18n.js";
import { supportedAgentHubLocales, useAgentHubI18n } from "../i18n.js";
import type { InspectorSelection, WorkbenchViewModel } from "../types.js";
import { AgentHubButton, AgentHubSelect, AgentHubSwitch } from "./antd-primitives.js";
import { DetailSection, RuntimeStatusBadge } from "./primitives.js";

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
      <section className="agenthub-settings-panel">
        <header>
          <div>
            <strong>{i18n.t("settings.workspace", { fallback: "Workspace" })}</strong>
            <p className="agenthub-muted">
              {i18n.t("settings.workspaceDescription", { fallback: "Local project metadata" })}
            </p>
          </div>
        </header>
        <DetailSection title={i18n.t("settings.project", { fallback: "Project" })}>
          <dl>
            <dt>{i18n.t("settings.name", { fallback: "Name" })}</dt>
            <dd>{props.model.workspace.workspaceName}</dd>
            <dt>{i18n.t("settings.path", { fallback: "Path" })}</dt>
            <dd>{props.model.workspace.workspacePathLabel}</dd>
            <dt>{i18n.t("settings.branch", { fallback: "Branch" })}</dt>
            <dd>{props.model.workspace.branchLabel}</dd>
          </dl>
        </DetailSection>
      </section>

      <section className="agenthub-settings-panel">
        <header>
          <div>
            <strong>{i18n.t("settings.keyboard", { fallback: "Keyboard" })}</strong>
            <p className="agenthub-muted">
              {i18n.t("settings.keyboardDescription", { fallback: "Message composer shortcuts" })}
            </p>
          </div>
        </header>
        <DetailSection title={i18n.t("settings.messageInput", { fallback: "Message input" })}>
          <div className="agenthub-settings-stack">
            <label className="agenthub-settings-switch">
              <span>
                <strong>
                  {i18n.t("settings.enterToSend", { fallback: "Enter sends message" })}
                </strong>
                <small>
                  {i18n.t("settings.shiftEnter", { fallback: "Shift+Enter inserts a new line." })}
                </small>
              </span>
              <AgentHubSwitch checked={props.enterToSend} onChange={props.onToggleEnterToSend} />
            </label>
          </div>
        </DetailSection>
      </section>

      <section className="agenthub-settings-panel">
        <header>
          <div>
            <strong>{i18n.t("language.language")}</strong>
            <p className="agenthub-muted">
              {i18n.t("language.preferences")} · {i18n.t("language.english")} /{" "}
              {i18n.t("language.simplifiedChinese")}
            </p>
          </div>
        </header>
        <DetailSection title={i18n.t("language.language")}>
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
        </DetailSection>
      </section>

      <section className="agenthub-settings-panel">
        <header>
          <div>
            <strong>{i18n.t("settings.runtime", { fallback: "Runtime" })}</strong>
            <p className="agenthub-muted">
              {i18n.t("settings.runtimeDescription", { fallback: "Desktop runtime connection" })}
            </p>
          </div>
          <RuntimeStatusBadge status={props.model.runtime.status} />
        </header>
        <DetailSection title={i18n.t("settings.device", { fallback: "Device" })}>
          <dl>
            <dt>{i18n.t("settings.name", { fallback: "Name" })}</dt>
            <dd>{props.model.runtime.label}</dd>
            <dt>{i18n.t("settings.platform", { fallback: "Platform" })}</dt>
            <dd>{props.model.runtime.platform}</dd>
            <dt>{i18n.t("settings.version", { fallback: "Version" })}</dt>
            <dd>{props.model.runtime.appVersion}</dd>
            <dt>{i18n.t("settings.heartbeat", { fallback: "Heartbeat" })}</dt>
            <dd>{props.model.runtime.lastHeartbeatLabel}</dd>
          </dl>
        </DetailSection>
      </section>

      <section className="agenthub-settings-panel">
        <header>
          <div>
            <strong>{i18n.t("settings.appearance", { fallback: "Appearance" })}</strong>
            <p className="agenthub-muted">
              {i18n.t("settings.workbenchDisplay", { fallback: "Workbench display preferences" })}
            </p>
          </div>
          <label className="agenthub-settings-switch">
            <span>{i18n.t("settings.darkMode", { fallback: "Dark mode" })}</span>
            <AgentHubSwitch checked={props.theme === "dark"} onChange={props.onToggleTheme} />
          </label>
        </header>
      </section>

      <section className="agenthub-settings-panel">
        <header>
          <div>
            <strong>{i18n.t("settings.permissions", { fallback: "Permissions" })}</strong>
            <p className="agenthub-muted">
              {i18n.t("settings.permissionsPending", {
                fallback: `${props.model.workspace.pendingPermissionCount} pending request(s)`,
                count: props.model.workspace.pendingPermissionCount,
              })}
            </p>
          </div>
          {firstPermission ? (
            <AgentHubButton
              htmlType="button"
              onClick={() => props.onSelect({ id: firstPermission.id, mode: "permission" })}
            >
              {i18n.t("actions.review", { fallback: "Review" })}
            </AgentHubButton>
          ) : null}
        </header>
      </section>
    </div>
  );
}

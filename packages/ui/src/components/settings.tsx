import React from "react";
import type { InspectorSelection, WorkbenchViewModel } from "../types.js";
import { AgentHubButton, AgentHubSwitch } from "./antd-primitives.js";
import { DetailSection, RuntimeStatusBadge } from "./primitives.js";

export function SettingsPage(props: {
  readonly model: WorkbenchViewModel;
  readonly theme: "light" | "dark";
  readonly onToggleTheme: () => void;
  readonly onSelect: (selection: InspectorSelection) => void;
}): React.ReactElement {
  const firstPermission = props.model.inspector.permissions[0];

  return (
    <div aria-label="Settings page" className="agenthub-settings-page">
      <section className="agenthub-settings-panel">
        <header>
          <div>
            <strong>Workspace</strong>
            <p className="agenthub-muted">Local project metadata</p>
          </div>
        </header>
        <DetailSection title="Project">
          <dl>
            <dt>Name</dt>
            <dd>{props.model.workspace.workspaceName}</dd>
            <dt>Path</dt>
            <dd>{props.model.workspace.workspacePathLabel}</dd>
            <dt>Branch</dt>
            <dd>{props.model.workspace.branchLabel}</dd>
          </dl>
        </DetailSection>
      </section>

      <section className="agenthub-settings-panel">
        <header>
          <div>
            <strong>Runtime</strong>
            <p className="agenthub-muted">Desktop runtime connection</p>
          </div>
          <RuntimeStatusBadge status={props.model.runtime.status} />
        </header>
        <DetailSection title="Device">
          <dl>
            <dt>Name</dt>
            <dd>{props.model.runtime.label}</dd>
            <dt>Platform</dt>
            <dd>{props.model.runtime.platform}</dd>
            <dt>Version</dt>
            <dd>{props.model.runtime.appVersion}</dd>
            <dt>Heartbeat</dt>
            <dd>{props.model.runtime.lastHeartbeatLabel}</dd>
          </dl>
        </DetailSection>
      </section>

      <section className="agenthub-settings-panel">
        <header>
          <div>
            <strong>Appearance</strong>
            <p className="agenthub-muted">Workbench display preferences</p>
          </div>
          <label className="agenthub-settings-switch">
            <span>Dark mode</span>
            <AgentHubSwitch checked={props.theme === "dark"} onChange={props.onToggleTheme} />
          </label>
        </header>
      </section>

      <section className="agenthub-settings-panel">
        <header>
          <div>
            <strong>Permissions</strong>
            <p className="agenthub-muted">{props.model.workspace.pendingPermissionCount} pending request(s)</p>
          </div>
          {firstPermission ? (
            <AgentHubButton
              htmlType="button"
              onClick={() => props.onSelect({ id: firstPermission.id, mode: "permission" })}
            >
              Review
            </AgentHubButton>
          ) : null}
        </header>
      </section>
    </div>
  );
}

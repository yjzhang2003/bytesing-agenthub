import { AlertTriangle, CheckCircle2, RefreshCw } from "lucide-react";
import React from "react";
import { useAgentHubI18n } from "../i18n.js";
import type { ProviderConnectionViewModel, WorkbenchViewModel } from "../types.js";
import { AgentHubAvatar, AgentHubBadge, AgentHubButton } from "./antd-primitives.js";
import { DetailSection, Icon, RuntimeStatusBadge } from "./primitives.js";

function ProviderConnectionRow(props: {
  readonly provider: ProviderConnectionViewModel;
  readonly selected: boolean;
  readonly onSelect: () => void;
}): React.ReactElement {
  const i18n = useAgentHubI18n();
  const icon = props.provider.statusTone === "connected" ? CheckCircle2 : AlertTriangle;
  return (
    <AgentHubButton
      aria-pressed={props.selected}
      className="agenthub-provider-row"
      htmlType="button"
      onClick={props.onSelect}
    >
      <AgentHubAvatar className="agenthub-provider-avatar" icon={<Icon icon={icon} />} size={24} />
      <span className="agenthub-row-main">{props.provider.label}</span>
      <AgentHubBadge
        status={props.provider.statusTone === "connected" ? "success" : "warning"}
        text={props.provider.status}
      />
      <span className="agenthub-timeline-line">
        {props.provider.comingSoon
          ? props.provider.status || i18n.t("connections.notConfigured")
          : props.provider.binaryPathLabel}
      </span>
    </AgentHubButton>
  );
}

function ProviderConnectionDetail(props: {
  readonly provider: ProviderConnectionViewModel;
  readonly runtime: WorkbenchViewModel["runtime"];
  readonly onRefreshConnections?: () => void;
}): React.ReactElement {
  const i18n = useAgentHubI18n();
  return (
    <section className="agenthub-settings-panel">
      <header>
        <div>
          <strong>{props.provider.label}</strong>
          <p className="agenthub-muted">
            {props.provider.comingSoon
              ? i18n.t("connections.futureProvider")
              : i18n.t("connections.localProvider")}
          </p>
        </div>
        <RuntimeStatusBadge status={props.runtime.status} />
      </header>
      <DetailSection title={i18n.t("connections.connection")}>
        <dl>
          <dt>{i18n.t("connections.status")}</dt>
          <dd>{props.provider.status}</dd>
          <dt>{i18n.t("connections.mode")}</dt>
          <dd>{props.provider.providerMode}</dd>
          <dt>{i18n.t("connections.binary")}</dt>
          <dd>{props.provider.binaryPathLabel}</dd>
          <dt>{i18n.t("connections.checked")}</dt>
          <dd>{props.provider.checkedAt}</dd>
          {props.provider.failureReason ? (
            <>
              <dt>{i18n.t("connections.issue")}</dt>
              <dd>{props.provider.failureReason}</dd>
            </>
          ) : null}
        </dl>
      </DetailSection>
      <div className="agenthub-action-row">
        <AgentHubButton
          disabled={props.provider.comingSoon}
          htmlType="button"
          onClick={props.onRefreshConnections}
        >
          <Icon icon={RefreshCw} /> {i18n.t("actions.refreshStatus")}
        </AgentHubButton>
        {props.provider.comingSoon ? (
          <span className="agenthub-muted">{i18n.t("connections.notConfigured")}</span>
        ) : null}
      </div>
    </section>
  );
}

export function ConnectionsPage(props: {
  readonly model: WorkbenchViewModel;
  readonly onResizeProviders?: (event: React.PointerEvent) => void;
  readonly onRefreshConnections?: () => void;
}): React.ReactElement {
  const i18n = useAgentHubI18n();
  const [selectedProviderId, setSelectedProviderId] = React.useState("claude-code");
  const selected =
    props.model.connections.providers.find((provider) => provider.id === selectedProviderId) ??
    props.model.connections.providers[0];

  return (
    <div aria-label={i18n.t("connections.connections")} className="agenthub-settings-page">
      <section className="agenthub-settings-panel agenthub-connections-panel">
        <header>
          <div>
            <strong>{i18n.t("connections.connections")}</strong>
            <p className="agenthub-muted">{i18n.t("connections.connectionsDescription")}</p>
          </div>
        </header>
        <div className="agenthub-connections-layout">
          <nav
            aria-label={i18n.t("connections.providerConnections")}
            className="agenthub-provider-list"
          >
            {props.model.connections.providers.map((provider) => (
              <ProviderConnectionRow
                key={provider.id}
                provider={provider}
                selected={provider.id === selected?.id}
                onSelect={() => setSelectedProviderId(provider.id)}
              />
            ))}
          </nav>
          <div
            aria-label={i18n.t("connections.resizeProviderList")}
            className="agenthub-resize-handle agenthub-directory-resize-handle"
            onPointerDown={props.onResizeProviders}
            role="separator"
            tabIndex={0}
          />
          {selected ? (
            <ProviderConnectionDetail
              provider={selected}
              runtime={props.model.runtime}
              {...(props.onRefreshConnections
                ? { onRefreshConnections: props.onRefreshConnections }
                : {})}
            />
          ) : null}
        </div>
      </section>
      <section className="agenthub-settings-panel">
        <header>
          <div>
            <strong>{i18n.t("connections.longTermMemory")}</strong>
            <p className="agenthub-muted">{i18n.t("connections.serviceStatus")}</p>
          </div>
        </header>
        <DetailSection title={i18n.t("connections.agentmemory")}>
          <dl>
            <dt>{i18n.t("connections.enabled")}</dt>
            <dd>{props.model.connections.memory.enabled ? "true" : "false"}</dd>
            <dt>{i18n.t("connections.status")}</dt>
            <dd>{props.model.connections.memory.status}</dd>
            <dt>{i18n.t("connections.url")}</dt>
            <dd>{props.model.connections.memory.url}</dd>
            <dt>{i18n.t("connections.viewer")}</dt>
            <dd>{props.model.connections.memory.viewerUrl}</dd>
            <dt>{i18n.t("connections.checked")}</dt>
            <dd>{props.model.connections.memory.checkedAt}</dd>
            {props.model.connections.memory.failureReason ? (
              <>
                <dt>{i18n.t("connections.issue")}</dt>
                <dd>{props.model.connections.memory.failureReason}</dd>
              </>
            ) : null}
          </dl>
        </DetailSection>
      </section>
    </div>
  );
}

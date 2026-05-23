import { AlertTriangle, CheckCircle2, RefreshCw } from "lucide-react";
import React from "react";
import type { ProviderConnectionViewModel, WorkbenchViewModel } from "../types.js";
import { AgentHubAvatar, AgentHubBadge, AgentHubButton } from "./antd-primitives.js";
import { DetailSection, Icon, RuntimeStatusBadge } from "./primitives.js";

function ProviderConnectionRow(props: {
  readonly provider: ProviderConnectionViewModel;
  readonly selected: boolean;
  readonly onSelect: () => void;
}): React.ReactElement {
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
        {props.provider.comingSoon ? "Coming soon" : props.provider.binaryPathLabel}
      </span>
    </AgentHubButton>
  );
}

function ProviderConnectionDetail(props: {
  readonly provider: ProviderConnectionViewModel;
  readonly runtime: WorkbenchViewModel["runtime"];
  readonly onRefreshConnections?: () => void;
}): React.ReactElement {
  return (
    <section className="agenthub-settings-panel">
      <header>
        <div>
          <strong>{props.provider.label}</strong>
          <p className="agenthub-muted">
            {props.provider.comingSoon ? "Future provider slot" : "Local provider connection"}
          </p>
        </div>
        <RuntimeStatusBadge status={props.runtime.status} />
      </header>
      <DetailSection title="Connection">
        <dl>
          <dt>Status</dt>
          <dd>{props.provider.status}</dd>
          <dt>Mode</dt>
          <dd>{props.provider.providerMode}</dd>
          <dt>Binary</dt>
          <dd>{props.provider.binaryPathLabel}</dd>
          <dt>Checked</dt>
          <dd>{props.provider.checkedAt}</dd>
          {props.provider.failureReason ? (
            <>
              <dt>Issue</dt>
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
          <Icon icon={RefreshCw} /> Refresh status
        </AgentHubButton>
        {props.provider.comingSoon ? <span className="agenthub-muted">Not configured</span> : null}
      </div>
    </section>
  );
}

export function ConnectionsPage(props: {
  readonly model: WorkbenchViewModel;
  readonly onResizeProviders?: (event: React.PointerEvent) => void;
  readonly onRefreshConnections?: () => void;
}): React.ReactElement {
  const [selectedProviderId, setSelectedProviderId] = React.useState("claude-code");
  const selected =
    props.model.connections.providers.find((provider) => provider.id === selectedProviderId) ??
    props.model.connections.providers[0];

  return (
    <div aria-label="Connections page" className="agenthub-settings-page">
      <section className="agenthub-settings-panel agenthub-connections-panel">
        <header>
          <div>
            <strong>Connections</strong>
            <p className="agenthub-muted">Local providers and memory services</p>
          </div>
        </header>
        <div className="agenthub-connections-layout">
          <nav aria-label="Provider connections" className="agenthub-provider-list">
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
            aria-label="Resize provider list"
            className="agenthub-resize-handle agenthub-directory-resize-handle"
            onPointerDown={props.onResizeProviders}
            role="separator"
            tabIndex={0}
          />
          {selected ? (
            <ProviderConnectionDetail
              provider={selected}
              runtime={props.model.runtime}
              {...(props.onRefreshConnections ? { onRefreshConnections: props.onRefreshConnections } : {})}
            />
          ) : null}
        </div>
      </section>
      <section className="agenthub-settings-panel">
        <header>
          <div>
            <strong>Long-term memory</strong>
            <p className="agenthub-muted">agentmemory service status</p>
          </div>
        </header>
        <DetailSection title="agentmemory">
          <dl>
            <dt>Enabled</dt>
            <dd>{props.model.connections.memory.enabled ? "true" : "false"}</dd>
            <dt>Status</dt>
            <dd>{props.model.connections.memory.status}</dd>
            <dt>URL</dt>
            <dd>{props.model.connections.memory.url}</dd>
            <dt>Viewer</dt>
            <dd>{props.model.connections.memory.viewerUrl}</dd>
            <dt>Checked</dt>
            <dd>{props.model.connections.memory.checkedAt}</dd>
            {props.model.connections.memory.failureReason ? (
              <>
                <dt>Issue</dt>
                <dd>{props.model.connections.memory.failureReason}</dd>
              </>
            ) : null}
          </dl>
        </DetailSection>
      </section>
    </div>
  );
}

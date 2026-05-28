import { AlertTriangle, BrainCircuit, Cable, CheckCircle2, Cpu, RefreshCw } from "lucide-react";
import React from "react";
import { useAgentHubI18n } from "../i18n.js";
import type {
  ConnectionCheckTargetId,
  ConnectionItemViewModel,
  ConnectionMetadataRow,
  WorkbenchViewModel,
} from "../types.js";
import { AgentHubAvatar, AgentHubBadge, AgentHubButton } from "./system.js";
import { Icon, SidebarSearchField } from "./primitives.js";

function connectionIcon(connection: ConnectionItemViewModel) {
  if (connection.kind === "runtime") {
    return Cpu;
  }
  if (connection.kind === "memory") {
    return BrainCircuit;
  }
  return connection.statusTone === "connected" ? CheckCircle2 : AlertTriangle;
}

function ConnectionRow(props: {
  readonly connection: ConnectionItemViewModel;
  readonly selected: boolean;
  readonly onSelect: () => void;
}): React.ReactElement {
  const status = props.connection.statusTone === "connected" ? "success" : "warning";
  return (
    <AgentHubButton
      aria-pressed={props.selected}
      className="agenthub-agent-contact-row agenthub-connection-contact-row"
      data-tone={props.connection.statusTone}
      htmlType="button"
      onClick={props.onSelect}
    >
      <AgentHubAvatar className="agenthub-agent-avatar" size={44}>
        <Icon icon={connectionIcon(props.connection)} />
      </AgentHubAvatar>
      <span className="agenthub-agent-contact-copy">
        <span className="agenthub-row-main">{props.connection.label}</span>
        <small>
          {props.connection.disabledReason ?? props.connection.description}
          {" · "}
          {props.connection.checkedAt}
        </small>
      </span>
      <AgentHubBadge
        status={props.connection.statusTone === "disabled" ? "default" : status}
        text={props.connection.checking ? "Checking" : props.connection.status}
      />
    </AgentHubButton>
  );
}

function translatedRowLabel(
  i18n: ReturnType<typeof useAgentHubI18n>,
  row: ConnectionMetadataRow,
): string {
  return row.labelKey ? i18n.t(row.labelKey as never) : row.label;
}

function translatedRowValue(
  i18n: ReturnType<typeof useAgentHubI18n>,
  row: ConnectionMetadataRow,
): string {
  return row.valueKey ? i18n.t(row.valueKey as never) : row.value;
}

export function ConnectionsDirectory(props: {
  readonly model: WorkbenchViewModel;
  readonly selectedConnectionId: string | null;
  readonly onSelectConnection: (connectionId: string) => void;
  readonly onCheckConnections?: (targets: readonly ConnectionCheckTargetId[]) => void;
}): React.ReactElement {
  const i18n = useAgentHubI18n();
  const [query, setQuery] = React.useState("");
  const normalizedQuery = query.trim().toLowerCase();
  const filteredConnections = normalizedQuery
    ? props.model.connections.items.filter((connection) =>
        [
          connection.label,
          connection.description,
          connection.status,
          connection.disabledReason ?? "",
          connection.failureReason ?? "",
          connection.setupGuidance?.messageKey
            ? i18n.t(connection.setupGuidance.messageKey as never)
            : "",
          ...connection.metadata.map((row) => `${row.label} ${row.value}`),
          ...connection.detailGroups.flatMap((group) =>
            group.rows.map((row) => `${row.label} ${row.value}`),
          ),
        ].some((value) => value.toLowerCase().includes(normalizedQuery)),
      )
    : props.model.connections.items;
  const checkableTargets = props.model.connections.items
    .filter((connection) => connection.checkable && connection.checkTarget)
    .map((connection) => connection.checkTarget)
    .concat(
      props.model.connections.items
        .filter((connection) => connection.detailCheckable && connection.detailCheckTarget)
        .map((connection) => connection.detailCheckTarget),
    )
    .filter((target): target is ConnectionCheckTargetId => Boolean(target));

  return (
    <section
      aria-label={i18n.t("connections.providerConnections")}
      className="agenthub-chat-list-panel agenthub-agent-directory-sidebar agenthub-connection-directory"
    >
      <header className="agenthub-chat-list-header">
        <SidebarSearchField
          label={i18n.t("connections.providerConnections")}
          onChange={(event) => setQuery(event.currentTarget.value)}
          placeholder={i18n.t("connections.providerConnections")}
          value={query}
        />
        <AgentHubButton
          aria-label={i18n.t("connections.checkAll")}
          className="agenthub-icon-button"
          disabled={checkableTargets.length === 0}
          htmlType="button"
          onClick={() => props.onCheckConnections?.(checkableTargets)}
        >
          <Icon icon={Cable} />
        </AgentHubButton>
      </header>
      <nav
        aria-label={i18n.t("connections.providerConnections")}
        className="agenthub-agent-directory-list"
      >
        <small className="agenthub-agent-directory-group">
          {i18n.t("connections.connections")}
        </small>
        {filteredConnections.map((connection) => (
          <ConnectionRow
            connection={connection}
            key={connection.id}
            selected={connection.id === props.selectedConnectionId}
            onSelect={() => props.onSelectConnection(connection.id)}
          />
        ))}
      </nav>
    </section>
  );
}

function ConnectionReadOnlyRow(props: {
  readonly title: string;
  readonly value: React.ReactNode;
}): React.ReactElement {
  return (
    <div className="agenthub-agent-readonly-row">
      <span>{props.title}</span>
      {typeof props.value === "string" ? <strong>{props.value}</strong> : props.value}
    </div>
  );
}

function ConnectionGroup(props: {
  readonly children: React.ReactNode;
  readonly title: string;
}): React.ReactElement {
  return (
    <section className="agenthub-agent-settings-group">
      <header>
        <h3>{props.title}</h3>
      </header>
      <div className="agenthub-agent-settings-body">{props.children}</div>
    </section>
  );
}

function ConnectionSetupGuidance(props: {
  readonly connection: ConnectionItemViewModel;
}): React.ReactElement | null {
  const i18n = useAgentHubI18n();
  const guidance = props.connection.setupGuidance;
  if (!guidance) {
    return null;
  }
  return (
    <ConnectionGroup title={i18n.t(guidance.titleKey as never)}>
      <ConnectionReadOnlyRow
        title={i18n.t("connections.recommendedAction")}
        value={i18n.t(guidance.messageKey as never)}
      />
      {guidance.diagnostic ? (
        <ConnectionReadOnlyRow
          title={i18n.t("connections.diagnostics")}
          value={guidance.diagnostic}
        />
      ) : null}
    </ConnectionGroup>
  );
}

function ConnectionCheckActions(props: {
  readonly canCheck: boolean;
  readonly connection: ConnectionItemViewModel;
  readonly onCheckConnection: ((target: ConnectionCheckTargetId) => void) | undefined;
}): React.ReactElement | null {
  const i18n = useAgentHubI18n();
  const actions: React.ReactNode[] = [];
  if (props.connection.checkTarget) {
    actions.push(
      <AgentHubButton
        className="agenthub-connection-check-button"
        disabled={!props.canCheck || props.connection.checking}
        htmlType="button"
        key="provider"
        onClick={() => {
          if (props.connection.checkTarget) {
            props.onCheckConnection?.(props.connection.checkTarget);
          }
        }}
      >
        <Icon icon={RefreshCw} />{" "}
        {props.connection.checking
          ? i18n.t("connections.checking")
          : i18n.t("connections.checkConnection")}
      </AgentHubButton>,
    );
  }
  if (props.connection.detailCheckTarget) {
    actions.push(
      <AgentHubButton
        className="agenthub-connection-check-button"
        disabled={!props.connection.detailCheckable || props.connection.detailChecking}
        htmlType="button"
        key="capabilities"
        onClick={() => {
          if (props.connection.detailCheckTarget) {
            props.onCheckConnection?.(props.connection.detailCheckTarget);
          }
        }}
      >
        <Icon icon={RefreshCw} />{" "}
        {props.connection.detailChecking
          ? i18n.t("connections.checking")
          : i18n.t("connections.refreshCapabilities")}
      </AgentHubButton>,
    );
  }
  return actions.length > 0 ? (
    <div className="agenthub-connection-profile-actions">{actions}</div>
  ) : null;
}

function ConnectionDetail(props: {
  readonly connection?: ConnectionItemViewModel | undefined;
  readonly checkError?: string | null;
  readonly onCheckConnection?: (target: ConnectionCheckTargetId) => void;
}): React.ReactElement {
  const i18n = useAgentHubI18n();
  if (!props.connection) {
    return (
      <section className="agenthub-agent-detail agenthub-connection-detail">
        <p className="agenthub-muted">{i18n.t("connections.connectionsDescription")}</p>
      </section>
    );
  }
  const canCheck = Boolean(props.connection.checkable && props.connection.checkTarget);
  const connection = props.connection;
  const disabledReason = props.connection.disabledReason;
  const status = props.connection.statusTone === "connected" ? "success" : "warning";
  const ConnectionIcon = connectionIcon(connection);
  return (
    <section className="agenthub-agent-detail agenthub-connection-detail">
      <header className="agenthub-agent-profile agenthub-connection-profile">
        <AgentHubAvatar className="agenthub-agent-profile-avatar" size={52}>
          <Icon icon={ConnectionIcon} />
        </AgentHubAvatar>
        <div className="agenthub-agent-profile-copy">
          <strong>{props.connection.label}</strong>
          <span className="agenthub-agent-status-pill">{props.connection.description}</span>
        </div>
        <ConnectionCheckActions
          canCheck={canCheck}
          connection={connection}
          onCheckConnection={props.onCheckConnection}
        />
        <AgentHubBadge
          status={props.connection.statusTone === "disabled" ? "default" : status}
          text={
            props.connection.checking ? i18n.t("connections.checking") : props.connection.status
          }
        />
      </header>
      <div className="agenthub-agent-editor agenthub-connection-editor">
        <ConnectionGroup title={i18n.t("connections.connection")}>
          <ConnectionReadOnlyRow
            title={i18n.t("connections.status")}
            value={props.connection.status}
          />
          <ConnectionReadOnlyRow
            title={i18n.t("connections.checked")}
            value={props.connection.checkedAt}
          />
          {props.connection.metadata.map((row) => (
            <ConnectionReadOnlyRow
              key={row.label}
              title={translatedRowLabel(i18n, row)}
              value={row.value}
            />
          ))}
          {props.connection.failureReason ? (
            <ConnectionReadOnlyRow
              title={i18n.t("connections.issue")}
              value={props.connection.failureReason}
            />
          ) : null}
          {disabledReason ? (
            <ConnectionReadOnlyRow
              title={i18n.t("connections.unavailable")}
              value={disabledReason}
            />
          ) : null}
          {props.checkError ? (
            <ConnectionReadOnlyRow title={i18n.t("connections.issue")} value={props.checkError} />
          ) : null}
        </ConnectionGroup>
        <ConnectionSetupGuidance connection={connection} />
        {connection.detailGroups.map((group) => (
          <ConnectionGroup key={group.id} title={i18n.t(group.titleKey as never)}>
            {group.rows.map((row) => (
              <ConnectionReadOnlyRow
                key={`${group.id}-${row.label}`}
                title={translatedRowLabel(i18n, row)}
                value={translatedRowValue(i18n, row)}
              />
            ))}
          </ConnectionGroup>
        ))}
      </div>
    </section>
  );
}

export function ConnectionsPage(props: {
  readonly model: WorkbenchViewModel;
  readonly selectedConnectionId: string | null;
  readonly checkError?: string | null;
  readonly onCheckConnections?: (targets: readonly ConnectionCheckTargetId[]) => void;
}): React.ReactElement {
  const i18n = useAgentHubI18n();
  const selected =
    props.model.connections.items.find(
      (connection) => connection.id === props.selectedConnectionId,
    ) ?? props.model.connections.items[0];

  return (
    <div
      aria-label={i18n.t("connections.connections")}
      className="agenthub-agents-page agenthub-connections-page"
    >
      <ConnectionDetail
        checkError={props.checkError ?? null}
        connection={selected}
        onCheckConnection={(target) => props.onCheckConnections?.([target])}
      />
    </div>
  );
}

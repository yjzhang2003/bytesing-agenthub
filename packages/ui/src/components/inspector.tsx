import { PanelRightClose, Plus } from "lucide-react";
import React from "react";
import type {
  ArtifactViewModel,
  ChatInfoViewModel,
  DiffViewModel,
  InspectorSelection,
  PermissionViewModel,
  PlanViewModel,
  RunViewModel,
  RuntimeSummaryViewModel,
  WorkbenchViewModel,
} from "../types.js";
import { useAgentHubI18n } from "../i18n.js";
import { normalizeSelection } from "../view-model.js";
import { AgentHubAvatar, AgentHubModal, AgentHubSelect } from "./antd-primitives.js";
import { DetailSection, HoverButton, Icon, RuntimeStatusBadge } from "./primitives.js";

export function ContextInspector(props: {
  readonly model: WorkbenchViewModel;
  readonly selection: InspectorSelection | null;
  readonly onSelect: (selection: InspectorSelection | null) => void;
  readonly onAddAgentToChat?: (conversationId: string, agentId: string) => void;
  readonly onRemoveAgentFromChat?: (conversationId: string, agentId: string) => void;
  readonly onOpenFullScreenDiff: () => void;
  readonly collapsed: boolean;
  readonly onToggleCollapsed: () => void;
}): React.ReactElement {
  const i18n = useAgentHubI18n();
  const selection = normalizeSelection(props.selection, {
    artifacts: props.model.inspector.artifacts,
    diff: props.model.inspector.diff,
    permissions: props.model.inspector.permissions,
    plan: props.model.inspector.plan,
    runs: props.model.inspector.runs,
    chatInfo: props.model.inspector.chatInfo,
  });

  return (
    <aside
      aria-label={i18n.t("nav.conversationDetails", { fallback: "Conversation details" })}
      className="agenthub-inspector"
    >
      <header>
        <strong>{i18n.t("nav.conversationDetails", { fallback: "Conversation details" })}</strong>
        <div className="agenthub-header-actions">
          {selection && selection.mode !== "chat-info" ? (
            <HoverButton onClick={() => props.onSelect(null)} type="button">
              {i18n.t("actions.clear", { fallback: "Clear" })}
            </HoverButton>
          ) : null}
          <HoverButton
            aria-label={
              props.collapsed
                ? i18n.t("nav.expandInspector", { fallback: "Expand Context Inspector" })
                : i18n.t("nav.collapseInspector", { fallback: "Collapse Context Inspector" })
            }
            className="agenthub-icon-button"
            onClick={props.onToggleCollapsed}
            type="button"
          >
            <Icon icon={PanelRightClose} />
          </HoverButton>
        </div>
      </header>
      {renderInspectorBody(
        props.model,
        selection,
        props.onSelect,
        props.onOpenFullScreenDiff,
        props.onAddAgentToChat,
        props.onRemoveAgentFromChat,
      )}
    </aside>
  );
}

function renderInspectorBody(
  model: WorkbenchViewModel,
  selection: InspectorSelection | null,
  onSelect: (selection: InspectorSelection | null) => void,
  onOpenFullScreenDiff: () => void,
  onAddAgentToChat?: (conversationId: string, agentId: string) => void,
  onRemoveAgentFromChat?: (conversationId: string, agentId: string) => void,
): React.ReactNode {
  if (!selection) {
    return <EmptyDetail model={model} onSelect={onSelect} />;
  }

  if (selection.mode === "runtime") {
    return <RuntimeDetail runtime={model.runtime} />;
  }

  if (selection.mode === "chat-info") {
    return model.inspector.chatInfo ? (
      <ChatInfoDetail
        chat={model.inspector.chatInfo}
        {...(onAddAgentToChat ? { onAddAgent: onAddAgentToChat } : {})}
        {...(onRemoveAgentFromChat ? { onRemoveAgent: onRemoveAgentFromChat } : {})}
      />
    ) : (
      <UnavailableDetail label="Chat unavailable" />
    );
  }

  if (selection.mode === "plan") {
    const plan = model.inspector.plan;
    return plan ? <PlanDetail plan={plan} /> : <UnavailableDetail label="Plan unavailable" />;
  }

  if (selection.mode === "permission") {
    const permission = model.inspector.permissions.find(
      (candidate) => candidate.id === selection.id,
    );
    return permission ? (
      <PermissionDetail permission={permission} />
    ) : (
      <UnavailableDetail label="Permission unavailable" />
    );
  }

  if (selection.mode === "diff") {
    const diff = model.inspector.diff;
    return diff ? (
      <DiffDetail diff={diff} onOpenFullScreen={onOpenFullScreenDiff} />
    ) : (
      <UnavailableDetail label="Diff unavailable" />
    );
  }

  if (selection.mode === "artifact") {
    const artifact = model.inspector.artifacts.find((candidate) => candidate.id === selection.id);
    return artifact ? (
      <ArtifactDetail artifact={artifact} />
    ) : (
      <UnavailableDetail label="Artifact unavailable" />
    );
  }

  const run = model.inspector.runs.find((candidate) => candidate.id === selection.id);
  return run ? <RunDetail run={run} /> : <UnavailableDetail label="Run unavailable" />;
}

function ChatInfoDetail(props: {
  readonly chat: ChatInfoViewModel;
  readonly onAddAgent?: (conversationId: string, agentId: string) => void;
  readonly onRemoveAgent?: (conversationId: string, agentId: string) => void;
}): React.ReactElement {
  const i18n = useAgentHubI18n();
  const [addDialogOpen, setAddDialogOpen] = React.useState(false);
  const [selectedAgentId, setSelectedAgentId] = React.useState(
    props.chat.availableAgents[0]?.id ?? "",
  );

  React.useEffect(() => {
    setSelectedAgentId(props.chat.availableAgents[0]?.id ?? "");
  }, [props.chat.id, props.chat.availableAgents]);

  return (
    <div className="agenthub-inspector-body">
      <h3>{props.chat.title}</h3>
      <DetailSection title={i18n.t("chat.participants")}>
        <div className="agenthub-chat-participant-grid">
          {props.chat.participants.map((participant) => (
            <div className="agenthub-chat-participant-tile" key={participant.id}>
              <AgentHubAvatar shape="square">{participant.initials}</AgentHubAvatar>
              <span title={participant.label}>{participant.label}</span>
            </div>
          ))}
          <div className="agenthub-chat-participant-tile agenthub-chat-participant-tile-add">
            <button
              aria-label={i18n.t("chat.addAgent")}
              className="agenthub-chat-add-agent-button"
              disabled={props.chat.availableAgents.length === 0 || !props.onAddAgent}
              onClick={() => setAddDialogOpen(true)}
              type="button"
            >
              <Icon icon={Plus} />
            </button>
          </div>
        </div>
        <AddChatAgentDialog
          agents={props.chat.availableAgents}
          conversationId={props.chat.id}
          onAdd={(conversationId, agentId) => {
            props.onAddAgent?.(conversationId, agentId);
            setAddDialogOpen(false);
          }}
          onChangeSelectedAgent={setSelectedAgentId}
          onClose={() => setAddDialogOpen(false)}
          open={addDialogOpen}
          selectedAgentId={selectedAgentId}
        />
      </DetailSection>
      <DetailSection title={i18n.t("chat.basicInfo")}>
        <dl>
          <dt>{i18n.t("chat.chatName")}</dt>
          <dd>{props.chat.title}</dd>
          <dt>{i18n.t("chat.chatKind")}</dt>
          <dd>{props.chat.kind}</dd>
          <dt>{i18n.t("chat.workspace")}</dt>
          <dd>{props.chat.workspaceName}</dd>
          <dt>{i18n.t("chat.runtime")}</dt>
          <dd>{props.chat.runtimeLabel}</dd>
          <dt>{i18n.t("chat.created")}</dt>
          <dd>{props.chat.createdAtLabel}</dd>
          <dt>{i18n.t("chat.updated")}</dt>
          <dd>{props.chat.updatedAtLabel}</dd>
        </dl>
      </DetailSection>
      {props.chat.announcement ? (
        <DetailSection title={i18n.t("chat.announcement")}>
          <p>{props.chat.announcement}</p>
        </DetailSection>
      ) : null}
      {props.chat.note ? (
        <DetailSection title={i18n.t("chat.note")}>
          <p>{props.chat.note}</p>
        </DetailSection>
      ) : null}
    </div>
  );
}

function AddChatAgentDialog(props: {
  readonly agents: readonly ChatInfoViewModel["availableAgents"][number][];
  readonly conversationId: string;
  readonly onAdd: (conversationId: string, agentId: string) => void;
  readonly onChangeSelectedAgent: (agentId: string) => void;
  readonly onClose: () => void;
  readonly open: boolean;
  readonly selectedAgentId: string;
}): React.ReactElement {
  const i18n = useAgentHubI18n();
  return (
    <AgentHubModal
      className="agenthub-chat-add-agent-modal"
      destroyOnHidden
      getContainer={false}
      okButtonProps={{
        className: "agenthub-modal-confirm-button",
        disabled: !props.selectedAgentId || props.agents.length === 0,
        type: "default",
      }}
      okText={i18n.t("chat.add")}
      onCancel={props.onClose}
      onOk={() => props.onAdd(props.conversationId, props.selectedAgentId)}
      open={props.open}
      title={i18n.t("chat.addAgent")}
      width={360}
    >
      <div className="agenthub-chat-add-agent-dialog">
        {props.agents.length > 0 ? (
          <>
            <AgentHubAvatar shape="square">
              <Icon icon={Plus} />
            </AgentHubAvatar>
            <AgentHubSelect
              aria-label={i18n.t("chat.selectAgentToAdd")}
              className="agenthub-chat-agent-select"
              onChange={props.onChangeSelectedAgent}
              options={props.agents.map((agent) => ({
                label: agent.label,
                value: agent.id,
              }))}
              value={props.selectedAgentId}
            />
          </>
        ) : (
          <p className="agenthub-muted">{i18n.t("state.noParticipants")}</p>
        )}
      </div>
    </AgentHubModal>
  );
}

function EmptyDetail(props: {
  readonly model: WorkbenchViewModel;
  readonly onSelect: (selection: InspectorSelection | null) => void;
}): React.ReactElement {
  const i18n = useAgentHubI18n();
  return (
    <div className="agenthub-inspector-body">
      <h3>{props.model.activeConversationTitle}</h3>
      <p className="agenthub-muted">{props.model.workspace.workspaceName}</p>
      <p>{props.model.runtime.explanation}</p>
      <HoverButton onClick={() => props.onSelect({ id: "runtime", mode: "runtime" })} type="button">
        {i18n.t("inspector.runtimeDetails")}
      </HoverButton>
    </div>
  );
}

function UnavailableDetail(props: { readonly label: string }): React.ReactElement {
  const i18n = useAgentHubI18n();
  return (
    <div className="agenthub-inspector-body" data-state="unavailable">
      <h3>{props.label}</h3>
      <p>{i18n.t("inspector.unavailable")}</p>
    </div>
  );
}

function PlanDetail(props: { readonly plan: PlanViewModel }): React.ReactElement {
  const i18n = useAgentHubI18n();
  return (
    <div className="agenthub-inspector-body">
      <h3>{props.plan.title}</h3>
      <RuntimeStatusBadge
        status={props.plan.status === "failed" ? "degraded" : "online"}
        label={props.plan.status}
      />
      <DetailSection title={i18n.t("inspector.goal")}>
        <p>{props.plan.goal}</p>
      </DetailSection>
      <DetailSection title={i18n.t("inspector.assumptions")}>
        <ul>
          {props.plan.assumptions.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </DetailSection>
      <DetailSection title={i18n.t("inspector.steps")}>
        <ol>
          {props.plan.steps.map((step) => (
            <li key={step.id}>
              <strong>{step.title}</strong>
              <p>{step.assignedAgent}</p>
              {step.risks.length > 0 ? <small>{step.risks.join(", ")}</small> : null}
            </li>
          ))}
        </ol>
      </DetailSection>
      <DetailSection title={i18n.t("inspector.actions")}>
        <div className="agenthub-action-row">
          <HoverButton type="button">{i18n.t("actions.approve")}</HoverButton>
          <HoverButton type="button">{i18n.t("actions.askToRevise")}</HoverButton>
          <HoverButton type="button">{i18n.t("actions.cancelPlan")}</HoverButton>
        </div>
      </DetailSection>
    </div>
  );
}

function PermissionDetail(props: { readonly permission: PermissionViewModel }): React.ReactElement {
  const i18n = useAgentHubI18n();
  return (
    <div className="agenthub-inspector-body">
      <h3>{props.permission.summary}</h3>
      <p>{props.permission.requestingAgent}</p>
      <DetailSection title={i18n.t("inspector.request")}>
        <dl>
          <dt>{i18n.t("inspector.action")}</dt>
          <dd>{props.permission.actionKind}</dd>
          <dt>{i18n.t("inspector.workspace")}</dt>
          <dd>{props.permission.workspaceName}</dd>
          <dt>{i18n.t("inspector.risk")}</dt>
          <dd>{props.permission.risk}</dd>
          <dt>{i18n.t("inspector.relatedRun")}</dt>
          <dd>{props.permission.relatedRunId}</dd>
        </dl>
      </DetailSection>
      {props.permission.command ? (
        <DetailSection title={i18n.t("inspector.command")}>
          <code>{props.permission.command}</code>
        </DetailSection>
      ) : null}
      {props.permission.paths.length > 0 ? (
        <DetailSection title={i18n.t("inspector.paths")}>
          <ul>
            {props.permission.paths.map((path) => (
              <li key={path}>{path}</li>
            ))}
          </ul>
        </DetailSection>
      ) : null}
      {props.permission.status === "pending" ? (
        <div className="agenthub-action-row">
          <HoverButton type="button">{i18n.t("actions.allowOnce")}</HoverButton>
          <HoverButton type="button">{i18n.t("actions.deny")}</HoverButton>
        </div>
      ) : (
        <p>{props.permission.status}</p>
      )}
    </div>
  );
}

export function DiffDetail(props: {
  readonly diff: DiffViewModel;
  readonly onOpenFullScreen: () => void;
  readonly fullScreen?: boolean;
}): React.ReactElement {
  const i18n = useAgentHubI18n();
  const insertions = props.diff.files.reduce((sum, file) => sum + file.insertions, 0);
  const deletions = props.diff.files.reduce((sum, file) => sum + file.deletions, 0);
  return (
    <div className="agenthub-inspector-body">
      <h3>{i18n.t("inspector.diffReview")}</h3>
      <p>
        {props.diff.files.length} files · +{insertions} -{deletions}
      </p>
      {props.diff.warning ? <p className="agenthub-warning">{props.diff.warning}</p> : null}
      <DetailSection title={i18n.t("inspector.files")}>
        <ul className="agenthub-file-list">
          {props.diff.files.map((file) => (
            <li key={file.path}>
              <span title={file.path}>{file.path}</span>
              <small>
                {file.status} +{file.insertions} -{file.deletions}
              </small>
            </li>
          ))}
        </ul>
      </DetailSection>
      <HoverButton onClick={props.onOpenFullScreen} type="button">
        {props.fullScreen
          ? i18n.t("actions.returnToConversation")
          : i18n.t("actions.openFullScreenDiffReview")}
      </HoverButton>
    </div>
  );
}

function RuntimeDetail(props: { readonly runtime: RuntimeSummaryViewModel }): React.ReactElement {
  const i18n = useAgentHubI18n();
  return (
    <div className="agenthub-inspector-body">
      <h3>{props.runtime.label}</h3>
      <RuntimeStatusBadge status={props.runtime.status} />
      <p>{props.runtime.explanation}</p>
      <DetailSection title={i18n.t("inspector.device")}>
        <dl>
          <dt>{i18n.t("inspector.platform")}</dt>
          <dd>{props.runtime.platform}</dd>
          <dt>{i18n.t("inspector.version")}</dt>
          <dd>{props.runtime.appVersion}</dd>
          <dt>{i18n.t("inspector.heartbeat")}</dt>
          <dd>{props.runtime.lastHeartbeatLabel}</dd>
        </dl>
      </DetailSection>
      <DetailSection title={i18n.t("inspector.capabilities")}>
        <ul>
          {props.runtime.capabilities.length > 0 ? (
            props.runtime.capabilities.map((capability) => <li key={capability}>{capability}</li>)
          ) : (
            <li>{i18n.t("inspector.noCapabilities")}</li>
          )}
        </ul>
      </DetailSection>
    </div>
  );
}

function ArtifactDetail(props: { readonly artifact: ArtifactViewModel }): React.ReactElement {
  return (
    <div className="agenthub-inspector-body">
      <h3>{props.artifact.title}</h3>
      <p>{props.artifact.type}</p>
      <p>{props.artifact.summary}</p>
    </div>
  );
}

function RunDetail(props: { readonly run: RunViewModel }): React.ReactElement {
  const i18n = useAgentHubI18n();
  return (
    <div className="agenthub-inspector-body">
      <h3>{i18n.t("inspector.runStatus", { status: props.run.status })}</h3>
      <p>{props.run.agentName}</p>
      <DetailSection title={i18n.t("inspector.timing")}>
        <dl>
          <dt>{i18n.t("inspector.started")}</dt>
          <dd>{props.run.startedAt}</dd>
          <dt>{i18n.t("inspector.completed")}</dt>
          <dd>{props.run.completedAt}</dd>
        </dl>
      </DetailSection>
      {props.run.failureReason ? (
        <p className="agenthub-warning">{props.run.failureReason}</p>
      ) : null}
    </div>
  );
}

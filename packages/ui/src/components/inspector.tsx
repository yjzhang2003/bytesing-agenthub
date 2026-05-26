import { PanelRightClose, Plus, Trash2 } from "lucide-react";
import React from "react";
import type {
  UpdateConversationAgentSettingsRequest,
  UpdateConversationRequest,
} from "@agenthub/contracts";
import type {
  AgentInChatViewModel,
  ArtifactViewModel,
  ChatInfoViewModel,
  CollaborationStatusInspectorViewModel,
  DiffViewModel,
  InspectorSelection,
  PermissionViewModel,
  PlanViewModel,
  RunViewModel,
  RuntimeSummaryViewModel,
  WorkbenchViewModel,
} from "../types.js";
import { type TranslationKey, useAgentHubI18n } from "../i18n.js";
import { normalizeSelection } from "../view-model.js";
import {
  AgentHubAvatar,
  AgentHubButton,
  AgentHubModal,
  AgentHubSelect,
  AgentHubSwitch,
  AgentHubTextInput,
} from "./system.js";
import {
  DetailSection,
  HoverButton,
  Icon,
  RuntimeStatusBadge,
  SidebarSearchField,
} from "./primitives.js";

export function ContextInspector(props: {
  readonly model: WorkbenchViewModel;
  readonly selection: InspectorSelection | null;
  readonly onSelect: (selection: InspectorSelection | null) => void;
  readonly onAddAgentToChat?: (conversationId: string, agentId: string) => void;
  readonly onRemoveAgentFromChat?: (conversationId: string, agentId: string) => void;
  readonly onUpdateConversation?: (
    conversationId: string,
    input: UpdateConversationRequest,
  ) => void;
  readonly onDeleteConversation?: (conversationId: string) => void;
  readonly onUpdateConversationAgentSettings?: (
    conversationId: string,
    agentId: string,
    input: UpdateConversationAgentSettingsRequest,
  ) => void | Promise<void>;
  readonly onOpenGlobalAgentSettings?: (agentId: string) => void;
  readonly onOpenFullScreenDiff: () => void;
  readonly collapsed: boolean;
  readonly onToggleCollapsed: () => void;
  readonly showPanelToggle?: boolean;
}): React.ReactElement {
  const i18n = useAgentHubI18n();
  const selection = normalizeSelection(props.selection, {
    artifacts: props.model.inspector.artifacts,
    diff: props.model.inspector.diff,
    permissions: props.model.inspector.permissions,
    plan: props.model.inspector.plan,
    runs: props.model.inspector.runs,
    chatInfo: props.model.inspector.chatInfo,
    collaborationStatus: props.model.inspector.collaborationStatus,
    agentInChat: props.model.inspector.agentInChat,
    agentInChatDetails: props.model.inspector.agentInChatDetails,
  });

  return (
    <aside
      aria-label={i18n.t("nav.conversationDetails", { fallback: "Conversation details" })}
      className="agenthub-inspector"
    >
      {props.showPanelToggle ? (
        <div className="agenthub-inspector-floating-actions">
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
      ) : null}
      {renderInspectorBody(
        props.model,
        selection,
        props.onSelect,
        props.onOpenFullScreenDiff,
        props.onAddAgentToChat,
        props.onRemoveAgentFromChat,
        props.onUpdateConversation,
        props.onDeleteConversation,
        props.onUpdateConversationAgentSettings,
        props.onOpenGlobalAgentSettings,
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
  onUpdateConversation?: (conversationId: string, input: UpdateConversationRequest) => void,
  onDeleteConversation?: (conversationId: string) => void,
  onUpdateConversationAgentSettings?: (
    conversationId: string,
    agentId: string,
    input: UpdateConversationAgentSettingsRequest,
  ) => void | Promise<void>,
  onOpenGlobalAgentSettings?: (agentId: string) => void,
): React.ReactNode {
  if (!selection) {
    if (model.inspector.chatInfo) {
      return (
        <ChatInfoDetail
          chat={model.inspector.chatInfo}
          {...(onAddAgentToChat ? { onAddAgent: onAddAgentToChat } : {})}
          {...(onRemoveAgentFromChat ? { onRemoveAgent: onRemoveAgentFromChat } : {})}
          {...(onUpdateConversation ? { onUpdateConversation } : {})}
          {...(onDeleteConversation ? { onDeleteConversation } : {})}
          collaborationStatus={model.inspector.collaborationStatus}
          onSelect={onSelect}
        />
      );
    }
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
        {...(onUpdateConversation ? { onUpdateConversation } : {})}
        {...(onDeleteConversation ? { onDeleteConversation } : {})}
        collaborationStatus={model.inspector.collaborationStatus}
        onSelect={onSelect}
      />
    ) : (
      <UnavailableDetail labelKey="inspector.chatUnavailable" />
    );
  }

  if (selection.mode === "conversation-agent") {
    const agentInChat =
      model.inspector.agentInChat?.id === selection.id
        ? model.inspector.agentInChat
        : model.inspector.agentInChatDetails.find((detail) => detail.id === selection.id);
    return agentInChat ? (
      <AgentInChatDetail
        agent={agentInChat}
        {...(onUpdateConversationAgentSettings
          ? { onUpdateConversationAgentSettings }
          : {})}
        {...(onRemoveAgentFromChat ? { onRemoveAgentFromChat } : {})}
        {...(onOpenGlobalAgentSettings ? { onOpenGlobalAgentSettings } : {})}
      />
    ) : (
      <UnavailableDetail labelKey="inspector.agentUnavailableInChat" />
    );
  }

  if (selection.mode === "collaboration-status") {
    return model.inspector.collaborationStatus ? (
      <CollaborationStatusDetail status={model.inspector.collaborationStatus} />
    ) : (
      <UnavailableDetail labelKey="inspector.agentStatusUnavailable" />
    );
  }

  if (selection.mode === "plan") {
    const plan = model.inspector.plan;
    return plan ? <PlanDetail plan={plan} /> : <UnavailableDetail labelKey="inspector.planUnavailable" />;
  }

  if (selection.mode === "permission") {
    const permission = model.inspector.permissions.find(
      (candidate) => candidate.id === selection.id,
    );
    return permission ? (
      <PermissionDetail permission={permission} />
    ) : (
      <UnavailableDetail labelKey="inspector.permissionUnavailable" />
    );
  }

  if (selection.mode === "diff") {
    const diff = model.inspector.diff;
    return diff ? (
      <DiffDetail diff={diff} onOpenFullScreen={onOpenFullScreenDiff} />
    ) : (
      <UnavailableDetail labelKey="inspector.diffUnavailable" />
    );
  }

  if (selection.mode === "artifact") {
    const artifact = model.inspector.artifacts.find((candidate) => candidate.id === selection.id);
    return artifact ? (
      <ArtifactDetail artifact={artifact} />
    ) : (
      <UnavailableDetail labelKey="inspector.artifactUnavailable" />
    );
  }

  const run = model.inspector.runs.find((candidate) => candidate.id === selection.id);
  return run ? <RunDetail run={run} /> : <UnavailableDetail labelKey="inspector.runUnavailable" />;
}

function AgentInChatDetail(props: {
  readonly agent: AgentInChatViewModel;
  readonly onUpdateConversationAgentSettings?: (
    conversationId: string,
    agentId: string,
    input: UpdateConversationAgentSettingsRequest,
  ) => void | Promise<void>;
  readonly onRemoveAgentFromChat?: (conversationId: string, agentId: string) => void;
  readonly onOpenGlobalAgentSettings?: (agentId: string) => void;
}): React.ReactElement {
  const i18n = useAgentHubI18n();
  const update = (input: UpdateConversationAgentSettingsRequest) => {
    props.onUpdateConversationAgentSettings?.(
      props.agent.conversationId,
      props.agent.agentId,
      input,
    );
  };
  const roleLabel =
    props.agent.role === "orchestrator"
      ? i18n.t("agents.orchestrator", { fallback: "Orchestrator" })
      : i18n.t("agents.worker", { fallback: "Worker" });
  const participationLabel = (value: AgentInChatViewModel["participationMode"]) => {
    switch (value) {
      case "manual":
        return i18n.t("agentInChat.participation.manual", { fallback: "Manual" });
      case "orchestrated":
        return i18n.t("agentInChat.participation.orchestrated", { fallback: "Orchestrated" });
      case "proactive":
        return i18n.t("agentInChat.participation.proactive", { fallback: "Proactive" });
    }
  };
  const priorityLabel = (value: AgentInChatViewModel["priority"]) => {
    switch (value) {
      case "low":
        return i18n.t("agentInChat.priority.low", { fallback: "Low" });
      case "normal":
        return i18n.t("agentInChat.priority.normal", { fallback: "Normal" });
      case "high":
        return i18n.t("agentInChat.priority.high", { fallback: "High" });
    }
  };
  const contextScopeLabel = (value: AgentInChatViewModel["contextScope"]) => {
    switch (value) {
      case "conversation":
        return i18n.t("agentInChat.contextScope.conversation", { fallback: "Conversation" });
      case "workspace-summary":
        return i18n.t("agentInChat.contextScope.workspaceSummary", {
          fallback: "Workspace summary",
        });
      case "conversation-artifacts":
        return i18n.t("agentInChat.contextScope.conversationArtifacts", {
          fallback: "Conversation artifacts",
        });
    }
  };
  return (
    <div className="agenthub-inspector-body agenthub-agent-in-chat-detail">
      <DetailSection title={i18n.t("agentInChat.title", { fallback: "Agent in this chat" })}>
        <div className="agenthub-agent-in-chat-profile">
          <AgentHubAvatar shape="square">{props.agent.initials}</AgentHubAvatar>
          <div className="agenthub-agent-in-chat-profile-copy">
            <strong title={props.agent.label}>{props.agent.label}</strong>
            <span>
              {roleLabel} · {props.agent.providerLabel}
            </span>
            <small>
              {props.agent.globalLabel === props.agent.label
                ? i18n.t("agentInChat.usesGlobalName", {
                    fallback: "Using global agent name",
                  })
                : i18n.t("agentInChat.globalNameValue", {
                    fallback: "Global name: {name}",
                    name: props.agent.globalLabel,
                  })}
            </small>
          </div>
        </div>
      </DetailSection>
      <ChatSettingsGroup title={i18n.t("agentInChat.identity", { fallback: "Identity" })}>
        <ChatSettingsRow
          control={
            <AgentHubTextInput
              ariaLabel={i18n.t("agentInChat.displayName", { fallback: "Display name" })}
              defaultValue={props.agent.label}
              onBlur={(event) => update({ displayNameOverride: event.currentTarget.value })}
            />
          }
          description={props.agent.globalLabel}
          title={i18n.t("agentInChat.displayName", { fallback: "Display name" })}
        />
        <ChatSettingsRow
          control={
            <AgentHubTextInput
              ariaLabel={i18n.t("agentInChat.responsibility", { fallback: "Responsibility" })}
              defaultValue={props.agent.responsibility ?? ""}
              onBlur={(event) => update({ responsibilityOverride: event.currentTarget.value })}
            />
          }
          description={props.agent.responsibility ?? props.agent.globalSystemPrompt}
          title={i18n.t("agentInChat.responsibility", { fallback: "Responsibility" })}
        />
        <ChatSettingsRow
          control={
            <AgentHubTextInput
              ariaLabel={i18n.t("agentInChat.notes", { fallback: "Notes" })}
              defaultValue={props.agent.notes ?? ""}
              onBlur={(event) => update({ notes: event.currentTarget.value })}
            />
          }
          description={props.agent.notes ?? ""}
          title={i18n.t("agentInChat.notes", { fallback: "Notes" })}
        />
      </ChatSettingsGroup>
      <ChatSettingsGroup
        title={i18n.t("agentInChat.participation", { fallback: "Participation" })}
      >
        <ChatSettingsRow
          control={
            <AgentHubSwitch
              ariaLabel={i18n.t("agentInChat.enabled", { fallback: "Enabled" })}
              checked={props.agent.enabled}
              onChange={(enabled) => update({ enabled })}
            />
          }
          description={
            props.agent.enabled
              ? i18n.t("agentInChat.enabled", { fallback: "Enabled" })
              : i18n.t("agentInChat.disabled", { fallback: "Disabled" })
          }
          title={i18n.t("agentInChat.enabled", { fallback: "Enabled" })}
        />
        <ChatSettingsRow
          control={
            <AgentHubSelect
              ariaLabel={i18n.t("agentInChat.participationMode", {
                fallback: "Participation mode",
              })}
              onValueChange={(participationMode) => update({ participationMode })}
              value={props.agent.participationMode}
              options={[
                { label: participationLabel("manual"), value: "manual" },
                { label: participationLabel("orchestrated"), value: "orchestrated" },
                { label: participationLabel("proactive"), value: "proactive" },
              ]}
            />
          }
          description={participationLabel(props.agent.participationMode)}
          title={i18n.t("agentInChat.participationMode", { fallback: "Participation mode" })}
        />
        <ChatSettingsRow
          control={
            <AgentHubSelect
              ariaLabel={i18n.t("agentInChat.priority", { fallback: "Priority" })}
              onValueChange={(priority) => update({ priority })}
              value={props.agent.priority}
              options={[
                { label: priorityLabel("low"), value: "low" },
                { label: priorityLabel("normal"), value: "normal" },
                { label: priorityLabel("high"), value: "high" },
              ]}
            />
          }
          description={priorityLabel(props.agent.priority)}
          title={i18n.t("agentInChat.priority", { fallback: "Priority" })}
        />
        <ChatSettingsRow
          control={
            <AgentHubSwitch
              ariaLabel={i18n.t("agentInChat.quietMode", { fallback: "Quiet mode" })}
              checked={props.agent.quietMode}
              onChange={(quietMode) => update({ quietMode })}
            />
          }
          description={
            props.agent.quietMode
              ? i18n.t("agentInChat.quiet", { fallback: "Quiet" })
              : i18n.t("agentInChat.priority.normal", { fallback: "Normal" })
          }
          title={i18n.t("agentInChat.quietMode", { fallback: "Quiet mode" })}
        />
      </ChatSettingsGroup>
      <ChatSettingsGroup title={i18n.t("agentInChat.context", { fallback: "Context" })}>
        <ChatSettingsRow
          control={
            <AgentHubSelect
              ariaLabel={i18n.t("agentInChat.contextScope", { fallback: "Context scope" })}
              onValueChange={(contextScope) => update({ contextScope })}
              value={props.agent.contextScope}
              options={[
                { label: contextScopeLabel("conversation"), value: "conversation" },
                { label: contextScopeLabel("workspace-summary"), value: "workspace-summary" },
                {
                  label: contextScopeLabel("conversation-artifacts"),
                  value: "conversation-artifacts",
                },
              ]}
            />
          }
          description={contextScopeLabel(props.agent.contextScope)}
          title={i18n.t("agentInChat.contextScope", { fallback: "Context scope" })}
        />
        <ChatSettingsRow
          control={
            <AgentHubSwitch
              ariaLabel={i18n.t("agentInChat.historySummary", { fallback: "History summary" })}
              checked={props.agent.includeHistorySummary}
              onChange={(includeHistorySummary) => update({ includeHistorySummary })}
            />
          }
          description={
            props.agent.includeHistorySummary
              ? i18n.t("agentInChat.included", { fallback: "Included" })
              : i18n.t("agentInChat.excluded", { fallback: "Excluded" })
          }
          title={i18n.t("agentInChat.historySummary", { fallback: "History summary" })}
        />
        <ChatSettingsRow
          control={
            <AgentHubTextInput
              ariaLabel={i18n.t("agentInChat.scopedInstructions", {
                fallback: "Scoped instructions",
              })}
              defaultValue={props.agent.scopedInstructions ?? ""}
              onBlur={(event) => update({ scopedInstructions: event.currentTarget.value })}
            />
          }
          description={props.agent.scopedInstructions ?? ""}
          title={i18n.t("agentInChat.scopedInstructions", {
            fallback: "Scoped instructions",
          })}
        />
      </ChatSettingsGroup>
      <ChatSettingsGroup title={i18n.t("agentInChat.runPolicy", { fallback: "Run policy" })}>
        <ChatSettingsRow
          control={
            <AgentHubSwitch
              ariaLabel={i18n.t("agentInChat.requireRunConfirmation", {
                fallback: "Run confirmation",
              })}
              checked={props.agent.requireRunConfirmation}
              onChange={(requireRunConfirmation) => update({ requireRunConfirmation })}
            />
          }
          description={
            props.agent.requireRunConfirmation
              ? i18n.t("agentInChat.required", { fallback: "Required" })
              : i18n.t("agentInChat.notRequired", { fallback: "Not required" })
          }
          title={i18n.t("agentInChat.requireRunConfirmation", {
            fallback: "Run confirmation",
          })}
        />
        <ChatSettingsRow
          control={
            <AgentHubSwitch
              ariaLabel={i18n.t("agentInChat.allowAutoDispatch", { fallback: "Auto dispatch" })}
              checked={props.agent.allowAutoDispatch}
              onChange={(allowAutoDispatch) => update({ allowAutoDispatch })}
            />
          }
          description={
            props.agent.allowAutoDispatch
              ? i18n.t("agentInChat.allowed", { fallback: "Allowed" })
              : i18n.t("agentInChat.notAllowed", { fallback: "Not allowed" })
          }
          title={i18n.t("agentInChat.allowAutoDispatch", { fallback: "Auto dispatch" })}
        />
      </ChatSettingsGroup>
      <ChatSettingsGroup
        title={i18n.t("agentInChat.globalDefaults", { fallback: "Global defaults" })}
      >
        <ChatSettingsRow
          description={props.agent.globalLabel}
          title={i18n.t("agentInChat.globalName", { fallback: "Global name" })}
        />
        <ChatSettingsRow
          description={props.agent.providerLabel}
          title={i18n.t("agentInChat.provider", { fallback: "Provider" })}
        />
        <ChatSettingsRow
          description={props.agent.globalCapabilityTags.join(", ") || i18n.t("agentInChat.none")}
          title={i18n.t("agentInChat.capabilities", { fallback: "Capabilities" })}
        />
        <div className="agenthub-chat-delete-row">
          <AgentHubButton
            className="agenthub-chat-global-agent-settings-button"
            htmlType="button"
            onClick={() => props.onOpenGlobalAgentSettings?.(props.agent.agentId)}
            size="small"
            variant="ghost"
          >
            {i18n.t("agentInChat.openGlobalSettings", {
              fallback: "Open global agent settings",
            })}
          </AgentHubButton>
          <AgentHubButton
            className="agenthub-chat-delete-conversation-button"
            disabled={!props.onRemoveAgentFromChat}
            htmlType="button"
            kind="danger"
            onClick={() =>
              props.onRemoveAgentFromChat?.(props.agent.conversationId, props.agent.agentId)
            }
            size="small"
            variant="ghost"
          >
            <Icon icon={Trash2} />
            {i18n.t("agentInChat.removeFromChat", {
              fallback: "Remove agent from this chat",
            })}
          </AgentHubButton>
        </div>
      </ChatSettingsGroup>
    </div>
  );
}

function ChatInfoDetail(props: {
  readonly chat: ChatInfoViewModel;
  readonly collaborationStatus?: CollaborationStatusInspectorViewModel | null;
  readonly onAddAgent?: (conversationId: string, agentId: string) => void;
  readonly onRemoveAgent?: (conversationId: string, agentId: string) => void;
  readonly onUpdateConversation?: (conversationId: string, input: UpdateConversationRequest) => void;
  readonly onDeleteConversation?: (conversationId: string) => void;
  readonly onSelect?: (selection: InspectorSelection) => void;
}): React.ReactElement {
  const i18n = useAgentHubI18n();
  const [addDialogOpen, setAddDialogOpen] = React.useState(false);
  const [pinned, setPinned] = React.useState(props.chat.pinned);
  const [muted, setMuted] = React.useState(props.chat.notificationsMuted);
  const [chatTitle, setChatTitle] = React.useState(props.chat.title);
  const chatTitleInputRef = React.useRef<HTMLInputElement>(null);
  const canUpdateConversation = props.chat.mutable && Boolean(props.onUpdateConversation);
  const canDeleteConversation = props.chat.mutable && Boolean(props.onDeleteConversation);

  React.useEffect(() => {
    setChatTitle(props.chat.title);
  }, [props.chat.title]);
  React.useEffect(() => {
    setPinned(props.chat.pinned);
  }, [props.chat.pinned]);
  React.useEffect(() => {
    setMuted(props.chat.notificationsMuted);
  }, [props.chat.notificationsMuted]);
  const commitTitle = () => {
    const nextTitle = (chatTitleInputRef.current?.value ?? chatTitle).trim();
    if (!nextTitle) {
      setChatTitle(props.chat.title);
      return;
    }
    if (nextTitle !== props.chat.title) {
      props.onUpdateConversation?.(props.chat.id, { title: nextTitle });
    }
  };
  const updateDraftTitle = (event: React.FormEvent<HTMLInputElement>) => {
    setChatTitle(event.currentTarget.value);
  };

  return (
    <div className="agenthub-inspector-body">
      <DetailSection title={i18n.t("chat.participants")}>
        <div className="agenthub-chat-participant-grid">
          {props.chat.participants.map((participant) => (
            <button
              aria-label={`Open ${participant.label} settings in this conversation`}
              className="agenthub-chat-participant-tile"
              key={participant.id}
              onClick={() =>
                props.onSelect?.({
                  id: `${props.chat.id}:${participant.id}`,
                  mode: "conversation-agent",
                })
              }
              type="button"
            >
              <AgentHubAvatar shape="square">{participant.initials}</AgentHubAvatar>
              <span title={participant.label}>{participant.label}</span>
            </button>
          ))}
          <div className="agenthub-chat-participant-tile agenthub-chat-participant-tile-add">
            <button
              aria-label={i18n.t("chat.addAgent")}
              className="agenthub-chat-add-agent-button"
              disabled={!props.onAddAgent}
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
          onAdd={(conversationId, agentIds) => {
            for (const agentId of agentIds) {
              props.onAddAgent?.(conversationId, agentId);
            }
            setAddDialogOpen(false);
          }}
          onClose={() => setAddDialogOpen(false)}
          open={addDialogOpen}
        />
        {props.collaborationStatus ? (
          <HoverButton
            onClick={() =>
              props.onSelect?.({
                id: props.collaborationStatus?.id ?? props.chat.id,
                mode: "collaboration-status",
              })
            }
            type="button"
          >
            {i18n.t("collaboration.agentStatus", { fallback: "Agent status" })}
          </HoverButton>
        ) : null}
      </DetailSection>
      <ChatSettingsGroup title={i18n.t("project.project", { fallback: "Project" })}>
        {props.chat.project ? (
          <>
            <ChatSettingsRow
              description={props.chat.project.name}
              title={i18n.t("project.name", { fallback: "Name" })}
            />
            <ChatSettingsRow
              description={props.chat.project.pathLabel}
              title={i18n.t("project.path", { fallback: "Path" })}
            />
            <ChatSettingsRow
              description={props.chat.project.runtimeLabel}
              title={i18n.t("project.runtime", { fallback: "Runtime" })}
            />
            <ChatSettingsRow
              description={props.chat.project.branchLabel ?? i18n.t("state.noBranch")}
              title={i18n.t("project.branch", { fallback: "Branch" })}
            />
            <ChatSettingsRow
              description={
                props.chat.project.isDefault
                  ? i18n.t("project.defaultDirectory", {
                      fallback: "AgentHub default directory",
                    })
                  : i18n.t("project.localDirectory", { fallback: "Local directory" })
              }
              title={i18n.t("project.source", { fallback: "Source" })}
            />
          </>
        ) : (
          <p className="agenthub-muted">{i18n.t("project.unbound")}</p>
        )}
      </ChatSettingsGroup>
      <ChatSettingsGroup title={i18n.t("chat.basicInfo")}>
        <ChatSettingsRow
          control={
            <AgentHubTextInput
              ariaLabel={i18n.t("chat.chatName")}
              className="agenthub-chat-title-input"
              onChange={updateDraftTitle}
              onInput={updateDraftTitle}
              onBlur={commitTitle}
              inputRef={chatTitleInputRef}
              disabled={!canUpdateConversation}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.currentTarget.blur();
                }
                if (event.key === "Escape") {
                  setChatTitle(props.chat.title);
                  event.currentTarget.blur();
                }
              }}
              value={chatTitle}
            />
          }
          title={i18n.t("chat.chatName")}
        />
        <ChatSettingsRow description={props.chat.kind} title={i18n.t("chat.chatKind")} />
      </ChatSettingsGroup>
      <ChatSettingsGroup title={i18n.t("chat.conversationSettings")}>
        <ChatSettingsRow
          control={
            <AgentHubSwitch
              ariaLabel={i18n.t("chat.pinConversation")}
              checked={pinned}
              disabled={!canUpdateConversation}
              onChange={(checked) => {
                setPinned(checked);
                props.onUpdateConversation?.(props.chat.id, { pinned: checked });
              }}
            />
          }
          description={i18n.t("chat.pinConversationDescription")}
          title={i18n.t("chat.pinConversation")}
        />
        <ChatSettingsRow
          control={
            <AgentHubSwitch
              ariaLabel={i18n.t("chat.notifications")}
              checked={!muted}
              disabled={!canUpdateConversation}
              onChange={(checked) => {
                setMuted(!checked);
                props.onUpdateConversation?.(props.chat.id, { notificationsMuted: !checked });
              }}
            />
          }
          description={i18n.t("chat.notificationsDescription")}
          title={i18n.t("chat.notifications")}
        />
        <div className="agenthub-chat-delete-row">
          <AgentHubButton
            className="agenthub-chat-delete-conversation-button"
            disabled={!canDeleteConversation}
            htmlType="button"
            kind="danger"
            onClick={() => props.onDeleteConversation?.(props.chat.id)}
            size="small"
            variant="ghost"
          >
            <Icon icon={Trash2} />
            {i18n.t("chat.deleteConversation")}
          </AgentHubButton>
        </div>
      </ChatSettingsGroup>
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

function ChatSettingsGroup(props: {
  readonly children: React.ReactNode;
  readonly title: string;
}): React.ReactElement {
  return (
    <section className="agenthub-agent-settings-group agenthub-chat-settings-group">
      <header>
        <h3>{props.title}</h3>
      </header>
      <div className="agenthub-agent-settings-body">{props.children}</div>
    </section>
  );
}

function ChatSettingsRow(props: {
  readonly title: string;
  readonly description?: React.ReactNode;
  readonly control?: React.ReactNode;
}): React.ReactElement {
  return (
    <div className="agenthub-agent-readonly-row agenthub-settings-row agenthub-chat-settings-row">
      <span>{props.title}</span>
      {props.control ? (
        <div className="agenthub-settings-control-value">
          {props.description ? (
            <span className="agenthub-settings-control-copy">{props.description}</span>
          ) : null}
          {props.control}
        </div>
      ) : (
        <strong>{props.description}</strong>
      )}
    </div>
  );
}

function AddChatAgentDialog(props: {
  readonly agents: readonly ChatInfoViewModel["availableAgents"][number][];
  readonly conversationId: string;
  readonly onAdd: (conversationId: string, agentIds: readonly string[]) => void;
  readonly onClose: () => void;
  readonly open: boolean;
}): React.ReactElement {
  const i18n = useAgentHubI18n();
  const [query, setQuery] = React.useState("");
  const [selectedAgentIds, setSelectedAgentIds] = React.useState<ReadonlySet<string>>(
    () => new Set(),
  );

  React.useEffect(() => {
    if (props.open) {
      setQuery("");
      setSelectedAgentIds(new Set());
    }
  }, [props.open, props.conversationId, props.agents]);

  const normalizedQuery = query.trim().toLowerCase();
  const visibleAgents = React.useMemo(
    () =>
      normalizedQuery
        ? props.agents.filter((agent) => agent.label.toLowerCase().includes(normalizedQuery))
        : props.agents,
    [props.agents, normalizedQuery],
  );
  const selectedCount = selectedAgentIds.size;
  const confirmLabel =
    selectedCount > 0
      ? i18n.t("chat.addSelectedAgents", { count: selectedCount })
      : i18n.t("chat.add");

  const toggleAgent = (agentId: string) => {
    setSelectedAgentIds((current) => {
      const next = new Set(current);
      if (next.has(agentId)) {
        next.delete(agentId);
      } else {
        next.add(agentId);
      }
      return next;
    });
  };

  return (
    <AgentHubModal
      cancelText={i18n.t("actions.cancel")}
      className="agenthub-chat-add-agent-modal"
      closeLabel={i18n.t("actions.cancel")}
      destroyOnHidden
      getContainer={false}
      okButtonProps={{
        className: "agenthub-modal-confirm-button",
        disabled: selectedCount === 0,
        type: "default",
      }}
      okText={confirmLabel}
      onCancel={props.onClose}
      onOk={() => props.onAdd(props.conversationId, Array.from(selectedAgentIds))}
      open={props.open}
      title={i18n.t("chat.addAgent")}
      width={430}
    >
      <div className="agenthub-chat-add-agent-dialog">
        <SidebarSearchField
          label={i18n.t("chat.searchAgentsToAdd")}
          onChange={(event) => setQuery(event.currentTarget.value)}
          onInput={(event) => setQuery(event.currentTarget.value)}
          placeholder={i18n.t("nav.search")}
          value={query}
        />
        {props.agents.length === 0 ? (
          <p className="agenthub-chat-add-agent-empty">{i18n.t("chat.noAvailableAgents")}</p>
        ) : visibleAgents.length === 0 ? (
          <p className="agenthub-chat-add-agent-empty">{i18n.t("chat.noMatchingAgents")}</p>
        ) : (
          <div className="agenthub-chat-add-agent-list" role="listbox" aria-multiselectable="true">
            {visibleAgents.map((agent) => {
              const selected = selectedAgentIds.has(agent.id);
              return (
                <button
                  aria-label={i18n.t("chat.selectAgentNamed", { agent: agent.label })}
                  aria-pressed={selected}
                  aria-selected={selected}
                  className="agenthub-chat-add-agent-option"
                  data-selected={selected}
                  key={agent.id}
                  onClick={() => toggleAgent(agent.id)}
                  role="option"
                  type="button"
                >
                  <span className="agenthub-chat-add-agent-check" aria-hidden="true" />
                  <AgentHubAvatar shape="square">{agent.initials}</AgentHubAvatar>
                  <span className="agenthub-chat-add-agent-name" title={agent.label}>
                    {agent.label}
                  </span>
                </button>
              );
            })}
          </div>
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

function UnavailableDetail(props: { readonly label?: string; readonly labelKey?: TranslationKey }): React.ReactElement {
  const i18n = useAgentHubI18n();
  return (
    <div className="agenthub-inspector-body" data-state="unavailable">
      <h3>{props.labelKey ? i18n.t(props.labelKey) : props.label}</h3>
      <p>{i18n.t("inspector.unavailable")}</p>
    </div>
  );
}

function CollaborationStatusDetail(props: {
  readonly status: CollaborationStatusInspectorViewModel;
}): React.ReactElement {
  const i18n = useAgentHubI18n();
  const availabilityLabel = (availability: CollaborationStatusInspectorViewModel["agents"][number]["availability"]) => {
    switch (availability) {
      case "active":
        return i18n.t("collaboration.availability.active", { fallback: "active" });
      case "idle":
        return i18n.t("collaboration.availability.idle", { fallback: "idle" });
      case "blocked":
        return i18n.t("collaboration.availability.blocked", { fallback: "blocked" });
      case "stale":
        return i18n.t("collaboration.availability.stale", { fallback: "stale" });
      case "completed":
        return i18n.t("collaboration.availability.completed", { fallback: "completed" });
      case "failed":
        return i18n.t("collaboration.availability.failed", { fallback: "failed" });
      case "unavailable":
        return i18n.t("collaboration.availability.unavailable", { fallback: "unavailable" });
      default:
        return i18n.t("collaboration.availability.unknown", { fallback: "unknown" });
    }
  };
  if (props.status.state === "unavailable") {
    return (
      <div className="agenthub-inspector-body" data-state="unavailable">
        <h3>
          {i18n.t("collaboration.agentStatusUnavailable", {
            fallback: "Agent status unavailable",
          })}
        </h3>
        <p>{props.status.unavailableReason ?? i18n.t("inspector.unavailable")}</p>
      </div>
    );
  }
  return (
    <div className="agenthub-inspector-body agenthub-collaboration-status">
      <h3>{i18n.t("collaboration.agentStatus", { fallback: "Agent status" })}</h3>
      <DetailSection title={i18n.t("collaboration.participants", { fallback: "Participants" })}>
        <div className="agenthub-collaboration-agent-list">
          {props.status.agents.map((agent) => (
            <article
              className="agenthub-collaboration-agent-row"
              data-availability={agent.availability}
              key={agent.agentId}
            >
              <div>
                <strong>{agent.displayName}</strong>
                <small>{availabilityLabel(agent.availability)}</small>
              </div>
              <p>{agent.currentTaskTitle ?? i18n.t("collaboration.noCurrentTask")}</p>
              <div className="agenthub-collaboration-agent-meta">
                {agent.blockedQuestionCount > 0 ? (
                  <span className="agenthub-warning">
                    {i18n.t("collaboration.blockedQuestions", {
                      count: agent.blockedQuestionCount,
                      fallback: `${agent.blockedQuestionCount} blocked question(s)`,
                    })}
                  </span>
                ) : null}
                {agent.stale ? (
                  <span>{i18n.t("collaboration.stale", { fallback: "stale" })}</span>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      </DetailSection>
      {props.status.pendingUserQuestions.length > 0 ? (
        <DetailSection title={i18n.t("collaboration.userQuestions", { fallback: "User questions" })}>
          <div className="agenthub-collaboration-question-list">
            {props.status.pendingUserQuestions.map((question) => (
              <article className="agenthub-collaboration-question" key={question.questionId}>
                <strong>{question.agentName}</strong>
                <p>{question.prompt}</p>
                <small>{question.createdAtLabel}</small>
                <HoverButton type="button">
                  {i18n.t("collaboration.answerQuestion", { fallback: "Answer question" })}
                </HoverButton>
              </article>
            ))}
          </div>
        </DetailSection>
      ) : null}
      {props.status.openSpecLinks.length > 0 ? (
        <DetailSection title={i18n.t("collaboration.openspec", { fallback: "OpenSpec" })}>
          <ul className="agenthub-collaboration-openspec-list">
            {props.status.openSpecLinks.map((link) => (
              <li key={`${link.changeName}:${link.artifactLabel}`}>
                <strong>{link.changeName}</strong>
                <small>
                  {link.artifactLabel} · {link.projectionStatusLabel}
                </small>
              </li>
            ))}
          </ul>
        </DetailSection>
      ) : null}
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
      {props.run.projectName || props.run.projectPathLabel ? (
        <DetailSection title={i18n.t("project.project", { fallback: "Project" })}>
          <dl>
            <dt>{i18n.t("project.name", { fallback: "Name" })}</dt>
            <dd>{props.run.projectName ?? i18n.t("state.unavailable")}</dd>
            <dt>{i18n.t("project.path", { fallback: "Path" })}</dt>
            <dd>{props.run.projectPathLabel ?? i18n.t("state.unavailable")}</dd>
          </dl>
        </DetailSection>
      ) : null}
      <DetailSection title={i18n.t("inspector.timing")}>
        <dl>
          <dt>{i18n.t("inspector.started")}</dt>
          <dd>{props.run.startedAt}</dd>
          <dt>{i18n.t("inspector.completed")}</dt>
          <dd>{props.run.completedAt}</dd>
        </dl>
      </DetailSection>
      {props.run.claudeCodePermissionLabel ? (
        <DetailSection title="Claude Code">
          <dl>
            <dt>{i18n.t("claudeCode.permission", { fallback: "Permission" })}</dt>
            <dd>{props.run.claudeCodePermissionLabel}</dd>
            <dt>{i18n.t("claudeCode.runtimeProfile", { fallback: "Runtime profile" })}</dt>
            <dd>{props.run.claudeCodeProfileLabel}</dd>
            <dt>{i18n.t("claudeCode.mcpProfile", { fallback: "MCP profile" })}</dt>
            <dd>{props.run.claudeCodeMcpLabel}</dd>
            <dt>{i18n.t("claudeCode.effort", { fallback: "Effort" })}</dt>
            <dd>{props.run.claudeCodeEffortLabel}</dd>
            <dt>{i18n.t("claudeCode.settings", { fallback: "Settings" })}</dt>
            <dd>{props.run.claudeCodeSettingsLabel}</dd>
            <dt>{i18n.t("claudeCode.source", { fallback: "Source" })}</dt>
            <dd>{props.run.claudeCodeOverrideSource}</dd>
          </dl>
          {props.run.highRiskClaudeCode ? (
            <p className="agenthub-warning">
              {i18n.t("claudeCode.fullAccessRunWarning", {
                fallback: "Full access was selected for this run.",
              })}
            </p>
          ) : null}
        </DetailSection>
      ) : null}
      {props.run.failureSummary ? (
        <p className="agenthub-warning">{props.run.failureSummary}</p>
      ) : null}
      {props.run.failureReason ? (
        <DetailSection title={i18n.t("inspector.diagnostics", { fallback: "Diagnostics" })}>
          <p className="agenthub-warning">{props.run.failureReason}</p>
        </DetailSection>
      ) : null}
    </div>
  );
}

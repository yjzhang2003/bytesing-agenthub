import * as ScrollArea from "@radix-ui/react-scroll-area";
import { Bot, Cable, ClipboardCheck, MessageSquare, PanelLeftClose, Play, Search, Settings } from "lucide-react";
import React from "react";
import type { ConversationListItem, InspectorSelection, WorkbenchViewModel } from "../types.js";
import { AgentDirectory } from "./agents.js";
import { HoverButton, Icon, RuntimeStatusBadge } from "./primitives.js";

export function ConversationList(props: {
  readonly conversations: readonly ConversationListItem[];
}): React.ReactElement {
  return (
    <nav aria-label="Conversations" className="agenthub-conversation-list">
      {props.conversations.length === 0 ? <p className="agenthub-muted">No conversations yet</p> : null}
      {props.conversations.map((conversation) => (
        <HoverButton
          aria-current={conversation.active ? "page" : undefined}
          className="agenthub-nav-row agenthub-conversation-row"
          key={conversation.id}
          type="button"
        >
          <span className="agenthub-row-main">{conversation.title}</span>
          <small>{conversation.participants.join(", ") || "No participants"}</small>
          <span className="agenthub-row-meta">
            {conversation.activeRunStatus ? `Run ${conversation.activeRunStatus}` : "Idle"}
            {conversation.pendingPermissions > 0 ? ` · ${conversation.pendingPermissions} pending` : ""}
          </span>
        </HoverButton>
      ))}
    </nav>
  );
}

export function WorkspaceStatusSurface(props: {
  readonly workspaceName: string;
  readonly runtimeStatus: WorkbenchViewModel["workspace"]["runtimeStatus"];
  readonly runtimeLabel?: string;
  readonly workspacePathLabel?: string;
  readonly branchLabel?: string;
}): React.ReactElement {
  return (
    <section aria-label="Workspace status" className="agenthub-workspace-status">
      <strong title={props.workspaceName}>{props.workspaceName}</strong>
      <RuntimeStatusBadge
        status={props.runtimeStatus}
        {...(props.runtimeLabel ? { label: props.runtimeLabel } : {})}
      />
      <small title={props.workspacePathLabel}>{props.workspacePathLabel ?? "No workspace path"}</small>
      <small>{props.branchLabel ?? "No branch"}</small>
    </section>
  );
}

export function LeftNavigation(props: {
  readonly model: WorkbenchViewModel;
  readonly onSelect: (selection: InspectorSelection) => void;
  readonly onOpenConversation: () => void;
  readonly onOpenAgents: () => void;
  readonly onOpenConnections: () => void;
  readonly onOpenSettings: () => void;
  readonly selectedAgentId: string | null;
  readonly onSelectAgent: (agentId: string | null) => void;
  readonly collapsed: boolean;
  readonly onToggleCollapsed: () => void;
  readonly conversationActive: boolean;
  readonly settingsActive: boolean;
  readonly agentsActive: boolean;
  readonly connectionsActive: boolean;
  readonly compact?: boolean;
}): React.ReactElement {
  return (
    <aside
      aria-label="Workspace navigation"
      className="agenthub-left-nav"
      data-compact={props.compact || props.collapsed ? "true" : "false"}
    >
      <div aria-label="Workspace tools" className="agenthub-left-rail">
        <HoverButton
          aria-current={props.conversationActive ? "page" : undefined}
          aria-label="Open conversation"
          className="agenthub-rail-button"
          onClick={props.onOpenConversation}
          title="Chat"
          type="button"
        >
          <Icon icon={MessageSquare} />
          <span aria-hidden="true" className="agenthub-rail-status-dot" data-status={props.model.runtime.status} />
        </HoverButton>
        <HoverButton
          aria-current={props.agentsActive ? "page" : undefined}
          aria-label="Open agents"
          className="agenthub-rail-button"
          onClick={props.onOpenAgents}
          title="Agents"
          type="button"
        >
          <Icon icon={Bot} />
          <small>{props.model.workspace.agents.length}</small>
        </HoverButton>
        <HoverButton
          aria-current={props.connectionsActive ? "page" : undefined}
          aria-label="Open connections"
          className="agenthub-rail-button"
          onClick={props.onOpenConnections}
          title="Connections"
          type="button"
        >
          <Icon icon={Cable} />
        </HoverButton>
        <HoverButton
          aria-label={`${props.model.workspace.runCount} runs`}
          className="agenthub-rail-button"
          title="Runs"
          type="button"
        >
          <Icon icon={Play} />
          <small>{props.model.workspace.runCount}</small>
        </HoverButton>
        <HoverButton
          aria-label={`${props.model.workspace.pendingPermissionCount} pending permissions`}
          className="agenthub-rail-button agenthub-permission-entry"
          disabled={props.model.workspace.pendingPermissionCount === 0}
          onClick={() => {
            const firstPermission = props.model.inspector.permissions[0];
            if (firstPermission) {
              props.onSelect({ id: firstPermission.id, mode: "permission" });
            }
          }}
          title="Pending permissions"
          type="button"
        >
          <Icon icon={ClipboardCheck} />
          <small>{props.model.workspace.pendingPermissionCount}</small>
        </HoverButton>
        <div className="agenthub-nav-bottom">
          <HoverButton
            aria-current={props.settingsActive ? "page" : undefined}
            aria-label="Settings"
            className="agenthub-rail-button"
            onClick={props.onOpenSettings}
            title="Settings"
            type="button"
          >
            <Icon icon={Settings} />
          </HoverButton>
        </div>
      </div>
      {props.compact || props.collapsed ? null : props.agentsActive ? (
        <AgentDirectory
          model={props.model}
          selectedAgentId={props.selectedAgentId}
          onSelectAgent={props.onSelectAgent}
        />
      ) : (
      <section aria-label="Conversation navigation" className="agenthub-chat-list-panel">
        <header className="agenthub-chat-list-header">
          <label className="agenthub-conversation-search">
            <Icon icon={Search} />
            <input aria-label="Search conversations" placeholder="Search" type="search" />
          </label>
          <HoverButton
            aria-label={props.collapsed ? "Expand workspace navigation" : "Collapse workspace navigation"}
            className="agenthub-icon-button"
            onClick={props.onToggleCollapsed}
            title={props.collapsed ? "Expand" : "Collapse"}
            type="button"
          >
            <Icon icon={PanelLeftClose} />
          </HoverButton>
        </header>
        <ScrollArea.Root className="agenthub-scroll-root">
          <ScrollArea.Viewport className="agenthub-scroll-viewport">
            <ConversationList conversations={props.model.workspace.conversations} />
          </ScrollArea.Viewport>
          <ScrollArea.Scrollbar className="agenthub-scrollbar" orientation="vertical">
            <ScrollArea.Thumb className="agenthub-scroll-thumb" />
          </ScrollArea.Scrollbar>
        </ScrollArea.Root>
      </section>
      )}
    </aside>
  );
}

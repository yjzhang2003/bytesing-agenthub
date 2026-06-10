import * as ScrollArea from "@radix-ui/react-scroll-area";
import {
  Bot,
  Cable,
  ClipboardCheck,
  LogOut,
  MessageSquare,
  Moon,
  PanelLeftClose,
  Play,
  Plus,
  Settings,
  Sun,
} from "lucide-react";
import React from "react";
import { useAgentHubI18n } from "../i18n.js";
import type {
  ConnectionCheckTargetId,
  ConversationListItem,
  InspectorSelection,
  WorkbenchViewModel,
} from "../types.js";
import { AgentDirectory } from "./agents.js";
import { ConnectionsDirectory } from "./connections.js";
import { HoverButton, Icon, RuntimeStatusBadge, SidebarSearchField } from "./primitives.js";
import { SettingsDirectory, type SettingsCategoryId } from "./settings.js";

export function ConversationList(props: {
  readonly conversations: readonly ConversationListItem[];
  readonly onSelectConversation: (conversationId: string) => void;
}): React.ReactElement {
  const i18n = useAgentHubI18n();
  return (
    <nav
      aria-label={i18n.t("nav.conversations", { fallback: "Conversations" })}
      className="agenthub-conversation-list"
    >
      {props.conversations.length === 0 ? (
        <p className="agenthub-muted">
          {i18n.t("state.noConversations", { fallback: "No conversations yet" })}
        </p>
      ) : null}
      {props.conversations.map((conversation) => (
        <HoverButton
          aria-current={conversation.active ? "page" : undefined}
          className="agenthub-nav-row agenthub-conversation-row"
          key={conversation.id}
          onClick={() => props.onSelectConversation(conversation.id)}
          type="button"
        >
          <span aria-hidden="true" className="agenthub-conversation-avatar">
            {conversation.avatarLabel}
          </span>
          <span className="agenthub-conversation-title">{conversation.title}</span>
          <time className="agenthub-conversation-time">{conversation.lastMessageAtLabel}</time>
          <span className="agenthub-conversation-preview">{conversation.lastMessagePreview}</span>
          {conversation.unreadCount > 0 ? (
            <span
              aria-label={`${conversation.unreadCount} unread messages`}
              className="agenthub-conversation-unread"
            >
              {conversation.unreadCount}
            </span>
          ) : null}
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
  const i18n = useAgentHubI18n();
  return (
    <section
      aria-label={i18n.t("nav.workspaceStatus", { fallback: "Workspace status" })}
      className="agenthub-workspace-status"
    >
      <strong title={props.workspaceName}>{props.workspaceName}</strong>
      <RuntimeStatusBadge
        status={props.runtimeStatus}
        {...(props.runtimeLabel ? { label: props.runtimeLabel } : {})}
      />
      <small title={props.workspacePathLabel}>
        {props.workspacePathLabel ??
          i18n.t("state.noWorkspacePath", { fallback: "No workspace path" })}
      </small>
      <small>{props.branchLabel ?? i18n.t("state.noBranch", { fallback: "No branch" })}</small>
    </section>
  );
}

export function LeftNavigation(props: {
  readonly model: WorkbenchViewModel;
  readonly onSelect: (selection: InspectorSelection) => void;
  readonly onOpenConversation: () => void;
  readonly onSelectConversation: (conversationId: string) => void;
  readonly onNewConversation?: () => void;
  readonly onOpenAgents: () => void;
  readonly onOpenConnections: () => void;
  readonly onOpenSettings: () => void;
  readonly selectedAgentId: string | null;
  readonly onSelectAgent: (agentId: string | null) => void;
  readonly selectedConnectionId: string | null;
  readonly onSelectConnection: (connectionId: string) => void;
  readonly onCheckConnections?: (targets: readonly ConnectionCheckTargetId[]) => void;
  readonly selectedSettingsCategory: SettingsCategoryId;
  readonly onSelectSettingsCategory: (category: SettingsCategoryId) => void;
  readonly collapsed: boolean;
  readonly onToggleCollapsed: () => void;
  readonly conversationActive: boolean;
  readonly settingsActive: boolean;
  readonly agentsActive: boolean;
  readonly connectionsActive: boolean;
  readonly compact?: boolean;
  readonly onToggleTheme: () => void;
  readonly theme: "light" | "dark";
  readonly onSignOut?: (() => void) | undefined;
}): React.ReactElement {
  const i18n = useAgentHubI18n();
  return (
    <aside
      aria-label={i18n.t("nav.workspaceNavigation", { fallback: "Workspace navigation" })}
      className="agenthub-left-nav"
      data-compact={props.compact || props.collapsed ? "true" : "false"}
    >
      <div
        aria-label={i18n.t("nav.workspaceTools", { fallback: "Workspace tools" })}
        className="agenthub-left-rail"
      >
        <HoverButton
          aria-current={props.conversationActive ? "page" : undefined}
          aria-label={i18n.t("nav.openConversation", { fallback: "Open conversation" })}
          className="agenthub-rail-button"
          onClick={props.onOpenConversation}
          title={i18n.t("nav.chat", { fallback: "Chat" })}
          type="button"
        >
          <Icon icon={MessageSquare} />
          {props.model.workspace.unreadMessageCount > 0 ? (
            <small>{props.model.workspace.unreadMessageCount}</small>
          ) : null}
        </HoverButton>
        <HoverButton
          aria-current={props.agentsActive ? "page" : undefined}
          aria-label={i18n.t("nav.openAgents", { fallback: "Open agents" })}
          className="agenthub-rail-button"
          onClick={props.onOpenAgents}
          title={i18n.t("agents.agents")}
          type="button"
        >
          <Icon icon={Bot} />
        </HoverButton>
        <HoverButton
          aria-current={props.connectionsActive ? "page" : undefined}
          aria-label={i18n.t("nav.openConnections", { fallback: "Open connections" })}
          className="agenthub-rail-button"
          onClick={props.onOpenConnections}
          title={i18n.t("connections.connections")}
          type="button"
        >
          <Icon icon={Cable} />
        </HoverButton>
        <HoverButton
          aria-label={i18n.t("nav.runs", {
            fallback: `${props.model.workspace.runCount} runs`,
            count: props.model.workspace.runCount,
          })}
          className="agenthub-rail-button"
          title={i18n.t("nav.runsLabel")}
          type="button"
        >
          <Icon icon={Play} />
          <small>{props.model.workspace.runCount}</small>
        </HoverButton>
        <HoverButton
          aria-label={i18n.t("nav.pendingPermissions", {
            fallback: `${props.model.workspace.pendingPermissionCount} pending permissions`,
            count: props.model.workspace.pendingPermissionCount,
          })}
          className="agenthub-rail-button agenthub-permission-entry"
          disabled={props.model.workspace.pendingPermissionCount === 0}
          onClick={() => {
            const firstPermission = props.model.inspector.permissions[0];
            if (firstPermission) {
              props.onSelect({ id: firstPermission.id, mode: "permission" });
            }
          }}
          title={i18n.t("nav.pendingPermissions", {
            fallback: "Pending permissions",
            count: props.model.workspace.pendingPermissionCount,
          })}
          type="button"
        >
          <Icon icon={ClipboardCheck} />
          <small>{props.model.workspace.pendingPermissionCount}</small>
        </HoverButton>
        <div className="agenthub-nav-bottom">
          <HoverButton
            aria-label={
              props.theme === "dark"
                ? i18n.t("actions.switchToLight", { fallback: "Switch to light mode" })
                : i18n.t("actions.switchToDark", { fallback: "Switch to dark mode" })
            }
            className="agenthub-rail-button"
            onClick={props.onToggleTheme}
            title={
              props.theme === "dark"
                ? i18n.t("actions.switchToLight", { fallback: "Switch to light mode" })
                : i18n.t("actions.switchToDark", { fallback: "Switch to dark mode" })
            }
            type="button"
          >
            <Icon icon={props.theme === "dark" ? Sun : Moon} />
          </HoverButton>
          <HoverButton
            aria-current={props.settingsActive ? "page" : undefined}
            aria-label={i18n.t("nav.settings", { fallback: "Settings" })}
            className="agenthub-rail-button"
            onClick={props.onOpenSettings}
            title={i18n.t("nav.settings", { fallback: "Settings" })}
            type="button"
          >
            <Icon icon={Settings} />
          </HoverButton>
          {props.onSignOut ? (
            <HoverButton
              aria-label={i18n.t("auth.signOut")}
              className="agenthub-rail-button agenthub-rail-sign-out"
              onClick={props.onSignOut}
              title={i18n.t("auth.signOut")}
              type="button"
            >
              <Icon icon={LogOut} />
            </HoverButton>
          ) : null}
        </div>
      </div>
      {props.compact || props.collapsed ? null : props.agentsActive ? (
        <AgentDirectory
          model={props.model}
          selectedAgentId={props.selectedAgentId}
          onSelectAgent={props.onSelectAgent}
        />
      ) : props.connectionsActive ? (
        <ConnectionsDirectory
          model={props.model}
          selectedConnectionId={props.selectedConnectionId}
          onSelectConnection={props.onSelectConnection}
          {...(props.onCheckConnections ? { onCheckConnections: props.onCheckConnections } : {})}
        />
      ) : props.settingsActive ? (
        <SettingsDirectory
          pendingPermissionCount={props.model.workspace.pendingPermissionCount}
          selectedCategory={props.selectedSettingsCategory}
          onSelectCategory={props.onSelectSettingsCategory}
        />
      ) : (
        <section
          aria-label={i18n.t("nav.conversationNavigation", { fallback: "Conversation navigation" })}
          className="agenthub-chat-list-panel"
        >
          <header className="agenthub-chat-list-header">
            <SidebarSearchField
              label={i18n.t("nav.searchConversations", { fallback: "Search conversations" })}
              placeholder={i18n.t("nav.search", { fallback: "Search" })}
            />
            <HoverButton
              aria-label={i18n.t("actions.newConversation", { fallback: "New conversation" })}
              className="agenthub-icon-button"
              disabled={!props.onNewConversation}
              onClick={props.onNewConversation}
              title={i18n.t("actions.newConversation", { fallback: "New conversation" })}
              type="button"
            >
              <Icon icon={Plus} />
            </HoverButton>
            <HoverButton
              aria-label={
                props.collapsed
                  ? i18n.t("nav.expandWorkspace", { fallback: "Expand workspace navigation" })
                  : i18n.t("nav.collapseWorkspace", { fallback: "Collapse workspace navigation" })
              }
              className="agenthub-icon-button"
              onClick={props.onToggleCollapsed}
              title={
                props.collapsed
                  ? i18n.t("nav.expand", { fallback: "Expand" })
                  : i18n.t("nav.collapse", { fallback: "Collapse" })
              }
              type="button"
            >
              <Icon icon={PanelLeftClose} />
            </HoverButton>
          </header>
          <ScrollArea.Root className="agenthub-scroll-root">
            <ScrollArea.Viewport className="agenthub-scroll-viewport">
              <ConversationList
                conversations={props.model.workspace.conversations}
                onSelectConversation={props.onSelectConversation}
              />
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

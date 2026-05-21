import type {
  DiffFileSummary,
  Message,
  PermissionRisk,
  PermissionStatus,
  PlanStatus,
  RuntimeDeviceStatus,
  WorkbenchSnapshot,
} from "@agenthub/contracts";
import React from "react";

export interface ConversationListItem {
  readonly id: string;
  readonly title: string;
  readonly participants: readonly string[];
  readonly pendingPermissions: number;
  readonly active: boolean;
}

export type WorkbenchLayoutMode = "wide" | "standard" | "narrow" | "mobile-web";

export function workbenchLayoutForWidth(width: number): WorkbenchLayoutMode {
  if (width >= 1280) {
    return "wide";
  }
  if (width >= 960) {
    return "standard";
  }
  if (width >= 640) {
    return "narrow";
  }
  return "mobile-web";
}

export function RuntimeStatusBadge(props: {
  readonly status: RuntimeDeviceStatus;
  readonly label?: string;
}): React.ReactElement {
  return (
    <span data-status={props.status} aria-label={`Runtime ${props.status}`}>
      {props.label ?? props.status}
    </span>
  );
}

export function ParticipantChip(props: { readonly label: string }): React.ReactElement {
  return <span className="agenthub-participant-chip">{props.label}</span>;
}

export function ConversationList(props: {
  readonly conversations: readonly ConversationListItem[];
}): React.ReactElement {
  return (
    <nav aria-label="Conversations">
      {props.conversations.map((conversation) => (
        <button
          aria-current={conversation.active ? "page" : undefined}
          className="agenthub-conversation-row"
          key={conversation.id}
          type="button"
        >
          <span>{conversation.title}</span>
          <small>{conversation.participants.join(", ")}</small>
          {conversation.pendingPermissions > 0 ? (
            <strong>{conversation.pendingPermissions} pending</strong>
          ) : null}
        </button>
      ))}
    </nav>
  );
}

export function AgentMentionComposer(props: {
  readonly targets: readonly string[];
  readonly selectedTarget: string;
  readonly disabled?: boolean;
  readonly onSend?: (message: string) => void;
}): React.ReactElement {
  const [message, setMessage] = React.useState("");
  return (
    <form
      aria-label="Message composer"
      className="agenthub-composer"
      onSubmit={(event) => {
        event.preventDefault();
        if (!message.trim() || props.disabled) {
          return;
        }
        props.onSend?.(message.trim());
        setMessage("");
      }}
    >
      <select aria-label="Agent target" defaultValue={props.selectedTarget}>
        {props.targets.map((target) => (
          <option key={target}>{target}</option>
        ))}
      </select>
      <textarea
        aria-label="Message"
        disabled={props.disabled}
        onChange={(event) => setMessage(event.currentTarget.value)}
        placeholder={props.disabled ? "Runtime offline" : "Message an agent..."}
        value={message}
      />
      <button disabled={props.disabled} type="submit">
        Send
      </button>
    </form>
  );
}

export function ChatTimeline(props: {
  readonly items: readonly React.ReactNode[];
}): React.ReactElement {
  return (
    <ol aria-label="Conversation timeline" className="agenthub-timeline">
      {props.items.map((item, index) => (
        <li key={index}>{item}</li>
      ))}
    </ol>
  );
}

export function PlanCard(props: {
  readonly title: string;
  readonly status: PlanStatus;
  readonly agents: readonly string[];
}): React.ReactElement {
  return (
    <article aria-label={`Plan ${props.status}`} className="agenthub-card agenthub-plan-card">
      <header>
        <strong>{props.title}</strong>
        <span>{props.status}</span>
      </header>
      <p>{props.agents.join(" -> ")}</p>
      <footer>
        <button type="button">Approve</button>
        <button type="button">Revise</button>
        <button type="button">Cancel</button>
      </footer>
    </article>
  );
}

export function PermissionCard(props: {
  readonly summary: string;
  readonly risk: PermissionRisk;
  readonly status: PermissionStatus;
}): React.ReactElement {
  return (
    <article aria-label={`Permission ${props.status}`} className="agenthub-card agenthub-permission-card">
      <header>
        <strong>{props.summary}</strong>
        <span>{props.risk}</span>
      </header>
      <p>{props.status}</p>
      {props.status === "pending" ? (
        <footer>
          <button type="button">Allow once</button>
          <button type="button">Deny</button>
        </footer>
      ) : null}
    </article>
  );
}

export function DiffCard(props: {
  readonly files: readonly DiffFileSummary[];
  readonly state: "metadata-only" | "loading-full-diff" | "available" | "offline" | "stale" | "cached" | "error";
}): React.ReactElement {
  const insertions = props.files.reduce((sum, file) => sum + file.insertions, 0);
  const deletions = props.files.reduce((sum, file) => sum + file.deletions, 0);
  return (
    <article aria-label={`Diff ${props.state}`} className="agenthub-card agenthub-diff-card">
      <header>
        <strong>{props.files.length} files changed</strong>
        <span>{props.state}</span>
      </header>
      <p>
        +{insertions} -{deletions}
      </p>
      <button type="button">Open review</button>
    </article>
  );
}

export function WorkspaceStatusSurface(props: {
  readonly workspaceName: string;
  readonly runtimeStatus: RuntimeDeviceStatus;
  readonly runtimeLabel?: string;
}): React.ReactElement {
  return (
    <section aria-label="Workspace status">
      <strong>{props.workspaceName}</strong>
      <RuntimeStatusBadge
        status={props.runtimeStatus}
        {...(props.runtimeLabel ? { label: props.runtimeLabel } : {})}
      />
    </section>
  );
}

function timelineItemsFromSnapshot(snapshot: WorkbenchSnapshot): readonly React.ReactNode[] {
  const messageItems = snapshot.messages.map((message: Message) => (
    <article className="agenthub-message" key={message.id}>
      <strong>{message.authorKind}</strong>
      {message.parts.map((part, index) => (
        <p key={index}>{part.text ?? part.type}</p>
      ))}
    </article>
  ));

  if (messageItems.length > 0) {
    return messageItems;
  }

  return [
    <article className="agenthub-message" key="empty">
      <strong>System</strong>
      <p>Local Control Plane connected. Start a run to verify Runtime events.</p>
    </article>,
  ];
}

export function AgentHubWorkbench(props: {
  readonly snapshot?: WorkbenchSnapshot;
  readonly loading?: boolean;
  readonly error?: string | null;
  readonly onRetry?: () => void;
  readonly onSend?: (message: string) => void;
}): React.ReactElement {
  const snapshot = props.snapshot;
  const workspace = snapshot?.workspaces[0];
  const runtime = snapshot?.runtimeDevices[0];
  const runtimeStatus = runtime?.status ?? "offline";
  const runtimeOnline = runtimeStatus === "online" || runtimeStatus === "active-running";

  if (props.loading) {
    return <main className="agenthub-workbench">Loading AgentHub...</main>;
  }

  if (props.error) {
    return (
      <main className="agenthub-workbench">
        <section aria-label="Connection error">
          <strong>Control Plane offline</strong>
          <p>{props.error}</p>
          <button onClick={props.onRetry} type="button">
            Retry
          </button>
        </section>
      </main>
    );
  }

  return (
    <main className="agenthub-workbench">
      <aside>
        <WorkspaceStatusSurface
          runtimeStatus={runtimeStatus}
          workspaceName={workspace?.name ?? "AgentHub"}
          {...(runtime?.displayName ? { runtimeLabel: runtime.displayName } : {})}
        />
        <ConversationList
          conversations={(snapshot?.conversations ?? []).map((conversation) => ({
            id: conversation.id,
            title: conversation.title,
            participants: snapshot?.agents.map((agent) => agent.displayName) ?? [],
            pendingPermissions: 0,
            active: conversation.id === snapshot?.activeConversationId,
          }))}
        />
      </aside>
      <section>
        <ChatTimeline items={snapshot ? timelineItemsFromSnapshot(snapshot) : []} />
        <AgentMentionComposer
          disabled={!runtimeOnline}
          selectedTarget="@Implementer"
          targets={(snapshot?.agents ?? []).map((agent) => `@${agent.displayName}`)}
          {...(props.onSend ? { onSend: props.onSend } : {})}
        />
      </section>
      <aside aria-label="Context Inspector">
        <strong>Context Inspector</strong>
        <p>{runtimeOnline ? "Runtime online" : "Runtime offline"}</p>
        <p>{snapshot?.workspaceMetadata?.localPathLabel ?? "No workspace metadata"}</p>
      </aside>
    </main>
  );
}

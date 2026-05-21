import type {
  DiffFileSummary,
  PermissionRisk,
  PermissionStatus,
  PlanStatus,
  RuntimeDeviceStatus,
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
}): React.ReactElement {
  return (
    <form aria-label="Message composer" className="agenthub-composer">
      <select aria-label="Agent target" defaultValue={props.selectedTarget}>
        {props.targets.map((target) => (
          <option key={target}>{target}</option>
        ))}
      </select>
      <textarea aria-label="Message" placeholder="Message an agent..." />
      <button type="submit">Send</button>
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
}): React.ReactElement {
  return (
    <section aria-label="Workspace status">
      <strong>{props.workspaceName}</strong>
      <RuntimeStatusBadge status={props.runtimeStatus} />
    </section>
  );
}

export function AgentHubWorkbench(): React.ReactElement {
  return (
    <main className="agenthub-workbench">
      <aside>
        <WorkspaceStatusSurface workspaceName="AgentHub" runtimeStatus="online" />
        <ConversationList
          conversations={[
            {
              id: "conversation_1",
              title: "AgentHub demo group chat",
              participants: ["Orchestrator", "Implementer", "Reviewer"],
              pendingPermissions: 1,
              active: true,
            },
          ]}
        />
      </aside>
      <section>
        <ChatTimeline
          items={[
            <PlanCard
              agents={["Orchestrator", "Implementer", "Reviewer"]}
              key="plan"
              status="draft"
              title="Implement AgentHub foundation"
            />,
            <PermissionCard
              key="permission"
              risk="high"
              status="pending"
              summary="Run pnpm check"
            />,
            <DiffCard
              files={[{ path: "src/index.ts", status: "modified", insertions: 10, deletions: 2 }]}
              key="diff"
              state="available"
            />,
          ]}
        />
        <AgentMentionComposer selectedTarget="@Orchestrator" targets={["@Orchestrator", "@Implementer"]} />
      </section>
      <aside aria-label="Context Inspector">Context Inspector</aside>
    </main>
  );
}

import { Archive, Bot, Plus, Save, Search } from "lucide-react";
import React from "react";
import type { AgentPageAgentViewModel, WorkbenchViewModel } from "../types.js";
import { DetailSection, HoverButton, Icon } from "./primitives.js";

export interface AgentRoleMutationInput {
  readonly agentId?: string;
  readonly displayName: string;
  readonly role: AgentPageAgentViewModel["role"];
  readonly systemPrompt: string;
  readonly capabilityTags: readonly string[];
  readonly policy: Record<string, unknown>;
}

function parseTags(value: string): readonly string[] {
  return value
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
}

function parsePolicy(value: string): { readonly ok: true; readonly value: Record<string, unknown> } | { readonly ok: false; readonly error: string } {
  try {
    const parsed = JSON.parse(value) as unknown;
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      return { ok: true, value: parsed as Record<string, unknown> };
    }
    return { ok: false, error: "Policy must be a JSON object." };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Policy JSON is invalid.",
    };
  }
}

function AgentListRow(props: {
  readonly agent: AgentPageAgentViewModel;
  readonly selected: boolean;
  readonly onSelect: () => void;
}): React.ReactElement {
  const initials = props.agent.label
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

  return (
    <HoverButton
      aria-pressed={props.selected}
      className="agenthub-agent-contact-row"
      onClick={props.onSelect}
      type="button"
    >
      <span aria-hidden="true" className="agenthub-agent-avatar">
        {initials || <Icon icon={Bot} />}
      </span>
      <span className="agenthub-agent-contact-copy">
        <span className="agenthub-row-main">{props.agent.label}</span>
        <small>{props.agent.role} · {props.agent.providerLabel}</small>
      </span>
      <small>{props.agent.capabilityTags.length}</small>
    </HoverButton>
  );
}

export function AgentDirectory(props: {
  readonly model: WorkbenchViewModel;
  readonly selectedAgentId: string | null;
  readonly onSelectAgent: (agentId: string | null) => void;
}): React.ReactElement {
  const [query, setQuery] = React.useState("");
  const filteredAgents = props.model.agentsPage.agents.filter((agent) => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) {
      return true;
    }
    return [
      agent.label,
      agent.role,
      agent.providerLabel,
      agent.systemPrompt,
      ...agent.capabilityTags,
    ].some((value) => value.toLowerCase().includes(normalizedQuery));
  });
  const selected =
    filteredAgents.find((agent) => agent.id === props.selectedAgentId) ??
    props.model.agentsPage.agents.find((agent) => agent.id === props.selectedAgentId) ??
    filteredAgents[0] ??
    null;

  return (
    <section aria-label="Agent directory" className="agenthub-chat-list-panel agenthub-agent-directory-sidebar">
      <header className="agenthub-chat-list-header">
        <label className="agenthub-conversation-search">
          <Icon icon={Search} />
          <input
            aria-label="Search agents"
            onChange={(event) => setQuery(event.currentTarget.value)}
            placeholder="Search agents"
            type="search"
            value={query}
          />
        </label>
        <HoverButton
          aria-label="New agent"
          className="agenthub-icon-button"
          onClick={() => props.onSelectAgent(null)}
          type="button"
        >
          <Icon icon={Plus} />
        </HoverButton>
      </header>
      <nav aria-label="Agent roles" className="agenthub-agent-directory-list">
        <small className="agenthub-agent-directory-group">Agents</small>
        {filteredAgents.map((agent) => (
          <AgentListRow
            agent={agent}
            key={agent.id}
            selected={agent.id === selected?.id && props.selectedAgentId !== null}
            onSelect={() => props.onSelectAgent(agent.id)}
          />
        ))}
      </nav>
    </section>
  );
}

function AgentEditor(props: {
  readonly agent: AgentPageAgentViewModel | null;
  readonly onCreateAgentRole?: (input: Omit<AgentRoleMutationInput, "agentId">) => void;
  readonly onUpdateAgentRole?: (input: AgentRoleMutationInput & { readonly agentId: string }) => void;
  readonly onArchiveAgentRole?: (agentId: string) => void;
}): React.ReactElement {
  const [mode, setMode] = React.useState<"edit" | "new">("edit");
  const [displayName, setDisplayName] = React.useState(props.agent?.label ?? "");
  const [role, setRole] = React.useState<AgentPageAgentViewModel["role"]>(props.agent?.role ?? "worker");
  const [systemPrompt, setSystemPrompt] = React.useState(props.agent?.systemPrompt ?? "");
  const [tags, setTags] = React.useState(props.agent?.capabilityTags.join(", ") ?? "");
  const [policyJson, setPolicyJson] = React.useState(props.agent?.policyJson ?? "{}");
  const [policyError, setPolicyError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!props.agent) {
      setMode("new");
      return;
    }
    if (mode === "new") {
      return;
    }
    setDisplayName(props.agent?.label ?? "");
    setRole(props.agent?.role ?? "worker");
    setSystemPrompt(props.agent?.systemPrompt ?? "");
    setTags(props.agent?.capabilityTags.join(", ") ?? "");
    setPolicyJson(props.agent?.policyJson ?? "{}");
    setPolicyError(null);
  }, [props.agent, mode]);

  const editingExisting = mode === "edit" && props.agent;
  const canSubmit = displayName.trim() && systemPrompt.trim();

  return (
    <section className="agenthub-agent-detail">
      <header className="agenthub-agent-profile">
        <span aria-hidden="true" className="agenthub-agent-profile-avatar">
          {mode === "new" ? <Icon icon={Plus} /> : props.agent?.label.slice(0, 2).toUpperCase() ?? <Icon icon={Bot} />}
        </span>
        <div className="agenthub-agent-profile-copy">
          <strong>{mode === "new" ? "New agent" : props.agent?.label ?? "Agent"}</strong>
          <p className="agenthub-muted">
            {mode === "new" ? "Claude Code-backed role configuration" : `${props.agent?.role ?? "worker"} · ${props.agent?.providerLabel ?? "Claude Code"}`}
          </p>
          {props.agent?.defaultAgent ? <span className="agenthub-agent-default">Default agent</span> : null}
        </div>
        <div className="agenthub-agent-profile-actions">
          <HoverButton
            onClick={() => {
              setMode("new");
              setDisplayName("");
              setRole("worker");
              setSystemPrompt("");
              setTags("");
              setPolicyJson("{}");
            }}
            type="button"
          >
            <Icon icon={Plus} /> New agent
          </HoverButton>
        </div>
      </header>
      <form
        className="agenthub-agent-editor"
        onSubmit={(event) => {
          event.preventDefault();
          if (!canSubmit) {
            return;
          }
          const policy = parsePolicy(policyJson);
          if (!policy.ok) {
            setPolicyError(policy.error);
            return;
          }
          const payload = {
            displayName: displayName.trim(),
            role,
            systemPrompt: systemPrompt.trim(),
            capabilityTags: parseTags(tags),
            policy: policy.value,
          };
          if (editingExisting) {
            props.onUpdateAgentRole?.({ ...payload, agentId: props.agent.id });
          } else {
            props.onCreateAgentRole?.(payload);
          }
        }}
      >
        <label>
          <span>Name</span>
          <input aria-label="Agent name" value={displayName} onChange={(event) => setDisplayName(event.currentTarget.value)} />
        </label>
        <label>
          <span>Role</span>
          <select aria-label="Agent role" value={role} onChange={(event) => setRole(event.currentTarget.value as AgentPageAgentViewModel["role"])}>
            <option value="orchestrator">orchestrator</option>
            <option value="worker">worker</option>
          </select>
        </label>
        <label className="agenthub-agent-editor-wide">
          <span>System prompt</span>
          <textarea
            aria-label="Agent system prompt"
            rows={7}
            value={systemPrompt}
            onChange={(event) => setSystemPrompt(event.currentTarget.value)}
          />
        </label>
        <label>
          <span>Capability tags</span>
          <input aria-label="Capability tags" value={tags} onChange={(event) => setTags(event.currentTarget.value)} />
        </label>
        <label className="agenthub-agent-editor-wide">
          <span>Policy JSON</span>
          <textarea
            aria-label="Policy JSON"
            aria-invalid={policyError ? "true" : undefined}
            rows={5}
            value={policyJson}
            onChange={(event) => {
              setPolicyJson(event.currentTarget.value);
              setPolicyError(null);
            }}
          />
          {policyError ? <span className="agenthub-form-error">{policyError}</span> : null}
        </label>
        {props.agent ? (
          <DetailSection title="Memory namespace">
            <code>{props.agent.memoryNamespace}</code>
          </DetailSection>
        ) : null}
        <div className="agenthub-action-row agenthub-agent-editor-wide">
          <HoverButton disabled={!canSubmit} type="submit">
            <Icon icon={Save} /> Save changes
          </HoverButton>
          <HoverButton
            disabled={!props.agent || props.agent.defaultAgent}
            onClick={() => {
              if (props.agent && !props.agent.defaultAgent) {
                props.onArchiveAgentRole?.(props.agent.id);
              }
            }}
            type="button"
          >
            <Icon icon={Archive} /> Archive
          </HoverButton>
        </div>
      </form>
    </section>
  );
}

export function AgentsPage(props: {
  readonly model: WorkbenchViewModel;
  readonly selectedAgentId: string | null;
  readonly onCreateAgentRole?: (input: Omit<AgentRoleMutationInput, "agentId">) => void;
  readonly onUpdateAgentRole?: (input: AgentRoleMutationInput & { readonly agentId: string }) => void;
  readonly onArchiveAgentRole?: (agentId: string) => void;
}): React.ReactElement {
  const selected =
    props.model.agentsPage.agents.find((agent) => agent.id === props.selectedAgentId) ??
    props.model.agentsPage.agents[0] ??
    null;

  return (
    <div aria-label="Agents page" className="agenthub-agents-page">
      <AgentEditor
        agent={props.selectedAgentId === null ? null : selected}
        key={props.selectedAgentId ?? "new"}
        {...(props.onArchiveAgentRole ? { onArchiveAgentRole: props.onArchiveAgentRole } : {})}
        {...(props.onCreateAgentRole ? { onCreateAgentRole: props.onCreateAgentRole } : {})}
        {...(props.onUpdateAgentRole ? { onUpdateAgentRole: props.onUpdateAgentRole } : {})}
      />
    </div>
  );
}

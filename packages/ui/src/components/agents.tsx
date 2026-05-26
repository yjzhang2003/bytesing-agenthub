import { Bot, MessageSquarePlus, Plus, Trash2 } from "lucide-react";
import React from "react";
import { type TranslationKey, useAgentHubI18n } from "../i18n.js";
import type {
  AgentPageAgentViewModel,
  AgentRuntimeProvider,
  ComposerClaudeCodeControls,
  WorkbenchViewModel,
} from "../types.js";
import {
  AgentHubAvatar,
  AgentHubBadge,
  AgentHubButton,
  AgentHubSelect,
  AgentHubTextArea,
  AgentHubTextInput,
} from "./system.js";
import { Icon, SidebarSearchField } from "./primitives.js";

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

function parsePolicy(
  value: string,
):
  | { readonly ok: true; readonly value: Record<string, unknown> }
  | { readonly ok: false; readonly error: string } {
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

interface AgentTemplatePreset {
  readonly id: string;
  readonly labelKey: TranslationKey;
  readonly descriptionKey: TranslationKey;
  readonly displayName: string;
  readonly role: AgentPageAgentViewModel["role"];
  readonly systemPrompt: string;
  readonly capabilityTags: readonly string[];
  readonly policy: Record<string, unknown>;
}

const agentTemplatePresets: readonly [
  AgentTemplatePreset,
  AgentTemplatePreset,
  AgentTemplatePreset,
  AgentTemplatePreset,
] = [
  {
    id: "orchestrator",
    labelKey: "agents.templateOrchestrator",
    descriptionKey: "agents.templateOrchestratorDescription",
    displayName: "Orchestrator",
    role: "orchestrator",
    systemPrompt:
      "Coordinate multi-agent work, create plans, assign tasks, and summarize outcomes.",
    capabilityTags: ["planning", "coordination"],
    policy: {},
  },
  {
    id: "implementer",
    labelKey: "agents.templateImplementer",
    descriptionKey: "agents.templateImplementerDescription",
    displayName: "Implementer",
    role: "worker",
    systemPrompt:
      "Implement scoped code changes, keep edits focused, and report validation results.",
    capabilityTags: ["code", "implementation"],
    policy: {},
  },
  {
    id: "reviewer",
    labelKey: "agents.templateReviewer",
    descriptionKey: "agents.templateReviewerDescription",
    displayName: "Reviewer",
    role: "worker",
    systemPrompt:
      "Review code for correctness, regressions, missing tests, and maintainability risks.",
    capabilityTags: ["review", "quality"],
    policy: {},
  },
  {
    id: "researcher",
    labelKey: "agents.templateResearcher",
    descriptionKey: "agents.templateResearcherDescription",
    displayName: "Researcher",
    role: "worker",
    systemPrompt:
      "Research context, compare options, and summarize findings before implementation.",
    capabilityTags: ["research", "analysis"],
    policy: { network: "ask" },
  },
];

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
    <AgentHubButton
      aria-pressed={props.selected}
      className="agenthub-agent-contact-row"
      htmlType="button"
      onClick={props.onSelect}
    >
      <AgentHubAvatar className="agenthub-agent-avatar" size={44}>
        {initials || <Icon icon={Bot} />}
      </AgentHubAvatar>
      <span className="agenthub-agent-contact-copy">
        <span className="agenthub-row-main">{props.agent.label}</span>
        <small>
          {props.agent.role} · {props.agent.providerLabel}
        </small>
      </span>
      <AgentHubBadge count={props.agent.capabilityTags.length} size="small" />
    </AgentHubButton>
  );
}

export function AgentDirectory(props: {
  readonly model: WorkbenchViewModel;
  readonly selectedAgentId: string | null;
  readonly onSelectAgent: (agentId: string | null) => void;
}): React.ReactElement {
  const i18n = useAgentHubI18n();
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
    <section
      aria-label={i18n.t("agents.agentDirectory")}
      className="agenthub-chat-list-panel agenthub-agent-directory-sidebar"
    >
      <header className="agenthub-chat-list-header">
        <SidebarSearchField
          label={i18n.t("agents.searchAgents")}
          onChange={(event) => setQuery(event.currentTarget.value)}
          placeholder={i18n.t("agents.searchAgents")}
          value={query}
        />
        <AgentHubButton
          aria-label={i18n.t("actions.newAgent")}
          className="agenthub-icon-button"
          htmlType="button"
          onClick={() => props.onSelectAgent(null)}
        >
          <Icon icon={Plus} />
        </AgentHubButton>
      </header>
      <nav aria-label={i18n.t("agents.agentRoles")} className="agenthub-agent-directory-list">
        <small className="agenthub-agent-directory-group">{i18n.t("agents.agents")}</small>
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
  readonly onUpdateAgentRole?: (
    input: AgentRoleMutationInput & { readonly agentId: string },
  ) => void;
  readonly onArchiveAgentRole?: (agentId: string) => void;
  readonly onCreateAgentConversation?: (agentId: string) => void | Promise<void>;
}): React.ReactElement {
  const i18n = useAgentHubI18n();
  const defaultTemplate = agentTemplatePresets[1];
  const [mode, setMode] = React.useState<"edit" | "new">(props.agent ? "edit" : "new");
  const [selectedTemplateId, setSelectedTemplateId] = React.useState(defaultTemplate.id);
  const [displayName, setDisplayName] = React.useState(
    props.agent?.label ?? defaultTemplate.displayName,
  );
  const [role, setRole] = React.useState<AgentPageAgentViewModel["role"]>(
    props.agent?.role ?? defaultTemplate.role,
  );
  const [systemPrompt, setSystemPrompt] = React.useState(
    props.agent?.systemPrompt ?? defaultTemplate.systemPrompt,
  );
  const [tags, setTags] = React.useState(
    props.agent?.capabilityTags.join(", ") ?? defaultTemplate.capabilityTags.join(", "),
  );
  const [policyJson, setPolicyJson] = React.useState(
    props.agent?.policyJson ?? JSON.stringify(defaultTemplate.policy, null, 2),
  );
  const [runtimeProvider, setRuntimeProvider] = React.useState<AgentRuntimeProvider>(
    props.agent?.runtimeProvider ?? "claude-code",
  );
  const [claudePermissionPreset, setClaudePermissionPreset] = React.useState<
    ComposerClaudeCodeControls["permissionPreset"]
  >(props.agent?.claudeCodeDefaults?.permissionPreset ?? "ask-first");
  const [claudeRuntimeProfileId, setClaudeRuntimeProfileId] = React.useState(
    props.agent?.claudeCodeDefaults?.runtimeProfileId ?? "default",
  );
  const [claudeMcpProfileId, setClaudeMcpProfileId] = React.useState(
    props.agent?.claudeCodeDefaults?.mcpProfileId ?? "none",
  );
  const [claudeEffort, setClaudeEffort] = React.useState<ComposerClaudeCodeControls["effort"]>(
    props.agent?.claudeCodeDefaults?.effort ?? "medium",
  );
  const [claudeSettingsSource, setClaudeSettingsSource] = React.useState<
    ComposerClaudeCodeControls["settingsSource"]
  >(props.agent?.claudeCodeDefaults?.settingsSource ?? "inherit");
  const [claudeHooksPolicy, setClaudeHooksPolicy] = React.useState<
    ComposerClaudeCodeControls["hooksPolicy"]
  >(props.agent?.claudeCodeDefaults?.hooksPolicy ?? "disabled");
  const [policyError, setPolicyError] = React.useState<string | null>(null);
  const [conversationPending, setConversationPending] = React.useState(false);
  const [conversationError, setConversationError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!props.agent) {
      setMode("new");
      const template =
        agentTemplatePresets.find((candidate) => candidate.id === selectedTemplateId) ??
        defaultTemplate;
      setDisplayName(template.displayName);
      setRole(template.role);
      setSystemPrompt(template.systemPrompt);
      setTags(template.capabilityTags.join(", "));
      setPolicyJson(JSON.stringify(template.policy, null, 2));
      setRuntimeProvider("claude-code");
      setClaudePermissionPreset("ask-first");
      setClaudeRuntimeProfileId("default");
      setClaudeMcpProfileId("none");
      setClaudeEffort("medium");
      setClaudeSettingsSource("inherit");
      setClaudeHooksPolicy("disabled");
      setPolicyError(null);
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
    setRuntimeProvider(props.agent?.runtimeProvider ?? "claude-code");
    setClaudePermissionPreset(props.agent?.claudeCodeDefaults?.permissionPreset ?? "ask-first");
    setClaudeRuntimeProfileId(props.agent?.claudeCodeDefaults?.runtimeProfileId ?? "default");
    setClaudeMcpProfileId(props.agent?.claudeCodeDefaults?.mcpProfileId ?? "none");
    setClaudeEffort(props.agent?.claudeCodeDefaults?.effort ?? "medium");
    setClaudeSettingsSource(props.agent?.claudeCodeDefaults?.settingsSource ?? "inherit");
    setClaudeHooksPolicy(props.agent?.claudeCodeDefaults?.hooksPolicy ?? "disabled");
    setPolicyError(null);
  }, [defaultTemplate, mode, props.agent, selectedTemplateId]);

  const editingExisting = mode === "edit" && props.agent;
  const editingAgentId = editingExisting ? props.agent.id : null;
  const canSubmit = Boolean(displayName.trim() && systemPrompt.trim());
  const selectedTemplate =
    agentTemplatePresets.find((candidate) => candidate.id === selectedTemplateId) ??
    defaultTemplate;

  const applyTemplate = (template: AgentTemplatePreset) => {
    setSelectedTemplateId(template.id);
    setDisplayName(template.displayName);
    setRole(template.role);
    setSystemPrompt(template.systemPrompt);
    setTags(template.capabilityTags.join(", "));
    setPolicyJson(JSON.stringify(template.policy, null, 2));
    setRuntimeProvider("claude-code");
    setClaudePermissionPreset("ask-first");
    setClaudeRuntimeProfileId("default");
    setClaudeMcpProfileId("none");
    setClaudeEffort("medium");
    setClaudeSettingsSource("inherit");
    setClaudeHooksPolicy("disabled");
    setPolicyError(null);
  };

  const saveAgentRole = React.useCallback(() => {
    if (!canSubmit) {
      return;
    }
    const policy = parsePolicy(policyJson);
    if (!policy.ok) {
      setPolicyError(policy.error);
      return;
    }
    const basePolicy = { ...policy.value };
    delete basePolicy["claudeCode"];
    const claudeCodePolicy = {
      ...((policy.value["claudeCode"] &&
      typeof policy.value["claudeCode"] === "object" &&
      !Array.isArray(policy.value["claudeCode"])
        ? policy.value["claudeCode"]
        : {}) as Record<string, unknown>),
      permissionPreset: claudePermissionPreset,
      runtimeProfileId: claudeRuntimeProfileId,
      mcpProfileId: claudeMcpProfileId,
      effort: claudeEffort,
      settingsSource: claudeSettingsSource,
      hooksPolicy: claudeHooksPolicy,
    };
    const policyValue = {
      ...basePolicy,
      runtime: {
        ...((basePolicy["runtime"] &&
        typeof basePolicy["runtime"] === "object" &&
        !Array.isArray(basePolicy["runtime"])
          ? basePolicy["runtime"]
          : {}) as Record<string, unknown>),
        provider: runtimeProvider,
      },
      ...(runtimeProvider === "claude-code" ? { claudeCode: claudeCodePolicy } : {}),
    };
    setPolicyJson(JSON.stringify(policyValue, null, 2));
    const payload = {
      displayName: displayName.trim(),
      role,
      systemPrompt: systemPrompt.trim(),
      capabilityTags: parseTags(tags),
      policy: policyValue,
    };
    if (editingExisting) {
      props.onUpdateAgentRole?.({ ...payload, agentId: props.agent.id });
    } else {
      props.onCreateAgentRole?.(payload);
    }
  }, [
    canSubmit,
    claudeEffort,
    claudeHooksPolicy,
    claudeMcpProfileId,
    claudePermissionPreset,
    claudeRuntimeProfileId,
    claudeSettingsSource,
    displayName,
    editingExisting,
    policyJson,
    props,
    role,
    runtimeProvider,
    systemPrompt,
    tags,
  ]);

  const createAgentConversation = React.useCallback(() => {
    if (!editingAgentId || !props.onCreateAgentConversation || conversationPending) {
      return;
    }
    setConversationPending(true);
    setConversationError(null);
    void Promise.resolve(props.onCreateAgentConversation(editingAgentId))
      .catch((error: unknown) => {
        setConversationError(
          error instanceof Error ? error.message : i18n.t("agents.newConversationFailed"),
        );
      })
      .finally(() => setConversationPending(false));
  }, [conversationPending, editingAgentId, i18n, props]);

  return (
    <section className="agenthub-agent-detail">
      <header className="agenthub-agent-profile">
        <AgentHubAvatar className="agenthub-agent-profile-avatar" size={52}>
          {mode === "new" ? (
            <Icon icon={Plus} />
          ) : (
            (props.agent?.label.slice(0, 2).toUpperCase() ?? <Icon icon={Bot} />)
          )}
        </AgentHubAvatar>
        <div className="agenthub-agent-profile-copy">
          <strong>
            {mode === "new"
              ? i18n.t("actions.newAgent")
              : (props.agent?.label ?? i18n.t("agents.agent"))}
          </strong>
          {props.agent?.defaultAgent ? (
            <span className="agenthub-agent-status-pill">{i18n.t("agents.defaultAgent")}</span>
          ) : null}
        </div>
      </header>
      <form
        className="agenthub-agent-editor"
        onBlur={(event) => {
          const nextFocused = event.relatedTarget;
          if (nextFocused instanceof Node && event.currentTarget.contains(nextFocused)) {
            return;
          }
          saveAgentRole();
        }}
        onSubmit={(event) => {
          event.preventDefault();
          saveAgentRole();
        }}
      >
        {mode === "new" ? (
          <section className="agenthub-agent-settings-group agenthub-agent-template-section">
            <header className="agenthub-section-heading">
              <h3>{i18n.t("agents.startFromTemplate")}</h3>
              <small>{i18n.t("agents.startFromTemplateDescription")}</small>
            </header>
            <div className="agenthub-agent-settings-body">
              <div className="agenthub-agent-template-grid">
                {agentTemplatePresets.map((template) => (
                  <AgentHubButton
                    aria-pressed={template.id === selectedTemplate.id}
                    className="agenthub-agent-template-option"
                    htmlType="button"
                    key={template.id}
                    onClick={() => applyTemplate(template)}
                  >
                    <span>{i18n.t(template.labelKey)}</span>
                    <small>{i18n.t(template.descriptionKey)}</small>
                  </AgentHubButton>
                ))}
              </div>
            </div>
          </section>
        ) : null}
        <section className="agenthub-agent-settings-group">
          <header>
            <h3>{i18n.t("agents.basicInformation")}</h3>
          </header>
          <div className="agenthub-agent-settings-body">
            <label>
              <span>{i18n.t("agents.name")}</span>
              <AgentHubTextInput
                aria-label={i18n.t("agents.agentName")}
                value={displayName}
                onChange={(event) => setDisplayName(event.currentTarget.value)}
              />
            </label>
            <label>
              <span>{i18n.t("agents.role")}</span>
              <AgentHubSelect
                aria-label={i18n.t("agents.agentRole")}
                value={role}
                onChange={(value) => setRole(value)}
                options={[
                  { label: "orchestrator", value: "orchestrator" },
                  { label: "worker", value: "worker" },
                ]}
              />
            </label>
            <label className="agenthub-agent-editor-wide">
              <span>{i18n.t("agents.responsibilities")}</span>
              <AgentHubTextArea
                aria-label={i18n.t("agents.responsibilities")}
                autoSize={{ maxRows: 6, minRows: 1 }}
                value={systemPrompt}
                onChange={(event) => setSystemPrompt(event.currentTarget.value)}
              />
            </label>
            <label>
              <span>{i18n.t("agents.capabilityTags")}</span>
              <AgentHubTextInput
                aria-label={i18n.t("agents.capabilityTags")}
                value={tags}
                onChange={(event) => setTags(event.currentTarget.value)}
              />
            </label>
          </div>
        </section>
        <section className="agenthub-agent-settings-group">
          <header>
            <h3>{i18n.t("settings.runtime", { fallback: "Runtime" })}</h3>
          </header>
          <div className="agenthub-agent-settings-body">
            <label>
              <span>{i18n.t("agentInChat.provider", { fallback: "Provider" })}</span>
              <AgentHubSelect
                aria-label={i18n.t("agentInChat.provider", { fallback: "Provider" })}
                value={runtimeProvider}
                onValueChange={setRuntimeProvider}
                options={[
                  { label: "Claude Code", value: "claude-code" },
                  { label: "Codex", value: "codex" },
                ]}
              />
            </label>
            {runtimeProvider === "codex" ? (
              <span className="agenthub-warning">
                {i18n.t("claudeCode.codexRuntimeFuture", {
                  fallback:
                    "Codex runtime support is not wired yet. This saves the agent preference for the future runtime adapter.",
                })}
              </span>
            ) : null}
          </div>
        </section>
        {runtimeProvider === "claude-code" ? (
          <section className="agenthub-agent-settings-group">
            <header>
              <h3>{i18n.t("claudeCode.defaults", { fallback: "Claude Code defaults" })}</h3>
            </header>
            <div className="agenthub-agent-settings-body">
              <label>
                <span>{i18n.t("claudeCode.permission", { fallback: "Permission" })}</span>
                <AgentHubSelect
                  aria-label={i18n.t("claudeCode.permissionDefault", {
                    fallback: "Claude Code permission default",
                  })}
                  value={claudePermissionPreset}
                  onValueChange={setClaudePermissionPreset}
                  options={[
                    {
                      label: i18n.t("claudeCode.permission.planOnly", { fallback: "Plan only" }),
                      value: "plan-only",
                    },
                    {
                      label: i18n.t("claudeCode.permission.askFirst", { fallback: "Ask first" }),
                      value: "ask-first",
                    },
                    {
                      label: i18n.t("claudeCode.permission.autoEdits", { fallback: "Auto edits" }),
                      value: "auto-edits",
                    },
                    {
                      label: i18n.t("claudeCode.permission.fullAccess", {
                        fallback: "Full access",
                      }),
                      value: "full-access",
                    },
                  ]}
                />
              </label>
              <label>
                <span>{i18n.t("claudeCode.runtimeProfile", { fallback: "Runtime profile" })}</span>
                <AgentHubTextInput
                  aria-label={i18n.t("claudeCode.runtimeProfileDefault", {
                    fallback: "Claude Code runtime profile default",
                  })}
                  value={claudeRuntimeProfileId}
                  onChange={(event) => setClaudeRuntimeProfileId(event.currentTarget.value)}
                />
              </label>
              <label>
                <span>{i18n.t("claudeCode.mcpProfile", { fallback: "MCP profile" })}</span>
                <AgentHubTextInput
                  aria-label={i18n.t("claudeCode.mcpProfileDefault", {
                    fallback: "Claude Code MCP profile default",
                  })}
                  value={claudeMcpProfileId}
                  onChange={(event) => setClaudeMcpProfileId(event.currentTarget.value)}
                />
              </label>
              <label>
                <span>{i18n.t("claudeCode.effort", { fallback: "Effort" })}</span>
                <AgentHubSelect
                  aria-label={i18n.t("claudeCode.effortDefault", {
                    fallback: "Claude Code effort default",
                  })}
                  value={claudeEffort}
                  onValueChange={setClaudeEffort}
                  options={[
                    { label: i18n.t("claudeCode.option.low", { fallback: "Low" }), value: "low" },
                    {
                      label: i18n.t("claudeCode.option.medium", { fallback: "Medium" }),
                      value: "medium",
                    },
                    {
                      label: i18n.t("claudeCode.option.high", { fallback: "High" }),
                      value: "high",
                    },
                    {
                      label: i18n.t("claudeCode.option.xhigh", { fallback: "XHigh" }),
                      value: "xhigh",
                    },
                    { label: i18n.t("claudeCode.option.max", { fallback: "Max" }), value: "max" },
                  ]}
                />
              </label>
              <label>
                <span>{i18n.t("claudeCode.settings", { fallback: "Settings" })}</span>
                <AgentHubSelect
                  aria-label={i18n.t("claudeCode.settingsSourceDefault", {
                    fallback: "Claude Code settings source default",
                  })}
                  value={claudeSettingsSource}
                  onValueChange={setClaudeSettingsSource}
                  options={[
                    {
                      label: i18n.t("claudeCode.option.inherited", { fallback: "Inherited" }),
                      value: "inherit",
                    },
                    {
                      label: i18n.t("claudeCode.option.managed", { fallback: "Managed" }),
                      value: "managed",
                    },
                    {
                      label: i18n.t("claudeCode.option.isolated", { fallback: "Isolated" }),
                      value: "isolated",
                    },
                  ]}
                />
              </label>
              <label>
                <span>{i18n.t("claudeCode.hooks", { fallback: "Hooks" })}</span>
                <AgentHubSelect
                  aria-label={i18n.t("claudeCode.hooksDefault", {
                    fallback: "Claude Code hooks default",
                  })}
                  value={claudeHooksPolicy}
                  onValueChange={setClaudeHooksPolicy}
                  options={[
                    {
                      label: i18n.t("claudeCode.option.inherited", { fallback: "Inherited" }),
                      value: "inherit",
                    },
                    {
                      label: i18n.t("claudeCode.option.disabled", { fallback: "Disabled" }),
                      value: "disabled",
                    },
                    {
                      label: i18n.t("claudeCode.option.enabled", { fallback: "Enabled" }),
                      value: "enabled",
                    },
                  ]}
                />
              </label>
              {claudePermissionPreset === "full-access" ? (
                <span className="agenthub-warning">
                  {i18n.t("claudeCode.fullAccessDefaultWarning", {
                    fallback: "Full access is a high-risk default for future runs.",
                  })}
                </span>
              ) : null}
              {claudeHooksPolicy === "enabled" || claudeHooksPolicy === "inherit" ? (
                <span className="agenthub-warning">
                  {i18n.t("claudeCode.hooksWarning", {
                    fallback: "Hooks may execute local commands during runs.",
                  })}
                </span>
              ) : null}
            </div>
          </section>
        ) : null}
        <details
          className="agenthub-agent-settings-group agenthub-agent-advanced"
          open={policyError ? true : undefined}
        >
          <summary>
            <h3>{i18n.t("agents.advancedConfiguration")}</h3>
          </summary>
          <div className="agenthub-agent-settings-body agenthub-agent-advanced-grid">
            {mode === "edit" && props.agent ? (
              <>
                <div className="agenthub-agent-readonly-row">
                  <span>{i18n.t("connections.mode")}</span>
                  <strong>{props.agent.providerLabel}</strong>
                </div>
                <div className="agenthub-agent-readonly-row">
                  <span>{i18n.t("agents.memoryNamespace")}</span>
                  <code>{props.agent.memoryNamespace}</code>
                </div>
              </>
            ) : null}
            <label>
              <span>{i18n.t("agents.systemPrompt")}</span>
              <AgentHubTextArea
                aria-label={i18n.t("agents.systemPrompt")}
                autoSize={{ maxRows: 6, minRows: 1 }}
                value={systemPrompt}
                onChange={(event) => setSystemPrompt(event.currentTarget.value)}
              />
            </label>
            <label>
              <span>{i18n.t("agents.policyJson")}</span>
              <AgentHubTextArea
                aria-label={i18n.t("agents.policyJson")}
                aria-invalid={policyError ? "true" : undefined}
                autoSize={{ maxRows: 6, minRows: 1 }}
                value={policyJson}
                onChange={(event) => {
                  setPolicyJson(event.currentTarget.value);
                  setPolicyError(null);
                }}
              />
              {policyError ? <span className="agenthub-form-error">{policyError}</span> : null}
            </label>
          </div>
        </details>
        {editingAgentId ? (
          <div className="agenthub-action-row agenthub-agent-form-actions">
            <AgentHubButton
              className="agenthub-agent-new-conversation-button"
              disabled={!props.onCreateAgentConversation || conversationPending}
              htmlType="button"
              kind="primary"
              loading={conversationPending}
              onClick={createAgentConversation}
            >
              <Icon icon={MessageSquarePlus} /> {i18n.t("actions.newConversation")}
            </AgentHubButton>
            {props.onArchiveAgentRole ? (
              <AgentHubButton
                className="agenthub-agent-delete-button"
                htmlType="button"
                kind="danger"
                onClick={() => props.onArchiveAgentRole?.(editingAgentId)}
              >
                <Icon icon={Trash2} /> {i18n.t("actions.deleteAgent")}
              </AgentHubButton>
            ) : null}
            {conversationError ? (
              <span className="agenthub-form-error">{conversationError}</span>
            ) : null}
          </div>
        ) : null}
      </form>
    </section>
  );
}

export function AgentsPage(props: {
  readonly model: WorkbenchViewModel;
  readonly selectedAgentId: string | null;
  readonly onCreateAgentRole?: (input: Omit<AgentRoleMutationInput, "agentId">) => void;
  readonly onUpdateAgentRole?: (
    input: AgentRoleMutationInput & { readonly agentId: string },
  ) => void;
  readonly onArchiveAgentRole?: (agentId: string) => void;
  readonly onCreateAgentConversation?: (agentId: string) => void | Promise<void>;
}): React.ReactElement {
  const i18n = useAgentHubI18n();
  const selected =
    props.model.agentsPage.agents.find((agent) => agent.id === props.selectedAgentId) ??
    props.model.agentsPage.agents[0] ??
    null;

  return (
    <div aria-label={i18n.t("agents.agents")} className="agenthub-agents-page">
      <AgentEditor
        agent={props.selectedAgentId === null ? null : selected}
        key={props.selectedAgentId ?? "new"}
        {...(props.onArchiveAgentRole ? { onArchiveAgentRole: props.onArchiveAgentRole } : {})}
        {...(props.onCreateAgentConversation
          ? { onCreateAgentConversation: props.onCreateAgentConversation }
          : {})}
        {...(props.onCreateAgentRole ? { onCreateAgentRole: props.onCreateAgentRole } : {})}
        {...(props.onUpdateAgentRole ? { onUpdateAgentRole: props.onUpdateAgentRole } : {})}
      />
    </div>
  );
}

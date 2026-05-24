import type { Agent } from "@agenthub/contracts";
import { Mic, Plus, Send, ShieldAlert, Zap } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import React from "react";
import type { AgentHubLocale } from "../i18n.js";
import { useAgentHubI18n } from "../i18n.js";
import type { AgentTargetViewModel, ComposerClaudeCodeControls } from "../types.js";
import { AgentHubButton, AgentHubCheckbox, AgentHubSelect, AgentHubTextArea } from "./system.js";
import { Icon } from "./primitives.js";

const SLASH_COMMANDS = [
  { id: "plan", label: "/plan", description: "Plan with the orchestrator" },
  { id: "direct", label: "/direct", description: "Send a direct agent message" },
] as const;

const defaultClaudeCodeControls: ComposerClaudeCodeControls = {
  permissionPreset: "ask-first",
  runtimeProfileId: "default",
  mcpProfileId: "none",
  pluginProfileId: "default",
  effort: "medium",
  sessionBehavior: "new",
  sessionId: null,
  settingsSource: "managed",
  hooksPolicy: "disabled",
  allowedTools: [],
  disallowedTools: [],
};

export function AgentMentionComposer(props: {
  readonly targets: readonly AgentTargetViewModel[] | readonly string[];
  readonly selectedTarget: string;
  readonly disabled?: boolean;
  readonly disabledReason?: string | null;
  readonly enterToSend?: boolean;
  readonly locale?: AgentHubLocale | undefined;
  readonly modeLabel?: string;
  readonly claudeCodeControls?: ComposerClaudeCodeControls | null;
  readonly onSend?: (
    message: string,
    target: string,
    claudeCode?: ComposerClaudeCodeControls,
  ) => void;
}): React.ReactElement {
  const i18n = useAgentHubI18n(props.locale);
  const normalizedTargets = props.targets.map((target) =>
    typeof target === "string"
      ? {
          capabilityTags: [],
          id: target,
          label: target.replace(/^@/, ""),
          providerLabel: "Unknown provider",
          runtimeProvider: "claude-code" as const,
          role: target.toLowerCase().includes("orchestrator")
            ? ("orchestrator" as const)
            : ("worker" as const),
          target,
        }
      : target,
  );
  const [message, setMessage] = React.useState("");
  const [target, setTarget] = React.useState(props.selectedTarget);
  const [isMultiline, setIsMultiline] = React.useState(false);
  const selected =
    normalizedTargets.find((candidate) => candidate.target === target) ?? normalizedTargets[0];
  const activeClaudeCodeControls =
    selected?.runtimeProvider === "claude-code"
      ? (selected.claudeCodeControls ?? props.claudeCodeControls ?? defaultClaudeCodeControls)
      : null;
  const initialClaudeCodeControls = activeClaudeCodeControls ?? defaultClaudeCodeControls;
  const [permissionPreset, setPermissionPreset] = React.useState<
    ComposerClaudeCodeControls["permissionPreset"]
  >(initialClaudeCodeControls.permissionPreset);
  const [runtimeProfileId, setRuntimeProfileId] = React.useState(
    initialClaudeCodeControls.runtimeProfileId,
  );
  const [mcpProfileId, setMcpProfileId] = React.useState(initialClaudeCodeControls.mcpProfileId);
  const [pluginProfileId, setPluginProfileId] = React.useState(
    initialClaudeCodeControls.pluginProfileId ?? "default",
  );
  const [effort, setEffort] = React.useState<ComposerClaudeCodeControls["effort"]>(
    initialClaudeCodeControls.effort,
  );
  const [sessionBehavior, setSessionBehavior] = React.useState<
    ComposerClaudeCodeControls["sessionBehavior"]
  >(initialClaudeCodeControls.sessionBehavior);
  const [sessionId, setSessionId] = React.useState(initialClaudeCodeControls.sessionId ?? "");
  const [settingsSource, setSettingsSource] = React.useState<
    ComposerClaudeCodeControls["settingsSource"]
  >(initialClaudeCodeControls.settingsSource);
  const [hooksPolicy, setHooksPolicy] = React.useState<ComposerClaudeCodeControls["hooksPolicy"]>(
    initialClaudeCodeControls.hooksPolicy,
  );
  const [allowedToolsText, setAllowedToolsText] = React.useState(
    initialClaudeCodeControls.allowedTools?.join(", ") ?? "",
  );
  const [disallowedToolsText, setDisallowedToolsText] = React.useState(
    initialClaudeCodeControls.disallowedTools?.join(", ") ?? "",
  );
  const [fullAccessConfirmed, setFullAccessConfirmed] = React.useState(false);
  const textareaRef = React.useRef<HTMLTextAreaElement | null>(null);
  const planTarget =
    normalizedTargets.find((candidate) => candidate.role === "orchestrator") ?? selected;
  const directTarget =
    normalizedTargets.find((candidate) => candidate.role !== "orchestrator") ?? selected;
  const currentToken = message.match(/(?:^|\s)([@/][^\s]*)$/)?.[1] ?? "";
  const suggestionMode = currentToken.startsWith("@")
    ? "mention"
    : currentToken.startsWith("/")
      ? "command"
      : null;
  const mentionQuery = suggestionMode === "mention" ? currentToken.slice(1).toLowerCase() : "";
  const commandQuery = suggestionMode === "command" ? currentToken.slice(1).toLowerCase() : "";
  const mentionSuggestions = normalizedTargets.filter(
    (candidate) =>
      candidate.target.toLowerCase().includes(mentionQuery) ||
      candidate.label.toLowerCase().includes(mentionQuery),
  );
  const commandSuggestions = SLASH_COMMANDS.filter((command) =>
    command.label.slice(1).includes(commandQuery),
  );

  React.useEffect(() => {
    setTarget(props.selectedTarget);
  }, [props.selectedTarget]);
  React.useEffect(() => {
    if (!activeClaudeCodeControls) {
      return;
    }
    setPermissionPreset(activeClaudeCodeControls.permissionPreset);
    setRuntimeProfileId(activeClaudeCodeControls.runtimeProfileId);
    setMcpProfileId(activeClaudeCodeControls.mcpProfileId);
    setPluginProfileId(activeClaudeCodeControls.pluginProfileId ?? "default");
    setEffort(activeClaudeCodeControls.effort);
    setSessionBehavior(activeClaudeCodeControls.sessionBehavior);
    setSessionId(activeClaudeCodeControls.sessionId ?? "");
    setSettingsSource(activeClaudeCodeControls.settingsSource);
    setHooksPolicy(activeClaudeCodeControls.hooksPolicy);
    setAllowedToolsText(activeClaudeCodeControls.allowedTools?.join(", ") ?? "");
    setDisallowedToolsText(activeClaudeCodeControls.disallowedTools?.join(", ") ?? "");
    setFullAccessConfirmed(false);
  }, [activeClaudeCodeControls]);

  React.useEffect(() => {
    if (permissionPreset !== "full-access") {
      setFullAccessConfirmed(false);
    }
  }, [permissionPreset]);

  const updateMultilineState = React.useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) {
      setIsMultiline(message.includes("\n") || message.length > 56);
      return;
    }
    const styles = window.getComputedStyle(textarea);
    const lineHeight = Number.parseFloat(styles.lineHeight) || 22;
    const paddingTop = Number.parseFloat(styles.paddingTop) || 0;
    const paddingBottom = Number.parseFloat(styles.paddingBottom) || 0;
    const contentHeight = Math.max(0, textarea.scrollHeight - paddingTop - paddingBottom);
    const visualRows = Math.round(contentHeight / lineHeight);
    setIsMultiline(message.includes("\n") || visualRows > 1);
  }, [message]);

  const replaceCurrentToken = (replacement: string) => {
    setMessage((current) =>
      current.replace(/(?:^|\s)([@/][^\s]*)$/, (match) => {
        const prefix = match.startsWith(" ") ? " " : "";
        return `${prefix}${replacement} `;
      }),
    );
  };
  React.useEffect(() => {
    updateMultilineState();
    window.addEventListener("resize", updateMultilineState);
    return () => window.removeEventListener("resize", updateMultilineState);
  }, [updateMultilineState]);
  const sendMessage = React.useCallback(() => {
    if (!message.trim() || props.disabled || !selected) {
      return;
    }
    if (activeClaudeCodeControls && permissionPreset === "full-access" && !fullAccessConfirmed) {
      return;
    }
    const parseToolList = (value: string) =>
      value
        .split(",")
        .map((tool) => tool.trim())
        .filter(Boolean);
    const allowedTools = parseToolList(allowedToolsText);
    const disallowedTools = parseToolList(disallowedToolsText);
    props.onSend?.(
      message.trim(),
      selected.target,
      activeClaudeCodeControls
        ? {
            ...activeClaudeCodeControls,
            permissionPreset,
            runtimeProfileId,
            mcpProfileId,
            pluginProfileId,
            effort,
            sessionBehavior,
            sessionId: sessionId.trim() || null,
            settingsSource,
            hooksPolicy,
            allowedTools,
            disallowedTools,
          }
        : undefined,
    );
    setMessage("");
    setFullAccessConfirmed(false);
  }, [
    allowedToolsText,
    activeClaudeCodeControls,
    disallowedToolsText,
    effort,
    fullAccessConfirmed,
    hooksPolicy,
    mcpProfileId,
    message,
    permissionPreset,
    pluginProfileId,
    props,
    runtimeProfileId,
    selected,
    sessionBehavior,
    sessionId,
    settingsSource,
  ]);

  return (
    <form
      aria-label="Message composer"
      className="agenthub-composer"
      onSubmit={(event) => {
        event.preventDefault();
        sendMessage();
      }}
    >
      <motion.div
        className="agenthub-composer-box"
        data-multiline={isMultiline ? "true" : "false"}
        layout
        transition={{ duration: 0.2, ease: [0.2, 0.8, 0.2, 1] }}
      >
        <AnimatePresence>
          {suggestionMode ? (
            <motion.div
              aria-label={i18n.t("composer.suggestions", { fallback: "Composer suggestions" })}
              className="agenthub-composer-suggestions"
              exit={{ opacity: 0, y: 6, scale: 0.98 }}
              initial={{ opacity: 0, y: 6, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.16, ease: [0.2, 0.8, 0.2, 1] }}
            >
              {suggestionMode === "mention"
                ? mentionSuggestions.map((candidate) => (
                    <AgentHubButton
                      className="agenthub-composer-suggestion"
                      htmlType="button"
                      key={candidate.id}
                      onClick={() => {
                        setTarget(candidate.target);
                        replaceCurrentToken(candidate.target);
                      }}
                    >
                      <span>{candidate.target}</span>
                      <small>{candidate.providerLabel}</small>
                    </AgentHubButton>
                  ))
                : commandSuggestions.map((command) => (
                    <AgentHubButton
                      className="agenthub-composer-suggestion"
                      htmlType="button"
                      key={command.id}
                      onClick={() => {
                        const nextTarget = command.id === "plan" ? planTarget : directTarget;
                        if (nextTarget) {
                          setTarget(nextTarget.target);
                        }
                        replaceCurrentToken(command.label);
                      }}
                    >
                      <span>{command.label}</span>
                      <small>
                        {command.id === "plan"
                          ? i18n.t("composer.commandPlan", { fallback: command.description })
                          : i18n.t("composer.commandDirect", { fallback: command.description })}
                      </small>
                    </AgentHubButton>
                  ))}
            </motion.div>
          ) : null}
        </AnimatePresence>
        <AgentHubTextArea
          autoSize={{ maxRows: 5, minRows: 1 }}
          aria-describedby={props.disabled ? "agenthub-composer-disabled-reason" : undefined}
          aria-label={i18n.t("composer.messageAgent", {
            fallback: `Message ${selected?.target ?? ""}`,
            target: selected?.target ?? "",
          })}
          ref={textareaRef}
          onChange={(event) => setMessage(event.currentTarget.value)}
          onKeyDown={(event) => {
            if (
              (props.enterToSend ?? true) &&
              event.key === "Enter" &&
              !event.shiftKey &&
              !event.nativeEvent.isComposing
            ) {
              event.preventDefault();
              sendMessage();
            }
          }}
          placeholder={
            props.disabled
              ? i18n.t("composer.offline", { fallback: "Runtime offline" })
              : i18n.t("composer.placeholder", {
                  fallback: "Message an agent, @mention or /command",
                })
          }
          rows={1}
          value={message}
          variant="borderless"
        />
        {props.disabled ? (
          <span className="agenthub-warning" id="agenthub-composer-disabled-reason">
            {props.disabledReason ??
              i18n.t("composer.disabledReason", {
                fallback: "Desktop Runtime must be online before sending.",
              })}
          </span>
        ) : null}
        <div className="agenthub-composer-actions">
          <AgentHubButton
            aria-label="Add attachment"
            className="agenthub-composer-icon-action"
            disabled
            htmlType="button"
          >
            <Icon icon={Plus} />
          </AgentHubButton>
          {activeClaudeCodeControls ? (
            <>
              <span
                className="agenthub-composer-inline-select"
                data-tone={permissionPreset === "full-access" ? "danger" : "default"}
              >
                <Icon icon={ShieldAlert} />
                <AgentHubSelect
                  ariaLabel="Permission"
                  value={permissionPreset}
                  onValueChange={setPermissionPreset}
                  options={[
                    { label: "Plan only", value: "plan-only" },
                    { label: "Ask first", value: "ask-first" },
                    { label: "Auto edits", value: "auto-edits" },
                    { label: "Full access", value: "full-access" },
                  ]}
                />
              </span>
              {permissionPreset === "full-access" ? (
                <label className="agenthub-composer-risk-confirmation">
                  <AgentHubCheckbox
                    checked={fullAccessConfirmed}
                    onCheckedChange={setFullAccessConfirmed}
                  />
                  <span>Confirm</span>
                </label>
              ) : null}
              <span className="agenthub-composer-inline-select">
                <Icon icon={Zap} />
                <AgentHubSelect
                  ariaLabel="Effort"
                  value={effort}
                  onValueChange={setEffort}
                  options={[
                    { label: "Low", value: "low" },
                    { label: "Medium", value: "medium" },
                    { label: "High", value: "high" },
                    { label: "XHigh", value: "xhigh" },
                  ]}
                />
              </span>
            </>
          ) : selected?.runtimeProvider === "codex" ? (
            <span className="agenthub-composer-runtime-pill">Codex soon</span>
          ) : null}
          <AgentHubButton
            aria-label="Voice input"
            className="agenthub-composer-icon-action"
            disabled
            htmlType="button"
          >
            <Icon icon={Mic} />
          </AgentHubButton>
          <AgentHubButton
            aria-label={i18n.t("actions.sendMessage", { fallback: "Send message" })}
            className="agenthub-composer-send"
            disabled={
              props.disabled ||
              !message.trim() ||
              Boolean(
                activeClaudeCodeControls &&
                  permissionPreset === "full-access" &&
                  !fullAccessConfirmed,
              )
            }
            htmlType="submit"
          >
            <Icon icon={Send} />
          </AgentHubButton>
        </div>
      </motion.div>
    </form>
  );
}

export type ComposerAgentRole = Agent["role"];

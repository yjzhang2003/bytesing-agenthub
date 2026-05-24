import type { Agent } from "@agenthub/contracts";
import { Send } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import React from "react";
import type { AgentHubLocale } from "../i18n.js";
import { useAgentHubI18n } from "../i18n.js";
import type { AgentTargetViewModel } from "../types.js";
import { AgentHubButton, AgentHubTextArea } from "./system.js";
import { Icon } from "./primitives.js";

const SLASH_COMMANDS = [
  { id: "plan", label: "/plan", description: "Plan with the orchestrator" },
  { id: "direct", label: "/direct", description: "Send a direct agent message" },
] as const;

export function AgentMentionComposer(props: {
  readonly targets: readonly AgentTargetViewModel[] | readonly string[];
  readonly selectedTarget: string;
  readonly disabled?: boolean;
  readonly disabledReason?: string | null;
  readonly enterToSend?: boolean;
  readonly locale?: AgentHubLocale | undefined;
  readonly modeLabel?: string;
  readonly onSend?: (message: string, target: string) => void;
}): React.ReactElement {
  const i18n = useAgentHubI18n(props.locale);
  const normalizedTargets = props.targets.map((target) =>
    typeof target === "string"
      ? {
          capabilityTags: [],
          id: target,
          label: target.replace(/^@/, ""),
          providerLabel: "Unknown provider",
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
  const textareaRef = React.useRef<HTMLTextAreaElement | null>(null);
  const selected =
    normalizedTargets.find((candidate) => candidate.target === target) ?? normalizedTargets[0];
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
    props.onSend?.(message.trim(), selected.target);
    setMessage("");
  }, [message, props, selected]);

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
            aria-label={i18n.t("actions.sendMessage", { fallback: "Send message" })}
            className="agenthub-composer-send"
            disabled={props.disabled || !message.trim()}
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

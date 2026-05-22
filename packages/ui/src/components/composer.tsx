import type { Agent } from "@agenthub/contracts";
import { Send } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import React from "react";
import type { AgentTargetViewModel } from "../types.js";
import { HoverButton, Icon } from "./primitives.js";

const SLASH_COMMANDS = [
  { id: "plan", label: "/plan", description: "Plan with the orchestrator" },
  { id: "direct", label: "/direct", description: "Send a direct agent message" },
] as const;

export function AgentMentionComposer(props: {
  readonly targets: readonly AgentTargetViewModel[] | readonly string[];
  readonly selectedTarget: string;
  readonly disabled?: boolean;
  readonly disabledReason?: string | null;
  readonly modeLabel?: string;
  readonly onSend?: (message: string, target: string) => void;
}): React.ReactElement {
  const normalizedTargets = props.targets.map((target) =>
    typeof target === "string"
      ? {
          capabilityTags: [],
          id: target,
          label: target.replace(/^@/, ""),
          providerLabel: "Unknown provider",
          role: target.toLowerCase().includes("orchestrator") ? ("orchestrator" as const) : ("worker" as const),
          target,
        }
      : target,
  );
  const [message, setMessage] = React.useState("");
  const [target, setTarget] = React.useState(props.selectedTarget);
  const [isMultiline, setIsMultiline] = React.useState(false);
  const textareaRef = React.useRef<HTMLTextAreaElement | null>(null);
  const selected = normalizedTargets.find((candidate) => candidate.target === target) ?? normalizedTargets[0];
  const planTarget = normalizedTargets.find((candidate) => candidate.role === "orchestrator") ?? selected;
  const directTarget = normalizedTargets.find((candidate) => candidate.role !== "orchestrator") ?? selected;
  const currentToken = message.match(/(?:^|\s)([@/][^\s]*)$/)?.[1] ?? "";
  const suggestionMode = currentToken.startsWith("@") ? "mention" : currentToken.startsWith("/") ? "command" : null;
  const mentionQuery = suggestionMode === "mention" ? currentToken.slice(1).toLowerCase() : "";
  const commandQuery = suggestionMode === "command" ? currentToken.slice(1).toLowerCase() : "";
  const mentionSuggestions = normalizedTargets.filter((candidate) =>
    candidate.target.toLowerCase().includes(mentionQuery) || candidate.label.toLowerCase().includes(mentionQuery),
  );
  const commandSuggestions = SLASH_COMMANDS.filter((command) => command.label.slice(1).includes(commandQuery));

  const replaceCurrentToken = (replacement: string) => {
    setMessage((current) =>
      current.replace(/(?:^|\s)([@/][^\s]*)$/, (match) => {
        const prefix = match.startsWith(" ") ? " " : "";
        return `${prefix}${replacement} `;
      }),
    );
  };
  React.useLayoutEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) {
      return;
    }
    textarea.style.height = "auto";
    const style = window.getComputedStyle(textarea);
    const lineHeight = Number.parseFloat(style.lineHeight);
    const verticalPadding = Number.parseFloat(style.paddingTop) + Number.parseFloat(style.paddingBottom);
    const singleLineHeight = lineHeight + verticalPadding;
    const nextHeight = Math.min(textarea.scrollHeight, 128);
    const measuredLines = Math.round((textarea.scrollHeight - verticalPadding) / lineHeight);
    textarea.style.height = `${Math.max(nextHeight, singleLineHeight)}px`;
    setIsMultiline(message.includes("\n") || measuredLines > 1);
  }, [message]);

  return (
    <form
      aria-label="Message composer"
      className="agenthub-composer"
      onSubmit={(event) => {
        event.preventDefault();
        if (!message.trim() || props.disabled || !selected) {
          return;
        }
        props.onSend?.(message.trim(), selected.target);
        setMessage("");
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
              aria-label="Composer suggestions"
              className="agenthub-composer-suggestions"
              exit={{ opacity: 0, y: 6, scale: 0.98 }}
              initial={{ opacity: 0, y: 6, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.16, ease: [0.2, 0.8, 0.2, 1] }}
            >
              {suggestionMode === "mention"
                ? mentionSuggestions.map((candidate) => (
                    <HoverButton
                      className="agenthub-composer-suggestion"
                      key={candidate.id}
                      onClick={() => {
                        setTarget(candidate.target);
                        replaceCurrentToken(candidate.target);
                      }}
                      type="button"
                    >
                      <span>{candidate.target}</span>
                      <small>{candidate.providerLabel}</small>
                    </HoverButton>
                  ))
                : commandSuggestions.map((command) => (
                    <HoverButton
                      className="agenthub-composer-suggestion"
                      key={command.id}
                      onClick={() => {
                        const nextTarget = command.id === "plan" ? planTarget : directTarget;
                        if (nextTarget) {
                          setTarget(nextTarget.target);
                        }
                        replaceCurrentToken(command.label);
                      }}
                      type="button"
                    >
                      <span>{command.label}</span>
                      <small>{command.description}</small>
                    </HoverButton>
                  ))}
            </motion.div>
          ) : null}
        </AnimatePresence>
        <textarea
          aria-describedby={props.disabled ? "agenthub-composer-disabled-reason" : undefined}
          aria-label={`Message ${selected?.target ?? ""}`}
          disabled={props.disabled}
          ref={textareaRef}
          onChange={(event) => setMessage(event.currentTarget.value)}
          placeholder={props.disabled ? "Runtime offline" : "Message an agent, @mention or /command"}
          rows={1}
          value={message}
        />
        {props.disabled ? (
          <span className="agenthub-warning" id="agenthub-composer-disabled-reason">
            {props.disabledReason ?? "Desktop Runtime must be online before sending."}
          </span>
        ) : null}
        <div className="agenthub-composer-actions">
          <HoverButton
            aria-label="Send message"
            className="agenthub-composer-send"
            disabled={props.disabled || !message.trim()}
            type="submit"
          >
            <Icon icon={Send} />
          </HoverButton>
        </div>
      </motion.div>
    </form>
  );
}

export type ComposerAgentRole = Agent["role"];

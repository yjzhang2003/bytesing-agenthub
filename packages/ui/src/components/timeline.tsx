import React from "react";
import { lexer, type Token, type Tokens } from "marked";
import { useAgentHubI18n } from "../i18n.js";
import type { InspectorSelection, TimelineItemViewModel } from "../types.js";
import { HoverButton } from "./primitives.js";

function agentInitials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function safeHref(href: string): string | undefined {
  if (/^(https?:|mailto:)/i.test(href)) {
    return href;
  }
  return undefined;
}

function renderInline(tokens: readonly Token[] | undefined, keyPrefix: string): React.ReactNode {
  if (!tokens) {
    return null;
  }
  return tokens.map((token, index) => {
    const key = `${keyPrefix}-${index}`;
    switch (token.type) {
      case "strong":
        return <strong key={key}>{renderInline((token as Tokens.Strong).tokens, key)}</strong>;
      case "em":
        return <em key={key}>{renderInline((token as Tokens.Em).tokens, key)}</em>;
      case "codespan":
        return <code key={key}>{(token as Tokens.Codespan).text}</code>;
      case "br":
        return <br key={key} />;
      case "del":
        return <del key={key}>{renderInline((token as Tokens.Del).tokens, key)}</del>;
      case "link": {
        const link = token as Tokens.Link;
        const href = safeHref(link.href);
        if (!href) {
          return <React.Fragment key={key}>{renderInline(link.tokens, key)}</React.Fragment>;
        }
        return (
          <a href={href} key={key} rel="noreferrer" target="_blank" title={link.title ?? undefined}>
            {renderInline(link.tokens, key)}
          </a>
        );
      }
      case "image":
        return <span key={key}>{(token as Tokens.Image).text}</span>;
      case "html":
        return null;
      case "escape":
      case "text": {
        const textToken = token as Tokens.Text | Tokens.Escape;
        if ("tokens" in textToken && textToken.tokens) {
          return <React.Fragment key={key}>{renderInline(textToken.tokens, key)}</React.Fragment>;
        }
        return <React.Fragment key={key}>{textToken.text}</React.Fragment>;
      }
      default:
        return "text" in token ? (
          <React.Fragment key={key}>{String(token.text)}</React.Fragment>
        ) : null;
    }
  });
}

function renderBlocks(tokens: readonly Token[], keyPrefix = "md"): React.ReactNode {
  return tokens.map((token, index) => {
    const key = `${keyPrefix}-${index}`;
    switch (token.type) {
      case "space":
      case "html":
      case "def":
        return null;
      case "heading": {
        const heading = token as Tokens.Heading;
        const Tag = `h${Math.min(4, Math.max(1, heading.depth))}` as "h1" | "h2" | "h3" | "h4";
        return <Tag key={key}>{renderInline(heading.tokens, key)}</Tag>;
      }
      case "paragraph": {
        const paragraph = token as Tokens.Paragraph;
        return <p key={key}>{renderInline(paragraph.tokens, key)}</p>;
      }
      case "text": {
        const text = token as Tokens.Text;
        return <p key={key}>{renderInline(text.tokens ?? [text], key)}</p>;
      }
      case "code": {
        const code = token as Tokens.Code;
        return (
          <pre key={key}>
            <code>{code.text}</code>
          </pre>
        );
      }
      case "blockquote": {
        const quote = token as Tokens.Blockquote;
        return <blockquote key={key}>{renderBlocks(quote.tokens, key)}</blockquote>;
      }
      case "hr":
        return <hr key={key} />;
      case "list": {
        const list = token as Tokens.List;
        const ListTag = list.ordered ? "ol" : "ul";
        return (
          <ListTag
            key={key}
            start={list.ordered && typeof list.start === "number" ? list.start : undefined}
          >
            {list.items.map((item, itemIndex) => (
              <li key={`${key}-item-${itemIndex}`}>
                {item.task ? (
                  <input checked={Boolean(item.checked)} disabled readOnly type="checkbox" />
                ) : null}
                {renderBlocks(item.tokens, `${key}-item-${itemIndex}`)}
              </li>
            ))}
          </ListTag>
        );
      }
      case "table": {
        const table = token as Tokens.Table;
        return (
          <div className="agenthub-markdown-table" key={key}>
            <table>
              <thead>
                <tr>
                  {table.header.map((cell, cellIndex) => (
                    <th key={`${key}-head-${cellIndex}`}>
                      {renderInline(cell.tokens, `${key}-head-${cellIndex}`)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {table.rows.map((row, rowIndex) => (
                  <tr key={`${key}-row-${rowIndex}`}>
                    {row.map((cell, cellIndex) => (
                      <td key={`${key}-row-${rowIndex}-${cellIndex}`}>
                        {renderInline(cell.tokens, `${key}-row-${rowIndex}-${cellIndex}`)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      }
      default:
        return null;
    }
  });
}

function MarkdownContent(props: { readonly body: readonly string[] }): React.ReactElement {
  const source = props.body.join("\n");
  const tokens = lexer(source, { gfm: true });
  return <div className="agenthub-markdown">{renderBlocks(tokens)}</div>;
}

function isProviderAuthText(value: string): boolean {
  return /not logged in|please run \/login|run \/login/iu.test(value);
}

function isHiddenProviderMessage(item: TimelineItemViewModel): boolean {
  return item.kind === "message" && item.authorKind === "agent" && item.body.some(isProviderAuthText);
}

function MessageBubble(props: {
  readonly item: TimelineItemViewModel;
  readonly onOpenAgent?: (agentId: string) => void;
}): React.ReactElement {
  const i18n = useAgentHubI18n();
  const author = props.item.authorKind ?? "system";
  const canOpenAgent = author === "agent" && props.item.authorId;
  return (
    <article className="agenthub-message-row" data-author={author}>
      <span aria-hidden="true" className="agenthub-message-avatar">
        {agentInitials(props.item.title) || "A"}
      </span>
      <div className="agenthub-message-content">
        {canOpenAgent ? (
          <HoverButton
            aria-label={i18n.t("agents.openAgent", { agent: props.item.title })}
            className="agenthub-message-meta agenthub-message-agent-link"
            onClick={() => props.onOpenAgent?.(props.item.authorId ?? "")}
            type="button"
          >
            <strong>{props.item.title}</strong>
          </HoverButton>
        ) : (
          <div className="agenthub-message-meta">
            <strong>{props.item.title}</strong>
          </div>
        )}
        <div className="agenthub-message-bubble" data-author={author}>
          {props.item.state === "loading" ? (
            <StatusWordTicker label={`${props.item.title} is working`} />
          ) : null}
          {props.item.body.length > 0 ? <MarkdownContent body={props.item.body} /> : null}
        </div>
      </div>
    </article>
  );
}

const statusWords = [
  "Absorbing",
  "Analyzing",
  "Building",
  "Compiling",
  "Composing",
  "Computing",
  "Diagnosing",
  "Generating",
  "Inferring",
  "Optimizing",
  "Processing",
  "Synthesizing",
] as const;

function StatusWordTicker(props: { readonly label: string }): React.ReactElement {
  const statusWord = React.useMemo(
    () => statusWords[Math.floor(Math.random() * statusWords.length)] ?? statusWords[0],
    [],
  );
  return (
    <span aria-label={props.label} className="agenthub-message-status-ticker" role="status">
      <span className="agenthub-message-status-word">{statusWord}</span>
      <span aria-hidden="true" className="agenthub-message-status-dots">
        <span className="agenthub-message-status-dot" />
        <span className="agenthub-message-status-dot" />
        <span className="agenthub-message-status-dot" />
      </span>
    </span>
  );
}

function EventPill(props: { readonly item: TimelineItemViewModel }): React.ReactElement {
  return (
    <span className="agenthub-event-pill" data-state={props.item.state}>
      <strong>{props.item.title}</strong>
      <span>{props.item.subtitle}</span>
    </span>
  );
}

function CompactTimelineCard(props: {
  readonly item: TimelineItemViewModel;
  readonly selected?: boolean;
  readonly onSelect?: (selection: InspectorSelection) => void;
}): React.ReactElement {
  const disabled = !props.item.inspectorSelection;
  return (
    <HoverButton
      aria-pressed={props.selected}
      className="agenthub-compact-timeline-card"
      data-kind={props.item.kind}
      data-state={props.item.state}
      disabled={disabled}
      onClick={() => {
        if (props.item.inspectorSelection) {
          props.onSelect?.(props.item.inspectorSelection);
        }
      }}
      type="button"
    >
      <span className="agenthub-row-main">{props.item.title}</span>
      <small>{props.item.subtitle}</small>
      {props.item.body.map((line, index) => (
        <span className="agenthub-timeline-line" key={index}>
          {line}
        </span>
      ))}
    </HoverButton>
  );
}

export function ChatTimeline(props: {
  readonly items: readonly TimelineItemViewModel[] | readonly React.ReactNode[];
  readonly selected?: InspectorSelection | null;
  readonly onSelect?: (selection: InspectorSelection) => void;
  readonly onOpenAgent?: (agentId: string) => void;
}): React.ReactElement {
  const i18n = useAgentHubI18n();
  const timelineRef = React.useRef<HTMLOListElement | null>(null);
  const first = props.items[0];
  const viewModelItems =
    first && typeof first === "object" && "kind" in first
      ? (props.items as readonly TimelineItemViewModel[])
      : null;
  const scrollKey = viewModelItems
    ? viewModelItems
        .map((item) => `${item.id}:${item.state}:${item.body.join("\u0000")}`)
        .join("\u0001")
    : props.items.length.toString();

  React.useLayoutEffect(() => {
    const timeline = timelineRef.current;
    if (!timeline) {
      return;
    }
    const scrollToBottom = () => {
      timeline.scrollTop = timeline.scrollHeight;
    };
    scrollToBottom();
    const frame = window.requestAnimationFrame(scrollToBottom);
    return () => window.cancelAnimationFrame(frame);
  }, [scrollKey]);

  if (!viewModelItems) {
    return (
      <ol
        aria-label={i18n.t("nav.conversationTimeline")}
        className="agenthub-chat-thread"
        ref={timelineRef}
      >
        {(props.items as readonly React.ReactNode[]).map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ol>
    );
  }

  return (
    <ol
      aria-label={i18n.t("nav.conversationTimeline")}
      className="agenthub-chat-thread"
      ref={timelineRef}
    >
      {viewModelItems.filter((item) => !isHiddenProviderMessage(item)).map((item) => (
        <li key={item.id} data-kind={item.kind}>
          {item.kind === "message" ? (
            <MessageBubble
              item={item}
              {...(props.onOpenAgent ? { onOpenAgent: props.onOpenAgent } : {})}
            />
          ) : item.kind === "run-event" || item.kind === "summary" || item.kind === "empty" ? (
            item.inspectorSelection ? (
              <CompactTimelineCard
                item={item}
                {...(props.onSelect ? { onSelect: props.onSelect } : {})}
                selected={props.selected?.id === item.id}
              />
            ) : (
              <EventPill item={item} />
            )
          ) : (
            <CompactTimelineCard
              item={item}
              {...(props.onSelect ? { onSelect: props.onSelect } : {})}
              selected={props.selected?.id === item.id}
            />
          )}
        </li>
      ))}
    </ol>
  );
}

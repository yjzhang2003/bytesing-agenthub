import React from "react";
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

function MessageBubble(props: {
  readonly item: TimelineItemViewModel;
  readonly onOpenAgent?: (agentId: string) => void;
}): React.ReactElement {
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
            aria-label={`Open ${props.item.title} agent`}
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
          {props.item.body.map((line, index) => (
            <p key={index}>{line}</p>
          ))}
        </div>
      </div>
    </article>
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
  const first = props.items[0];
  const viewModelItems =
    first && typeof first === "object" && "kind" in first ? (props.items as readonly TimelineItemViewModel[]) : null;

  if (!viewModelItems) {
    return (
      <ol aria-label="Conversation timeline" className="agenthub-chat-thread">
        {(props.items as readonly React.ReactNode[]).map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ol>
    );
  }

  return (
    <ol aria-label="Conversation timeline" className="agenthub-chat-thread">
      {viewModelItems.map((item) => (
        <li key={item.id} data-kind={item.kind}>
          {item.kind === "message" ? (
            <MessageBubble item={item} {...(props.onOpenAgent ? { onOpenAgent: props.onOpenAgent } : {})} />
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

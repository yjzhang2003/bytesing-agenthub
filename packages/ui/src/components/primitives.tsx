import type { RuntimeDeviceStatus } from "@agenthub/contracts";
import type { LucideIcon } from "lucide-react";
import React from "react";
import { useAgentHubI18n } from "../i18n.js";

export type IconComponent = LucideIcon;

export function Icon(props: { readonly icon: IconComponent }): React.ReactElement {
  const Component = props.icon;
  return <Component aria-hidden="true" className="agenthub-icon" />;
}

export function RuntimeStatusBadge(props: {
  readonly status: RuntimeDeviceStatus;
  readonly label?: string;
}): React.ReactElement {
  const i18n = useAgentHubI18n();
  return (
    <span
      className="agenthub-status-badge"
      data-status={props.status}
      aria-label={i18n.t("connections.statusRuntime", {
        fallback: `Runtime ${props.status}`,
        status: props.status,
      })}
    >
      <span aria-hidden="true" className="agenthub-status-dot" />
      {props.label ?? props.status}
    </span>
  );
}

export function ParticipantChip(props: { readonly label: string }): React.ReactElement {
  return <span className="agenthub-participant-chip">{props.label}</span>;
}

export function DetailSection(props: {
  readonly title: string;
  readonly children: React.ReactNode;
}): React.ReactElement {
  return (
    <section className="agenthub-detail-section">
      <h4>{props.title}</h4>
      {props.children}
    </section>
  );
}

export function HoverButton(
  props: React.ButtonHTMLAttributes<HTMLButtonElement> & {
    readonly children: React.ReactNode;
    readonly className?: string;
  },
): React.ReactElement {
  const { className, ...buttonProps } = props;
  return (
    <button
      className={["agenthub-hover-control", className].filter(Boolean).join(" ")}
      {...buttonProps}
    />
  );
}

import type {
  DiffFileSummary,
  PermissionRisk,
  PermissionStatus,
  PlanStatus,
} from "@agenthub/contracts";
import React from "react";
import { useAgentHubI18n } from "../i18n.js";
import { HoverButton } from "./primitives.js";

export function PlanCard(props: {
  readonly title: string;
  readonly status: PlanStatus;
  readonly agents: readonly string[];
}): React.ReactElement {
  const i18n = useAgentHubI18n();
  return (
    <article
      aria-label={i18n.t("cards.planStatus", { fallback: `Plan ${props.status}`, status: props.status })}
      className="agenthub-card agenthub-plan-card"
    >
      <header>
        <strong>{props.title}</strong>
        <span>{props.status}</span>
      </header>
      <p>{props.agents.join(" -> ")}</p>
      <footer>
        <HoverButton type="button">{i18n.t("actions.approve")}</HoverButton>
        <HoverButton type="button">{i18n.t("actions.revise")}</HoverButton>
        <HoverButton type="button">{i18n.t("actions.cancel")}</HoverButton>
      </footer>
    </article>
  );
}

export function PermissionCard(props: {
  readonly summary: string;
  readonly risk: PermissionRisk;
  readonly status: PermissionStatus;
}): React.ReactElement {
  const i18n = useAgentHubI18n();
  return (
    <article
      aria-label={i18n.t("cards.permissionStatus", {
        fallback: `Permission ${props.status}`,
        status: props.status,
      })}
      className="agenthub-card agenthub-permission-card"
    >
      <header>
        <strong>{props.summary}</strong>
        <span>{props.risk}</span>
      </header>
      <p>{props.status}</p>
      {props.status === "pending" ? (
        <footer>
          <HoverButton type="button">{i18n.t("actions.allowOnce")}</HoverButton>
          <HoverButton type="button">{i18n.t("actions.deny")}</HoverButton>
        </footer>
      ) : null}
    </article>
  );
}

export function DiffCard(props: {
  readonly files: readonly DiffFileSummary[];
  readonly state:
    | "metadata-only"
    | "loading-full-diff"
    | "available"
    | "offline"
    | "stale"
    | "cached"
    | "error";
}): React.ReactElement {
  const i18n = useAgentHubI18n();
  const insertions = props.files.reduce((sum, file) => sum + file.insertions, 0);
  const deletions = props.files.reduce((sum, file) => sum + file.deletions, 0);
  return (
    <article
      aria-label={i18n.t("cards.diffStatus", { fallback: `Diff ${props.state}`, status: props.state })}
      className="agenthub-card agenthub-diff-card"
    >
      <header>
        <strong>
          {i18n.t("cards.filesChanged", {
            count: props.files.length,
            fallback: `${props.files.length} files changed`,
          })}
        </strong>
        <span>{props.state}</span>
      </header>
      <p>
        +{insertions} -{deletions}
      </p>
      <HoverButton type="button">{i18n.t("actions.openReview")}</HoverButton>
    </article>
  );
}

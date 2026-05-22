import { PanelRightClose } from "lucide-react";
import React from "react";
import type {
  ArtifactViewModel,
  DiffViewModel,
  InspectorSelection,
  PermissionViewModel,
  PlanViewModel,
  RunViewModel,
  RuntimeSummaryViewModel,
  WorkbenchViewModel,
} from "../types.js";
import { normalizeSelection } from "../view-model.js";
import { DetailSection, HoverButton, Icon, RuntimeStatusBadge } from "./primitives.js";

export function ContextInspector(props: {
  readonly model: WorkbenchViewModel;
  readonly selection: InspectorSelection | null;
  readonly onSelect: (selection: InspectorSelection | null) => void;
  readonly onOpenFullScreenDiff: () => void;
  readonly collapsed: boolean;
  readonly onToggleCollapsed: () => void;
}): React.ReactElement {
  const selection = normalizeSelection(props.selection, {
    artifacts: props.model.inspector.artifacts,
    diff: props.model.inspector.diff,
    permissions: props.model.inspector.permissions,
    plan: props.model.inspector.plan,
    runs: props.model.inspector.runs,
  });

  return (
    <aside aria-label="Conversation details" className="agenthub-inspector">
      <header>
        <strong>Conversation details</strong>
        <div className="agenthub-header-actions">
          {selection ? (
            <HoverButton onClick={() => props.onSelect(null)} type="button">
              Clear
            </HoverButton>
          ) : null}
          <HoverButton
            aria-label={props.collapsed ? "Expand Context Inspector" : "Collapse Context Inspector"}
            className="agenthub-icon-button"
            onClick={props.onToggleCollapsed}
            type="button"
          >
            <Icon icon={PanelRightClose} />
          </HoverButton>
        </div>
      </header>
      {renderInspectorBody(props.model, selection, props.onSelect, props.onOpenFullScreenDiff)}
    </aside>
  );
}

function renderInspectorBody(
  model: WorkbenchViewModel,
  selection: InspectorSelection | null,
  onSelect: (selection: InspectorSelection | null) => void,
  onOpenFullScreenDiff: () => void,
): React.ReactNode {
  if (!selection) {
    return (
      <div className="agenthub-inspector-body">
        <h3>{model.activeConversationTitle}</h3>
        <p className="agenthub-muted">{model.workspace.workspaceName}</p>
        <p>{model.runtime.explanation}</p>
        <HoverButton onClick={() => onSelect({ id: "runtime", mode: "runtime" })} type="button">
          Runtime details
        </HoverButton>
      </div>
    );
  }

  if (selection.mode === "runtime") {
    return <RuntimeDetail runtime={model.runtime} />;
  }

  if (selection.mode === "plan") {
    const plan = model.inspector.plan;
    return plan ? <PlanDetail plan={plan} /> : <UnavailableDetail label="Plan unavailable" />;
  }

  if (selection.mode === "permission") {
    const permission = model.inspector.permissions.find((candidate) => candidate.id === selection.id);
    return permission ? <PermissionDetail permission={permission} /> : <UnavailableDetail label="Permission unavailable" />;
  }

  if (selection.mode === "diff") {
    const diff = model.inspector.diff;
    return diff ? <DiffDetail diff={diff} onOpenFullScreen={onOpenFullScreenDiff} /> : <UnavailableDetail label="Diff unavailable" />;
  }

  if (selection.mode === "artifact") {
    const artifact = model.inspector.artifacts.find((candidate) => candidate.id === selection.id);
    return artifact ? <ArtifactDetail artifact={artifact} /> : <UnavailableDetail label="Artifact unavailable" />;
  }

  const run = model.inspector.runs.find((candidate) => candidate.id === selection.id);
  return run ? <RunDetail run={run} /> : <UnavailableDetail label="Run unavailable" />;
}

function UnavailableDetail(props: { readonly label: string }): React.ReactElement {
  return (
    <div className="agenthub-inspector-body" data-state="unavailable">
      <h3>{props.label}</h3>
      <p>The selected item is no longer available in the latest snapshot.</p>
    </div>
  );
}

function PlanDetail(props: { readonly plan: PlanViewModel }): React.ReactElement {
  return (
    <div className="agenthub-inspector-body">
      <h3>{props.plan.title}</h3>
      <RuntimeStatusBadge status={props.plan.status === "failed" ? "degraded" : "online"} label={props.plan.status} />
      <DetailSection title="Goal">
        <p>{props.plan.goal}</p>
      </DetailSection>
      <DetailSection title="Assumptions">
        <ul>{props.plan.assumptions.map((item) => <li key={item}>{item}</li>)}</ul>
      </DetailSection>
      <DetailSection title="Steps">
        <ol>
          {props.plan.steps.map((step) => (
            <li key={step.id}>
              <strong>{step.title}</strong>
              <p>{step.assignedAgent}</p>
              {step.risks.length > 0 ? <small>{step.risks.join(", ")}</small> : null}
            </li>
          ))}
        </ol>
      </DetailSection>
      <DetailSection title="Actions">
        <div className="agenthub-action-row">
          <HoverButton type="button">Approve</HoverButton>
          <HoverButton type="button">Ask to revise</HoverButton>
          <HoverButton type="button">Cancel plan</HoverButton>
        </div>
      </DetailSection>
    </div>
  );
}

function PermissionDetail(props: { readonly permission: PermissionViewModel }): React.ReactElement {
  return (
    <div className="agenthub-inspector-body">
      <h3>{props.permission.summary}</h3>
      <p>{props.permission.requestingAgent}</p>
      <DetailSection title="Request">
        <dl>
          <dt>Action</dt>
          <dd>{props.permission.actionKind}</dd>
          <dt>Workspace</dt>
          <dd>{props.permission.workspaceName}</dd>
          <dt>Risk</dt>
          <dd>{props.permission.risk}</dd>
          <dt>Related run</dt>
          <dd>{props.permission.relatedRunId}</dd>
        </dl>
      </DetailSection>
      {props.permission.command ? (
        <DetailSection title="Command">
          <code>{props.permission.command}</code>
        </DetailSection>
      ) : null}
      {props.permission.paths.length > 0 ? (
        <DetailSection title="Paths">
          <ul>{props.permission.paths.map((path) => <li key={path}>{path}</li>)}</ul>
        </DetailSection>
      ) : null}
      {props.permission.status === "pending" ? (
        <div className="agenthub-action-row">
          <HoverButton type="button">Allow once</HoverButton>
          <HoverButton type="button">Deny</HoverButton>
        </div>
      ) : (
        <p>{props.permission.status}</p>
      )}
    </div>
  );
}

export function DiffDetail(props: {
  readonly diff: DiffViewModel;
  readonly onOpenFullScreen: () => void;
  readonly fullScreen?: boolean;
}): React.ReactElement {
  const insertions = props.diff.files.reduce((sum, file) => sum + file.insertions, 0);
  const deletions = props.diff.files.reduce((sum, file) => sum + file.deletions, 0);
  return (
    <div className="agenthub-inspector-body">
      <h3>Diff review</h3>
      <p>
        {props.diff.files.length} files · +{insertions} -{deletions}
      </p>
      {props.diff.warning ? <p className="agenthub-warning">{props.diff.warning}</p> : null}
      <DetailSection title="Files">
        <ul className="agenthub-file-list">
          {props.diff.files.map((file) => (
            <li key={file.path}>
              <span title={file.path}>{file.path}</span>
              <small>
                {file.status} +{file.insertions} -{file.deletions}
              </small>
            </li>
          ))}
        </ul>
      </DetailSection>
      <HoverButton onClick={props.onOpenFullScreen} type="button">
        {props.fullScreen ? "Return to conversation" : "Open full-screen diff review"}
      </HoverButton>
    </div>
  );
}

function RuntimeDetail(props: { readonly runtime: RuntimeSummaryViewModel }): React.ReactElement {
  return (
    <div className="agenthub-inspector-body">
      <h3>{props.runtime.label}</h3>
      <RuntimeStatusBadge status={props.runtime.status} />
      <p>{props.runtime.explanation}</p>
      <DetailSection title="Device">
        <dl>
          <dt>Platform</dt>
          <dd>{props.runtime.platform}</dd>
          <dt>Version</dt>
          <dd>{props.runtime.appVersion}</dd>
          <dt>Heartbeat</dt>
          <dd>{props.runtime.lastHeartbeatLabel}</dd>
        </dl>
      </DetailSection>
      <DetailSection title="Capabilities">
        <ul>
          {props.runtime.capabilities.length > 0 ? (
            props.runtime.capabilities.map((capability) => <li key={capability}>{capability}</li>)
          ) : (
            <li>No capabilities published</li>
          )}
        </ul>
      </DetailSection>
    </div>
  );
}

function ArtifactDetail(props: { readonly artifact: ArtifactViewModel }): React.ReactElement {
  return (
    <div className="agenthub-inspector-body">
      <h3>{props.artifact.title}</h3>
      <p>{props.artifact.type}</p>
      <p>{props.artifact.summary}</p>
    </div>
  );
}

function RunDetail(props: { readonly run: RunViewModel }): React.ReactElement {
  return (
    <div className="agenthub-inspector-body">
      <h3>Run {props.run.status}</h3>
      <p>{props.run.agentName}</p>
      <DetailSection title="Timing">
        <dl>
          <dt>Started</dt>
          <dd>{props.run.startedAt}</dd>
          <dt>Completed</dt>
          <dd>{props.run.completedAt}</dd>
        </dl>
      </DetailSection>
      {props.run.failureReason ? <p className="agenthub-warning">{props.run.failureReason}</p> : null}
    </div>
  );
}

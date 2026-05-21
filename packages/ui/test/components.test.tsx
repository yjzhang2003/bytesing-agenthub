import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import {
  AgentHubWorkbench,
  DiffCard,
  PermissionCard,
  PlanCard,
  RuntimeStatusBadge,
  workbenchLayoutForWidth,
} from "../src/index.js";

describe("@agenthub/ui components", () => {
  it("renders runtime status", () => {
    expect(renderToStaticMarkup(<RuntimeStatusBadge status="offline" />)).toContain("offline");
  });

  it("renders plan actions", () => {
    const html = renderToStaticMarkup(
      <PlanCard agents={["Orchestrator", "Implementer"]} status="draft" title="Plan" />,
    );
    expect(html).toContain("Approve");
    expect(html).toContain("Revise");
  });

  it("renders pending permission actions", () => {
    const html = renderToStaticMarkup(
      <PermissionCard risk="high" status="pending" summary="Run command" />,
    );
    expect(html).toContain("Allow once");
    expect(html).toContain("Deny");
  });

  it("renders diff summary and workbench", () => {
    const diff = renderToStaticMarkup(
      <DiffCard files={[{ path: "a.ts", status: "modified", insertions: 1, deletions: 2 }]} state="stale" />,
    );
    const workbench = renderToStaticMarkup(<AgentHubWorkbench />);
    expect(diff).toContain("1 files changed");
    expect(workbench).toContain("Context Inspector");
  });

  it("renders Control Plane offline state", () => {
    const html = renderToStaticMarkup(
      <AgentHubWorkbench error="Control plane request failed" loading={false} />,
    );
    expect(html).toContain("Control Plane offline");
    expect(html).toContain("Retry");
  });

  it("maps viewport widths to responsive workbench layout modes", () => {
    expect(workbenchLayoutForWidth(1440)).toBe("wide");
    expect(workbenchLayoutForWidth(1024)).toBe("standard");
    expect(workbenchLayoutForWidth(800)).toBe("narrow");
    expect(workbenchLayoutForWidth(390)).toBe("mobile-web");
  });
});

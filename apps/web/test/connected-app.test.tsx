// @vitest-environment happy-dom

import React, { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, describe, expect, it, vi } from "vitest";
import { agentHubApiPaths } from "@agenthub/contracts";
import { snapshot } from "../../../packages/ui/test/test-fixtures.js";
import { WebControlPlaneClient } from "../src/control-plane-client.js";
import { AgentHubConnectedApp } from "../src/main.js";

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const mountedRoots: Root[] = [];
const mountedContainers: HTMLElement[] = [];

function nextFrame(): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, 0));
}

async function settle(): Promise<void> {
  await nextFrame();
  await nextFrame();
  await nextFrame();
}

async function render(ui: React.ReactElement): Promise<HTMLElement> {
  const container = document.createElement("div");
  document.body.appendChild(container);
  const root = createRoot(container);
  mountedRoots.push(root);
  mountedContainers.push(container);
  await act(async () => {
    root.render(ui);
    await settle();
  });
  return container;
}

afterEach(async () => {
  vi.restoreAllMocks();
  await act(async () => {
    for (const root of mountedRoots.splice(0)) {
      root.unmount();
    }
    for (const container of mountedContainers.splice(0)) {
      container.remove();
    }
    document.body.innerHTML = "";
  });
});

describe("AgentHubConnectedApp", () => {
  it("keeps the signed-in workbench when the event stream disconnects", async () => {
    const workbenchSnapshot = snapshot();
    const streams: FakeEventSource[] = [];

    class FakeEventSource {
      readonly url: string;
      onerror: ((event: Event) => void) | null = null;

      constructor(url: string) {
        this.url = url;
        streams.push(this);
      }

      addEventListener() {
        // Test fake.
      }

      close() {
        // Test fake.
      }
    }

    vi.stubGlobal("EventSource", FakeEventSource);
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: string) => {
        if (new URL(url).pathname === agentHubApiPaths.workbenchSnapshot) {
          return new Response(JSON.stringify(workbenchSnapshot), { status: 200 });
        }
        return new Response(JSON.stringify({ ok: true }), { status: 200 });
      }),
    );
    const onAuthenticationFailure = vi.fn();

    const container = await render(
      <AgentHubConnectedApp
        client={
          new WebControlPlaneClient({
            accessToken: "valid-jwt",
            baseUrl: "https://api.agenthub.example",
          })
        }
        onAuthenticationFailure={onAuthenticationFailure}
      />,
    );

    await act(async () => {
      streams[0]?.onerror?.(new Event("error"));
      await settle();
    });

    expect(onAuthenticationFailure).not.toHaveBeenCalled();
    expect(container.textContent).toContain("Control Plane event stream disconnected");
  });
});

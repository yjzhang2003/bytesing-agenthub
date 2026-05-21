import { describe, expect, it } from "vitest";
import { DesktopRuntime, type AgentRunRequest, type ProviderAdapter } from "../src/index.js";

function createFakeProvider(): ProviderAdapter {
  return {
    kind: "fake-provider",
    async startRun(request, sink) {
      sink({
        type: "run.status",
        runId: request.runId,
        agentId: request.agentId,
        status: "running",
      });
      sink({
        type: "message.delta",
        runId: request.runId,
        agentId: request.agentId,
        delta: "hello",
      });
      return {
        runId: request.runId,
        async cancel() {
          sink({
            type: "run.status",
            runId: request.runId,
            agentId: request.agentId,
            status: "cancelling",
          });
        },
        done: Promise.resolve(),
      };
    },
  };
}

describe("DesktopRuntime", () => {
  it("starts and cancels provider runs through an adapter", async () => {
    const runtime = new DesktopRuntime(
      {
        authToken: "token",
        controlPlaneUrl: "http://localhost:4310",
        deviceName: "MacBook Pro",
        heartbeatSeconds: 15,
      },
      [createFakeProvider()],
    );
    const request: AgentRunRequest = {
      runId: "run_1",
      agentId: "agent_1",
      workspacePath: "/tmp/project",
      prompt: "Implement feature",
      systemPrompt: "You are a worker",
      conversationContext: [],
    };
    const events: unknown[] = [];
    const handle = await runtime.startProviderRun("fake-provider", request, (event) => {
      events.push(event);
    });
    await handle.cancel();

    expect(events).toHaveLength(3);
    expect(events).toMatchObject([
      { type: "run.status", status: "running" },
      { type: "message.delta", delta: "hello" },
      { type: "run.status", status: "cancelling" },
    ]);
  });
});


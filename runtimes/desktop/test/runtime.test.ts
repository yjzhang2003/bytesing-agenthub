import { describe, expect, it } from "vitest";
import { createServer } from "node:http";
import { mkdtemp, writeFile, chmod } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import {
  AgentMemoryClient,
  checkClaudeCodeProviderHealth,
  createRuntimeRegistrationPayload,
  ClaudeCodeProviderAdapter,
  DesktopRuntime,
  readDesktopRuntimeConfig,
  SmokeProviderAdapter,
  type AgentRunRequest,
  type ProviderAdapter,
} from "../src/index.js";

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
        controlPlaneUrl: "http://localhost:5310",
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

  it("reads local config and creates registration metadata", async () => {
    const checkedAt = "2026-05-22T00:00:00.000Z";
    const config = readDesktopRuntimeConfig({
      AGENTHUB_CONTROL_PLANE_URL: "http://127.0.0.1:5310",
      AGENTHUB_PROVIDER_MODE: "smoke",
      AGENTHUB_WORKSPACE_PATH: process.cwd(),
      AGENTHUB_WORKSPACE_NAME: "AgentHub",
      AGENTMEMORY_ENABLED: "1",
      AGENTMEMORY_URL: "http://127.0.0.1:3111",
    } as NodeJS.ProcessEnv);
    const payload = await createRuntimeRegistrationPayload(config, {
      providerHealth: {
        providerMode: "smoke",
        status: "connected",
        binaryPathLabel: "smoke",
        checkedAt,
        failureReason: null,
      },
      memoryHealth: {
        enabled: true,
        status: "connected",
        url: "http://127.0.0.1:3111",
        viewerUrl: "http://127.0.0.1:3113",
        checkedAt,
        failureReason: null,
      },
    });

    expect(config.providerMode).toBe("smoke");
    expect(config.agentMemory.enabled).toBe(true);
    expect(payload.workspace.displayName).toBe("AgentHub");
    expect(payload.capabilities).toContain("provider:smoke");
    expect(payload.providerHealth).toMatchObject({ status: "connected" });
    expect(payload.memoryHealth).toMatchObject({ status: "connected" });
  });

  it("emits normalized smoke provider events", async () => {
    const adapter = new SmokeProviderAdapter();
    const events: unknown[] = [];
    const handle = await adapter.startRun(
      {
        runId: "run_1",
        agentId: "agent_1",
        workspacePath: process.cwd(),
        prompt: "hello",
        systemPrompt: "worker",
        conversationContext: [],
      },
      (event) => events.push(event),
    );

    await handle.done;
    expect(events).toMatchObject([
      { type: "run.status", status: "running" },
      { type: "message.delta" },
      { type: "run.status", status: "completed" },
    ]);
  });

  it("polls runtime commands and publishes provider events", async () => {
    const seenPrompts: string[] = [];
    const runtime = new DesktopRuntime(
      {
        authToken: "token",
        controlPlaneUrl: "http://localhost:5310",
        deviceName: "MacBook Pro",
        heartbeatSeconds: 15,
      },
      [
        {
          kind: "fake-provider",
          async startRun(request, sink) {
            seenPrompts.push(request.systemPrompt);
            return createFakeProvider().startRun(request, sink);
          },
        },
      ],
      {
        memoryClient: {
          async fetchContext() {
            return "Remember that the user prefers concise research notes.";
          },
          async observe(input) {
            published.push({ type: "memory.observe", sourceType: input.sourceType, text: input.text });
          },
        },
      },
    );
    const published: unknown[] = [];
    const poller = {
      async pollCommands() {
        return [
          {
            id: "command_1",
            type: "run.start" as const,
            runtimeDeviceId: "runtime_1",
            createdAt: "2026-05-22T00:00:00.000Z",
            payload: {
              runId: "run_1",
              workspaceId: "workspace_1",
              conversationId: "conversation_1",
              agentId: "agent_1",
              workspacePath: "/tmp/project",
              prompt: "hello",
              systemPrompt: "worker",
              providerMode: "fake-provider",
              memory: {
                enabled: true,
                namespace: "agenthub:user_1:workspace_1:agent_1",
              },
            },
          },
        ];
      },
      async publishProviderEvent(event: unknown) {
        published.push(event);
      },
    };

    await runtime.pollAndHandleCommands("runtime_1", poller);

    expect(published.filter((event) => (event as { type?: string }).type !== "memory.observe")).toMatchObject([
      { type: "run.status", status: "running" },
      { type: "message.delta", delta: "hello" },
    ]);
    expect(seenPrompts[0]).toContain("Long-term memory");
    expect(seenPrompts[0]).toContain("concise research notes");
    expect(published).toContainEqual({
      type: "memory.observe",
      sourceType: "user.prompt",
      text: "hello",
    });
    expect(published).toContainEqual({
      type: "memory.observe",
      sourceType: "agent.output",
      text: "hello",
    });
  });

  it("handles connection check commands without starting a provider run", async () => {
    let startRunCount = 0;
    const runtime = new DesktopRuntime(
      {
        authToken: "token",
        controlPlaneUrl: "http://localhost:5310",
        deviceName: "MacBook Pro",
        heartbeatSeconds: 15,
      },
      [
        {
          kind: "fake-provider",
          async startRun() {
            startRunCount += 1;
            throw new Error("connection checks must not start runs");
          },
        },
      ],
      {
        async checkProviderHealth() {
          return {
            providerMode: "smoke",
            status: "connected",
            binaryPathLabel: "smoke",
            checkedAt: "2026-05-24T00:00:00.000Z",
            failureReason: null,
          };
        },
        memoryClient: {
          async checkHealth() {
            return {
              enabled: true,
              status: "unavailable",
              url: "http://127.0.0.1:3111",
              viewerUrl: "http://127.0.0.1:3113",
              checkedAt: "2026-05-24T00:00:01.000Z",
              failureReason: "agentmemory unavailable",
            };
          },
          async fetchContext() {
            return "";
          },
          async observe() {
            return undefined;
          },
        },
      },
    );
    const results: unknown[] = [];

    await runtime.handleCommand(
      {
        id: "command_check_1",
        type: "connection.check",
        runtimeDeviceId: "runtime_1",
        createdAt: "2026-05-24T00:00:00.000Z",
        payload: {
          workspaceId: "workspace_1",
          targets: ["provider", "memory"],
        },
      },
      {
        async publishProviderEvent() {
          throw new Error("connection checks must not publish run events");
        },
        async publishRuntimeConnectionCheckResult(result) {
          results.push(result);
        },
      },
    );

    expect(startRunCount).toBe(0);
    expect(results).toMatchObject([
      {
        runtimeDeviceId: "runtime_1",
        providerHealth: { status: "connected" },
        memoryHealth: { status: "unavailable", failureReason: "agentmemory unavailable" },
      },
    ]);
  });

  it("reports unavailable connection check results when checkers are not configured", async () => {
    const runtime = new DesktopRuntime(
      {
        authToken: "token",
        controlPlaneUrl: "http://localhost:5310",
        deviceName: "MacBook Pro",
        heartbeatSeconds: 15,
      },
      [],
    );
    const results: unknown[] = [];

    await runtime.handleCommand(
      {
        id: "command_check_unsupported",
        type: "connection.check",
        runtimeDeviceId: "runtime_1",
        createdAt: "2026-05-24T00:00:00.000Z",
        payload: {
          workspaceId: "workspace_1",
          targets: ["provider", "memory"],
        },
      },
      {
        async publishProviderEvent() {
          throw new Error("connection checks must not publish run events");
        },
        async publishRuntimeConnectionCheckResult(result) {
          results.push(result);
        },
      },
    );

    expect(results).toMatchObject([
      {
        providerHealth: {
          status: "unavailable",
          failureReason: "Provider health checker is not configured",
        },
        memoryHealth: {
          status: "disabled",
          failureReason: "agentmemory health checker is not configured",
        },
      },
    ]);
  });

  it("exposes the Claude Code provider adapter boundary", () => {
    const adapter = new ClaudeCodeProviderAdapter({ binaryPath: "claude" });
    expect(adapter.kind).toBe("claude-code");
  });

  it("reports a failed event when the Claude Code binary is missing", async () => {
    const adapter = new ClaudeCodeProviderAdapter({
      binaryPath: "/tmp/agenthub-missing-claude-code-binary",
    });
    const events: unknown[] = [];
    const handle = await adapter.startRun(
      {
        runId: "run_1",
        agentId: "agent_1",
        workspacePath: process.cwd(),
        prompt: "hello",
        systemPrompt: "worker",
        conversationContext: [],
      },
      (event) => events.push(event),
    );

    await handle.done;

    expect(events.at(-1)).toMatchObject({
      type: "run.status",
      status: "failed",
    });
  });

  it("reports Claude Code preflight health for missing and executable binaries", async () => {
    await expect(
      checkClaudeCodeProviderHealth({
        providerMode: "claude-code",
        binaryPath: "bad binary",
      }),
    ).resolves.toMatchObject({
      status: "misconfigured",
    });

    await expect(
      checkClaudeCodeProviderHealth({
        providerMode: "claude-code",
        binaryPath: "/tmp/agenthub-missing-claude-code-binary",
      }),
    ).resolves.toMatchObject({
      status: "missing",
      binaryPathLabel: "/tmp/agenthub-missing-claude-code-binary",
    });

    const directory = await mkdtemp(join(tmpdir(), "agenthub-claude-"));
    const binary = join(directory, "claude");
    await writeFile(binary, "#!/bin/sh\nprintf 'claude fake 1.0\\n'\n");
    await chmod(binary, 0o755);

    await expect(
      checkClaudeCodeProviderHealth({
        providerMode: "claude-code",
        binaryPath: binary,
      }),
    ).resolves.toMatchObject({
      status: "connected",
      binaryPathLabel: binary,
    });
  });

  it("checks agentmemory health, fetches context, and records observations", async () => {
    await expect(
      new AgentMemoryClient({
        enabled: true,
        baseUrl: "not a url",
        viewerUrl: "http://127.0.0.1:3113",
        timeoutMs: 500,
      }).checkHealth(),
    ).resolves.toMatchObject({ status: "misconfigured" });

    const observed: unknown[] = [];
    const server = createServer((request, response) => {
      if (request.url === "/agentmemory/health") {
        response.writeHead(200, { "content-type": "application/json" });
        response.end(JSON.stringify({ ok: true }));
        return;
      }
      if (request.url === "/agentmemory/context") {
        response.writeHead(200, { "content-type": "application/json" });
        response.end(JSON.stringify({ context: "User likes direct answers." }));
        return;
      }
      if (request.url === "/agentmemory/observe") {
        const chunks: Buffer[] = [];
        request.on("data", (chunk: Buffer) => chunks.push(chunk));
        request.on("end", () => {
          observed.push(JSON.parse(Buffer.concat(chunks).toString("utf8")));
          response.writeHead(202, { "content-type": "application/json" });
          response.end(JSON.stringify({ ok: true }));
        });
        return;
      }
      response.writeHead(404);
      response.end();
    });
    await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
    const address = server.address();
    if (!address || typeof address === "string") {
      throw new Error("Expected TCP server address");
    }
    const client = new AgentMemoryClient({
      enabled: true,
      baseUrl: `http://127.0.0.1:${address.port}`,
      viewerUrl: "http://127.0.0.1:3113",
      timeoutMs: 500,
    });

    try {
      await expect(client.checkHealth()).resolves.toMatchObject({ status: "connected" });
      await expect(client.fetchContext({ namespace: "agenthub:user:workspace:agent", query: "hello" })).resolves.toBe(
        "User likes direct answers.",
      );
      await client.observe({
        namespace: "agenthub:user:workspace:agent",
        text: "hello",
        sourceType: "user.prompt",
        metadata: { runId: "run_1" },
      });
      expect(observed[0]).toMatchObject({
        project: "agenthub:user:workspace:agent",
        content: "hello",
        metadata: { runId: "run_1", sourceType: "user.prompt" },
      });
    } finally {
      await new Promise<void>((resolve) => server.close(() => resolve()));
    }
  });
});

import { describe, expect, it } from "vitest";
import { createServer } from "node:http";
import { mkdtemp, readFile, writeFile, chmod } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import {
  AgentMemoryClient,
  checkClaudeCodeProviderHealth,
  createRuntimeRegistrationPayload,
  discoverClaudeCodeRuntime,
  materializeClaudeCodeProfile,
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
    expect(config.claudeCode.profileRoot).toContain("agenthub");
    expect(config.claudeCode.pluginDirs).toEqual([]);
    expect(payload.workspace.displayName).toBe("AgentHub");
    expect(payload.capabilities).toContain("provider:smoke");
    expect(payload.providerHealth).toMatchObject({ status: "connected" });
    expect(payload.memoryHealth).toMatchObject({ status: "connected" });
  });

  it("defaults local runtime provider mode to Claude Code when unset", async () => {
    const config = readDesktopRuntimeConfig({
      AGENTHUB_CONTROL_PLANE_URL: "http://127.0.0.1:5310",
      AGENTHUB_WORKSPACE_PATH: process.cwd(),
      AGENTHUB_WORKSPACE_NAME: "AgentHub",
    } as NodeJS.ProcessEnv);
    const payload = await createRuntimeRegistrationPayload(config);

    expect(config.providerMode).toBe("claude-code");
    expect(payload.capabilities).toContain("provider:claude-code");
    expect(payload.workspace.providerCapabilities).toContain("provider:claude-code");
  });

  it("reads Claude Code profile and plugin discovery config", () => {
    const config = readDesktopRuntimeConfig({
      AGENTHUB_CLAUDE_CODE_PROFILE_ROOT: "/tmp/agenthub-profiles",
      AGENTHUB_CLAUDE_CODE_PLUGIN_DIRS: "/tmp/plugin-a:/tmp/plugin-b",
    } as NodeJS.ProcessEnv);

    expect(config.claudeCode.profileRoot).toBe("/tmp/agenthub-profiles");
    expect(config.claudeCode.pluginDirs).toEqual(["/tmp/plugin-a", "/tmp/plugin-b"]);
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

  it("materializes managed Claude Code profile options before starting a run", async () => {
    const profileRoot = await mkdtemp(join(tmpdir(), "agenthub-runtime-profile-"));
    const seenRequests: AgentRunRequest[] = [];
    const runtime = new DesktopRuntime(
      {
        authToken: "token",
        claudeCode: {
          profileRoot,
          pluginDirs: ["/tmp/plugin-a"],
        },
        controlPlaneUrl: "http://localhost:5310",
        deviceName: "MacBook Pro",
        heartbeatSeconds: 15,
      },
      [
        {
          kind: "claude-code",
          async startRun(request, sink) {
            seenRequests.push(request);
            sink({
              type: "run.status",
              runId: request.runId,
              agentId: request.agentId,
              status: "completed",
            });
            return {
              runId: request.runId,
              async cancel() {},
              done: Promise.resolve(),
            };
          },
        },
      ],
    );

    await runtime.handleCommand(
      {
        id: "command_1",
        type: "run.start",
        runtimeDeviceId: "runtime_1",
        createdAt: "2026-05-24T00:00:00.000Z",
        payload: {
          runId: "run_1",
          workspaceId: "workspace_1",
          conversationId: "conversation_1",
          agentId: "agent_1",
          workspacePath: "/tmp/project",
          prompt: "hello",
          systemPrompt: "worker",
          providerMode: "claude-code",
          claudeCode: {
            allowedTools: ["Read"],
            hooksPolicy: "disabled",
            permissionPreset: "ask-first",
            settingsSource: "isolated",
          },
        },
      },
      { async publishProviderEvent() {} },
    );

    expect(seenRequests[0]?.claudeCode).toMatchObject({
      pluginDirs: ["/tmp/plugin-a"],
      settingSources: "local",
      settingsPath: expect.stringContaining(profileRoot),
      strictMcpConfig: true,
    });
    expect(
      JSON.parse(await readFile(seenRequests[0]?.claudeCode?.settingsPath ?? "", "utf8")),
    ).toMatchObject({
      hooks: {},
      permissions: { allow: ["Read"] },
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

  it("handles Claude Code discovery connection check commands", async () => {
    const runtime = new DesktopRuntime(
      {
        authToken: "token",
        controlPlaneUrl: "http://localhost:5310",
        deviceName: "MacBook Pro",
        heartbeatSeconds: 15,
      },
      [],
      {
        async discoverClaudeCode() {
          return {
            binaryPathLabel: "claude",
            checkedAt: "2026-05-24T00:00:00.000Z",
            profileRootLabel: "/tmp/agenthub-profiles",
            plugins: [],
            skills: [],
            mcpServers: [],
            workspaceClaudeFiles: {
              claudeDir: false,
              settingsJson: false,
              settingsLocalJson: false,
              mcpJson: false,
              claudeMd: false,
            },
          };
        },
      },
    );
    const results: unknown[] = [];

    await runtime.handleCommand(
      {
        id: "command_discovery_1",
        type: "connection.check",
        runtimeDeviceId: "runtime_1",
        createdAt: "2026-05-24T00:00:00.000Z",
        payload: {
          workspaceId: "workspace_1",
          targets: ["claude-code"],
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
        runtimeDeviceId: "runtime_1",
        claudeCodeDiscovery: {
          binaryPathLabel: "claude",
          profileRootLabel: "/tmp/agenthub-profiles",
        },
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

  it("includes Claude Code stderr in failed run status", async () => {
    const directory = await mkdtemp(join(tmpdir(), "agenthub-claude-failure-"));
    const binary = join(directory, "claude");
    await writeFile(
      binary,
      `#!/usr/bin/env node
console.error("missing --verbose");
process.exit(1);
`,
    );
    await chmod(binary, 0o755);
    const adapter = new ClaudeCodeProviderAdapter({ binaryPath: binary });
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
      message: "Claude Code exited with 1: missing --verbose",
    });
  });

  it("passes Claude Code run options as CLI arguments", async () => {
    const directory = await mkdtemp(join(tmpdir(), "agenthub-claude-args-"));
    const binary = join(directory, "claude");
    const argsPath = join(directory, "args.json");
    await writeFile(
      binary,
      `#!/usr/bin/env node
const { writeFileSync } = require("node:fs");
writeFileSync(${JSON.stringify(argsPath)}, JSON.stringify(process.argv.slice(2)));
console.log(JSON.stringify({ type: "assistant", message: { content: [{ type: "text", text: "ok" }] } }));
`,
    );
    await chmod(binary, 0o755);
    const adapter = new ClaudeCodeProviderAdapter({ binaryPath: binary });

    const handle = await adapter.startRun(
      {
        runId: "run_1",
        agentId: "agent_1",
        workspacePath: process.cwd(),
        prompt: "hello",
        systemPrompt: "worker",
        conversationContext: [],
        claudeCode: {
          permissionPreset: "auto-edits",
          settingsSource: "isolated",
          settingsPath: "/tmp/agenthub-profile/settings.json",
          mcpConfigPath: "/tmp/agenthub-profile/mcp.json",
          pluginDirs: ["/tmp/plugin-a", "/tmp/plugin-b"],
          strictMcpConfig: true,
          allowedTools: ["Read", "Edit"],
          disallowedTools: ["Bash(git push *)"],
          effort: "high",
          session: { behavior: "fork", sessionId: "session_1" },
        },
      },
      () => undefined,
    );
    await handle.done;

    const args = JSON.parse(await readFile(argsPath, "utf8")) as string[];
    expect(args).toContain("-p");
    expect(args).toContain("--output-format");
    expect(args).toContain("stream-json");
    expect(args).toContain("--verbose");
    expect(args).toContain("--include-partial-messages");
    expect(args).toContain("--permission-mode");
    expect(args).toContain("acceptEdits");
    expect(args).toContain("--setting-sources");
    expect(args).toContain("local");
    expect(args).toContain("--settings");
    expect(args).toContain("/tmp/agenthub-profile/settings.json");
    expect(args).toContain("--mcp-config");
    expect(args).toContain("/tmp/agenthub-profile/mcp.json");
    expect(args).toContain("--strict-mcp-config");
    expect(args.filter((arg) => arg === "--plugin-dir")).toHaveLength(2);
    expect(args).toContain("/tmp/plugin-a");
    expect(args).toContain("/tmp/plugin-b");
    expect(args).toContain("--allowedTools");
    expect(args).toContain("Read,Edit");
    expect(args).toContain("--disallowedTools");
    expect(args).toContain("Bash(git push *)");
    expect(args).toContain("--effort");
    expect(args).toContain("high");
    expect(args).toContain("--resume");
    expect(args).toContain("session_1");
    expect(args).toContain("--fork-session");
  });

  it("normalizes Claude Code stream-json text output into message deltas", async () => {
    const directory = await mkdtemp(join(tmpdir(), "agenthub-claude-json-"));
    const binary = join(directory, "claude");
    await writeFile(
      binary,
      `#!/usr/bin/env node
console.log(JSON.stringify({ type: "assistant", message: { content: [{ type: "text", text: "hello" }] } }));
console.log(JSON.stringify({ type: "result", subtype: "success", result: "done" }));
`,
    );
    await chmod(binary, 0o755);
    const adapter = new ClaudeCodeProviderAdapter({ binaryPath: binary });
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
      { type: "message.delta", delta: "hello" },
      { type: "run.status", status: "completed" },
    ]);
  });

  it("uses Claude Code stream-json partial text deltas without duplicating final messages", async () => {
    const directory = await mkdtemp(join(tmpdir(), "agenthub-claude-partials-"));
    const binary = join(directory, "claude");
    await writeFile(
      binary,
      `#!/usr/bin/env node
console.log(JSON.stringify({ type: "stream_event", event: { type: "content_block_delta", delta: { type: "text_delta", text: "hel" } } }));
console.log(JSON.stringify({ type: "stream_event", event: { type: "content_block_delta", delta: { type: "text_delta", text: "lo" } } }));
console.log(JSON.stringify({ type: "assistant", message: { content: [{ type: "text", text: "hello" }] } }));
console.log(JSON.stringify({ type: "result", subtype: "success", result: "done" }));
`,
    );
    await chmod(binary, 0o755);
    const adapter = new ClaudeCodeProviderAdapter({ binaryPath: binary });
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

    expect(
      events
        .filter((event): event is { readonly type: "message.delta"; readonly delta: string } =>
          typeof event === "object" && event !== null && "type" in event && event.type === "message.delta",
        )
        .map((event) => event.delta),
    ).toEqual(["hel", "lo"]);
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

  it("materializes managed Claude Code profile files outside the workspace", async () => {
    const workspacePath = await mkdtemp(join(tmpdir(), "agenthub-workspace-"));
    const profileRoot = await mkdtemp(join(tmpdir(), "agenthub-profiles-"));

    const profile = await materializeClaudeCodeProfile({
      profileRoot,
      workspacePath,
      workspaceId: "workspace_1",
      agentId: "agent_1",
      runId: "run_1",
      settingsSource: "isolated",
      hooksPolicy: "disabled",
      allowedTools: ["Read", "Edit"],
      disallowedTools: ["Bash(git push *)"],
      mcpConfig: {
        mcpServers: {
          github: {
            transport: "http",
            url: "https://example.com/mcp",
            headers: { Authorization: "Bearer secret" },
          },
        },
      },
    });

    expect(profile.profilePathLabel.startsWith(profileRoot)).toBe(true);
    expect(profile.profilePathLabel.startsWith(workspacePath)).toBe(false);
    expect(profile.settingsPath).toContain(profileRoot);
    expect(profile.mcpConfigPath).toContain(profileRoot);
    expect(profile.settingSources).toBe("local");
    expect(profile.strictMcpConfig).toBe(true);
  });

  it("discovers Claude Code plugin and skill summaries without exposing secret contents", async () => {
    const workspacePath = await mkdtemp(join(tmpdir(), "agenthub-workspace-"));
    const pluginRoot = await mkdtemp(join(tmpdir(), "agenthub-plugin-"));
    await writeFile(
      join(pluginRoot, "plugin.json"),
      JSON.stringify({ name: "local-plugin", version: "1.0.0" }),
    );
    await import("node:fs/promises").then(({ mkdir }) =>
      mkdir(join(pluginRoot, "skills", "review"), { recursive: true }),
    );
    await writeFile(
      join(pluginRoot, "skills", "review", "SKILL.md"),
      "---\nname: review\ndescription: Reviews code safely\n---\nSecret internal instructions",
    );
    await writeFile(
      join(workspacePath, ".mcp.json"),
      JSON.stringify({
        mcpServers: {
          github: {
            command: "node",
            args: ["server.js"],
            env: { GITHUB_TOKEN: "secret-token" },
          },
        },
      }),
    );

    const discovery = await discoverClaudeCodeRuntime({
      binaryPath: "claude",
      workspacePath,
      pluginDirs: [pluginRoot],
      profileRoot: join(tmpdir(), "agenthub-profiles"),
      now: () => new Date("2026-05-24T00:00:00.000Z"),
    });

    expect(discovery.plugins).toMatchObject([{ name: "local-plugin", version: "1.0.0" }]);
    expect(discovery.skills).toMatchObject([
      { name: "review", description: "Reviews code safely", pluginName: "local-plugin" },
    ]);
    expect(JSON.stringify(discovery)).not.toContain("secret-token");
    expect(JSON.stringify(discovery)).not.toContain("Secret internal instructions");
    expect(discovery.mcpServers).toMatchObject([{ name: "github", transport: "stdio" }]);
    expect(discovery.workspaceClaudeFiles.mcpJson).toBe(true);
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

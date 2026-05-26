import type { ProviderRuntimeEvent, RuntimeCommand } from "../src/index.js";

export const smokeRunStartCommandFixture: RuntimeCommand = {
  id: "command_smoke_start",
  type: "run.start",
  runtimeDeviceId: "runtime_1",
  createdAt: "2026-05-22T00:00:00.000Z",
  payload: {
    runId: "run_smoke_1",
    workspaceId: "workspace_1",
    projectId: "project_1",
    conversationId: "conversation_1",
    agentId: "agent_1",
    workspacePath: "/tmp/project",
    prompt: "Run smoke loop",
    systemPrompt: "You are a worker",
    providerMode: "smoke",
  },
};

export const claudeCodeRunStartCommandFixture: RuntimeCommand = {
  ...smokeRunStartCommandFixture,
  id: "command_claude_start",
  payload: {
    ...smokeRunStartCommandFixture.payload,
    runId: "run_claude_1",
    prompt: "Run Claude Code loop",
    providerMode: "claude-code",
  },
};

export const runCancelCommandFixture: RuntimeCommand = {
  id: "command_cancel",
  type: "run.cancel",
  runtimeDeviceId: "runtime_1",
  createdAt: "2026-05-22T00:00:01.000Z",
  payload: {
    runId: "run_smoke_1",
  },
};

export const smokeProviderOutputFixtures: readonly ProviderRuntimeEvent[] = [
  {
    type: "run.status",
    runId: "run_smoke_1",
    agentId: "agent_1",
    status: "running",
    message: "Smoke provider started",
  },
  {
    type: "message.delta",
    runId: "run_smoke_1",
    agentId: "agent_1",
    delta: "Smoke provider received: Run smoke loop",
  },
  {
    type: "run.status",
    runId: "run_smoke_1",
    agentId: "agent_1",
    status: "completed",
    message: "Smoke provider completed",
  },
];

export const claudeCodeProcessOutputFixtures: readonly ProviderRuntimeEvent[] = [
  {
    type: "run.status",
    runId: "run_claude_1",
    agentId: "agent_1",
    status: "running",
    message: "Claude Code process started",
  },
  {
    type: "message.delta",
    runId: "run_claude_1",
    agentId: "agent_1",
    delta: "Claude Code output",
  },
  {
    type: "run.status",
    runId: "run_claude_1",
    agentId: "agent_1",
    status: "completed",
    message: "Claude Code process completed",
  },
];

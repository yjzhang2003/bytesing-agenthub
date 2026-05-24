import { spawn } from "node:child_process";
import { setTimeout as delay } from "node:timers/promises";

if (process.env.AGENTHUB_RUN_REAL_CLAUDE_CODE_SMOKE !== "1") {
  throw new Error(
    "Real Claude Code smoke is opt-in. Set AGENTHUB_RUN_REAL_CLAUDE_CODE_SMOKE=1 after installing and authenticating Claude Code.",
  );
}

const root = new URL("..", import.meta.url);
const authToken = process.env.AGENTHUB_LOCAL_AUTH_TOKEN ?? "agenthub-local-demo-token";
const controlPlaneUrl = process.env.AGENTHUB_CONTROL_PLANE_URL ?? "http://127.0.0.1:5314";
const expectedText = "AGENTHUB_REAL_CLAUDE_CODE_OK";
const processes = [];

function start(name, args, env = {}) {
  const child = spawn("pnpm", args, {
    cwd: root,
    env: {
      ...process.env,
      AGENTHUB_AUTH_MODE: "local-demo",
      AGENTHUB_LOCAL_AUTH_TOKEN: authToken,
      AGENTHUB_CONTROL_PLANE_URL: controlPlaneUrl,
      AGENTHUB_PROVIDER_MODE: "claude-code",
      CONTROL_PLANE_PORT: new URL(controlPlaneUrl).port,
      ...env,
    },
    stdio: ["ignore", "pipe", "pipe"],
  });
  child.stdout.on("data", (chunk) => process.stdout.write(`[${name}] ${chunk}`));
  child.stderr.on("data", (chunk) => process.stderr.write(`[${name}] ${chunk}`));
  processes.push(child);
  return child;
}

async function fetchJson(path, options = {}) {
  const response = await fetch(`${controlPlaneUrl}${path}`, {
    ...options,
    headers: {
      authorization: `Bearer ${authToken}`,
      "content-type": "application/json",
      ...(options.headers ?? {}),
    },
  });
  if (!response.ok) {
    throw new Error(`${path} failed with HTTP ${response.status}: ${await response.text()}`);
  }
  return response.json();
}

async function waitFor(path, label) {
  let lastError;
  for (let index = 0; index < 80; index += 1) {
    try {
      return await fetchJson(path);
    } catch (error) {
      lastError = error;
      await delay(250);
    }
  }
  throw new Error(`${label} did not become ready: ${lastError?.message ?? "unknown error"}`);
}

function activeConversationAgentId(snapshot) {
  const participantAgentIds = new Set(
    (snapshot.conversationParticipants ?? [])
      .filter((participant) => participant.conversationId === snapshot.activeConversationId)
      .map((participant) => participant.agentId),
  );
  const agent = snapshot.agents?.find((candidate) => participantAgentIds.has(candidate.id));
  if (!agent?.id) {
    throw new Error("Active conversation has no runnable agent participant");
  }
  return agent.id;
}

async function main() {
  start("control-plane", ["--filter", "@agenthub/control-plane", "dev"]);
  await waitFor("/health", "Control Plane");
  start("desktop-runtime", ["--filter", "@agenthub/desktop-runtime", "dev"]);

  let snapshot;
  for (let index = 0; index < 80; index += 1) {
    snapshot = await fetchJson("/workbench/snapshot");
    if (snapshot.providerHealth?.status === "connected") {
      break;
    }
    if (snapshot.providerHealth?.status === "missing") {
      throw new Error(
        `Claude Code binary was not found. Set AGENTHUB_CLAUDE_CODE_BIN or install the claude CLI. Detail: ${
          snapshot.providerHealth.failureReason ?? "missing binary"
        }`,
      );
    }
    if (snapshot.providerHealth?.status === "misconfigured") {
      throw new Error(
        `Claude Code provider is misconfigured. Authenticate the CLI or fix the selected profile. Detail: ${
          snapshot.providerHealth.failureReason ?? "misconfigured provider"
        }`,
      );
    }
    await delay(250);
  }
  if (snapshot?.providerHealth?.status !== "connected") {
    throw new Error(
      `Claude Code provider did not connect. Last status: ${snapshot?.providerHealth?.status ?? "unknown"}`,
    );
  }

  const runResponse = await fetchJson("/runs", {
    body: JSON.stringify({
      workspaceId: snapshot.activeWorkspaceId,
      conversationId: snapshot.activeConversationId,
      agentId: activeConversationAgentId(snapshot),
      prompt: `Reply with exactly this text and no extra text: ${expectedText}`,
      claudeCode: {
        permissionPreset: "plan-only",
        settingsSource: "managed",
        hooksPolicy: "disabled",
        effort: "low",
        session: { behavior: "new" },
      },
    }),
    method: "POST",
  });
  if (!runResponse.run?.id) {
    throw new Error("Real Claude Code smoke run creation did not return a run id");
  }

  for (let index = 0; index < 120; index += 1) {
    snapshot = await fetchJson("/workbench/snapshot");
    const run = snapshot.runs?.find((candidate) => candidate.id === runResponse.run.id);
    const providerMessage = snapshot.messages?.find((message) =>
      message.parts?.some(
        (part) =>
          part.runId === runResponse.run.id &&
          typeof part.text === "string" &&
          part.text.includes(expectedText),
      ),
    );
    if (run?.status === "failed") {
      throw new Error(`Real Claude Code run failed: ${run.failureReason ?? "unknown failure"}`);
    }
    if (run?.status === "completed" && providerMessage) {
      console.log("[smoke] Real Claude Code provider preflight and normalized run output verified");
      return;
    }
    await delay(500);
  }
  throw new Error("Real Claude Code run did not complete with normalized provider output");
}

try {
  await main();
} finally {
  for (const child of processes.reverse()) {
    child.kill("SIGTERM");
  }
}

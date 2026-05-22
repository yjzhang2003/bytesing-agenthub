import { mkdtemp, writeFile, chmod } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawn } from "node:child_process";
import { setTimeout as delay } from "node:timers/promises";

const root = new URL("..", import.meta.url);
const authToken = process.env.AGENTHUB_LOCAL_AUTH_TOKEN ?? "agenthub-local-demo-token";
const controlPlaneUrl = process.env.AGENTHUB_CONTROL_PLANE_URL ?? "http://127.0.0.1:5312";
const processes = [];

async function createFakeClaudeBinary() {
  const directory = await mkdtemp(join(tmpdir(), "agenthub-fake-claude-"));
  const binary = join(directory, "claude");
  await writeFile(
    binary,
    "#!/bin/sh\nif [ \"$1\" = \"--version\" ]; then echo 'claude fake 1.0'; exit 0; fi\necho \"Fake Claude Code received: $2\"\n",
  );
  await chmod(binary, 0o755);
  return binary;
}

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
  for (let index = 0; index < 60; index += 1) {
    try {
      return await fetchJson(path);
    } catch (error) {
      lastError = error;
      await delay(250);
    }
  }
  throw new Error(`${label} did not become ready: ${lastError?.message ?? "unknown error"}`);
}

async function main() {
  const fakeClaude = await createFakeClaudeBinary();
  start("control-plane", ["--filter", "@agenthub/control-plane", "dev"]);
  await waitFor("/health", "Control Plane");
  start("desktop-runtime", ["--filter", "@agenthub/desktop-runtime", "dev"], {
    AGENTHUB_CLAUDE_CODE_BIN: fakeClaude,
  });

  let snapshot;
  for (let index = 0; index < 60; index += 1) {
    snapshot = await fetchJson("/workbench/snapshot");
    if (snapshot.providerHealth?.status === "connected") {
      break;
    }
    await delay(250);
  }
  if (snapshot?.providerHealth?.status !== "connected") {
    throw new Error("Fake Claude Code provider did not report connected");
  }

  const runResponse = await fetchJson("/runs", {
    body: JSON.stringify({
      workspaceId: snapshot.activeWorkspaceId,
      conversationId: snapshot.activeConversationId,
      agentId: snapshot.agents.find((agent) => agent.role === "worker")?.id,
      prompt: "Verify fake Claude Code path",
    }),
    method: "POST",
  });

  for (let index = 0; index < 60; index += 1) {
    snapshot = await fetchJson("/workbench/snapshot");
    const completedRun = snapshot.runs?.find(
      (run) => run.id === runResponse.run.id && run.status === "completed",
    );
    const providerMessage = snapshot.messages?.find((message) =>
      message.parts?.some(
        (part) =>
          part.runId === runResponse.run.id &&
          typeof part.text === "string" &&
          part.text.includes("Fake Claude Code received"),
      ),
    );
    if (completedRun && providerMessage) {
      console.log("[smoke] Fake Claude Code provider preflight and run loop verified");
      return;
    }
    await delay(250);
  }
  throw new Error("Fake Claude Code run did not complete with provider output");
}

try {
  await main();
} finally {
  for (const child of processes.reverse()) {
    child.kill("SIGTERM");
  }
}

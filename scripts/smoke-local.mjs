import { spawn } from "node:child_process";
import { setTimeout as delay } from "node:timers/promises";

const root = new URL("..", import.meta.url);
const authToken = process.env.AGENTHUB_LOCAL_AUTH_TOKEN ?? "agenthub-local-demo-token";
const controlPlaneUrl = process.env.AGENTHUB_CONTROL_PLANE_URL ?? "http://127.0.0.1:5310";

const processes = [];

function start(name, args, env = {}) {
  const child = spawn("pnpm", args, {
    cwd: root,
    env: {
      ...process.env,
      AGENTHUB_AUTH_MODE: "local-demo",
      AGENTHUB_LOCAL_AUTH_TOKEN: authToken,
      AGENTHUB_CONTROL_PLANE_URL: controlPlaneUrl,
      AGENTHUB_PROVIDER_MODE: "smoke",
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
  for (let index = 0; index < 40; index += 1) {
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
  start("control-plane", ["--filter", "@agenthub/control-plane", "dev"]);
  await waitFor("/health", "Control Plane");

  start("desktop-runtime", ["--filter", "@agenthub/desktop-runtime", "dev"]);

  let snapshot;
  for (let index = 0; index < 40; index += 1) {
    snapshot = await fetchJson("/workbench/snapshot");
    if (snapshot.runtimeDevices?.some((device) => device.status === "online")) {
      break;
    }
    await delay(250);
  }

  if (!snapshot?.runtimeDevices?.some((device) => device.status === "online")) {
    throw new Error("Desktop Runtime did not register as online");
  }

  await fetchJson("/connections/checks", {
    body: JSON.stringify({
      workspaceId: snapshot.activeWorkspaceId,
      targets: ["provider", "memory"],
    }),
    method: "POST",
  });

  for (let index = 0; index < 40; index += 1) {
    snapshot = await fetchJson("/workbench/snapshot");
    if (snapshot.providerHealth?.status === "connected" && snapshot.memoryHealth?.status) {
      break;
    }
    await delay(250);
  }

  if (snapshot?.providerHealth?.status !== "connected") {
    throw new Error("Provider connection check did not report connected");
  }
  if (!snapshot?.memoryHealth?.status) {
    throw new Error("Memory connection check did not report a status");
  }

  const runResponse = await fetchJson("/runs", {
    body: JSON.stringify({
      workspaceId: snapshot.activeWorkspaceId,
      conversationId: snapshot.activeConversationId,
      agentId: snapshot.agents.find((agent) => agent.role === "worker")?.id,
      prompt: "Verify AgentHub local runnable smoke path",
    }),
    method: "POST",
  });
  if (!runResponse.run?.id) {
    throw new Error("Run creation did not return a run id");
  }

  let completedRun;
  let providerMessage;
  for (let index = 0; index < 40; index += 1) {
    snapshot = await fetchJson("/workbench/snapshot");
    completedRun = snapshot.runs?.find(
      (run) => run.id === runResponse.run.id && run.status === "completed",
    );
    providerMessage = snapshot.messages?.find((message) =>
      message.parts?.some(
        (part) =>
          part.runId === runResponse.run.id &&
          typeof part.text === "string" &&
          part.text.includes("Smoke provider received"),
      ),
    );
    if (completedRun && providerMessage) {
      break;
    }
    await delay(250);
  }

  if (!completedRun) {
    throw new Error("Smoke run did not reach completed state in the workbench snapshot");
  }
  if (!providerMessage) {
    throw new Error("Smoke provider output was not recorded in the workbench snapshot");
  }

  console.log(
    "[smoke] Control Plane, Desktop Runtime, connection checks, command delivery, provider output, and snapshot lifecycle verified",
  );
}

try {
  await main();
} finally {
  for (const child of processes.reverse()) {
    child.kill("SIGTERM");
  }
}

import { createServer } from "node:http";
import { spawn } from "node:child_process";
import { setTimeout as delay } from "node:timers/promises";

const root = new URL("..", import.meta.url);
const authToken = process.env.AGENTHUB_LOCAL_AUTH_TOKEN ?? "agenthub-local-demo-token";
const controlPlaneUrl = process.env.AGENTHUB_CONTROL_PLANE_URL ?? "http://127.0.0.1:5313";
const processes = [];
const observations = [];

function startMemoryStub() {
  const server = createServer((request, response) => {
    if (request.url === "/agentmemory/health") {
      response.writeHead(200, { "content-type": "application/json" });
      response.end(JSON.stringify({ ok: true }));
      return;
    }
    if (request.url === "/agentmemory/context") {
      response.writeHead(200, { "content-type": "application/json" });
      response.end(JSON.stringify({ context: "Remember: user prefers role-specific memory." }));
      return;
    }
    if (request.url === "/agentmemory/observe") {
      const chunks = [];
      request.on("data", (chunk) => chunks.push(chunk));
      request.on("end", () => {
        observations.push(JSON.parse(Buffer.concat(chunks).toString("utf8")));
        response.writeHead(202, { "content-type": "application/json" });
        response.end(JSON.stringify({ ok: true }));
      });
      return;
    }
    response.writeHead(404);
    response.end();
  });
  return new Promise((resolve) => {
    server.listen(0, "127.0.0.1", () => resolve(server));
  });
}

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
  const memoryServer = await startMemoryStub();
  const address = memoryServer.address();
  if (!address || typeof address === "string") {
    throw new Error("Expected memory server TCP address");
  }
  try {
    start("control-plane", ["--filter", "@agenthub/control-plane", "dev"]);
    await waitFor("/health", "Control Plane");
    start("desktop-runtime", ["--filter", "@agenthub/desktop-runtime", "dev"], {
      AGENTMEMORY_ENABLED: "1",
      AGENTMEMORY_URL: `http://127.0.0.1:${address.port}`,
    });

    let snapshot;
    for (let index = 0; index < 60; index += 1) {
      snapshot = await fetchJson("/workbench/snapshot");
      if (snapshot.memoryHealth?.status === "connected") {
        break;
      }
      await delay(250);
    }
    if (snapshot?.memoryHealth?.status !== "connected") {
      throw new Error("agentmemory stub did not report connected");
    }

    const runResponse = await fetchJson("/runs", {
      body: JSON.stringify({
        workspaceId: snapshot.activeWorkspaceId,
        conversationId: snapshot.activeConversationId,
        agentId: activeConversationAgentId(snapshot),
        prompt: "Verify memory path",
      }),
      method: "POST",
    });

    for (let index = 0; index < 60; index += 1) {
      snapshot = await fetchJson("/workbench/snapshot");
      const completedRun = snapshot.runs?.find(
        (run) => run.id === runResponse.run.id && run.status === "completed",
      );
      const sourceTypes = observations.map((observation) => observation.metadata?.sourceType);
      if (completedRun && sourceTypes.includes("user.prompt") && sourceTypes.includes("agent.output")) {
        const project = observations[0]?.project;
        if (!String(project).includes(runResponse.run.agentId)) {
          throw new Error(`Expected role-isolated project namespace, received ${project}`);
        }
        console.log("[smoke] agentmemory health, context lookup, and observations verified");
        return;
      }
      await delay(250);
    }
    throw new Error("Memory smoke did not observe user prompt and agent output");
  } finally {
    await new Promise((resolve) => memoryServer.close(() => resolve()));
  }
}

try {
  await main();
} finally {
  for (const child of processes.reverse()) {
    child.kill("SIGTERM");
  }
}

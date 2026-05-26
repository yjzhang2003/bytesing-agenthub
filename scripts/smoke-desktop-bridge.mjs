import { createServer } from "node:http";
import { execFileSync, spawn } from "node:child_process";
import { once } from "node:events";

const rootCwd = new URL("..", import.meta.url).pathname;
const debugPort = Number.parseInt(process.env.AGENTHUB_DESKTOP_BRIDGE_DEBUG_PORT ?? "9335", 10);

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForJson(url, timeoutMs = 15000) {
  const started = Date.now();
  let lastError;
  while (Date.now() - started < timeoutMs) {
    try {
      const response = await fetch(url);
      if (response.ok) {
        return await response.json();
      }
      lastError = new Error(`${url} returned ${response.status}`);
    } catch (error) {
      lastError = error;
    }
    await wait(250);
  }
  throw lastError ?? new Error(`Timed out waiting for ${url}`);
}

async function evaluateInPage(webSocketDebuggerUrl, expression) {
  const ws = new WebSocket(webSocketDebuggerUrl);
  let nextId = 0;
  const pending = new Map();
  ws.addEventListener("message", (event) => {
    const message = JSON.parse(event.data);
    if (message.id && pending.has(message.id)) {
      pending.get(message.id)(message);
      pending.delete(message.id);
    }
  });
  await new Promise((resolve, reject) => {
    ws.addEventListener("open", resolve, { once: true });
    ws.addEventListener("error", reject, { once: true });
  });
  const send = (method, params = {}) =>
    new Promise((resolve, reject) => {
      const id = ++nextId;
      const timeout = setTimeout(() => {
        pending.delete(id);
        reject(new Error(`Timed out waiting for ${method}`));
      }, 5000);
      pending.set(id, (message) => {
        clearTimeout(timeout);
        resolve(message);
      });
      ws.send(JSON.stringify({ id, method, params }));
    });
  await send("Runtime.enable");
  const result = await send("Runtime.evaluate", {
    expression,
    returnByValue: true,
  });
  ws.close();
  return result;
}

const server = createServer((_request, response) => {
  response.writeHead(200, { "content-type": "text/html" });
  response.end("<!doctype html><title>AgentHub Desktop Bridge Smoke</title><main>ok</main>");
});
server.listen(0, "127.0.0.1");
await once(server, "listening");
const address = server.address();
const webUrl = `http://127.0.0.1:${address.port}/`;

let electron;
try {
  execFileSync("pnpm", ["--filter", "@agenthub/desktop", "build"], {
    cwd: rootCwd,
    stdio: "inherit",
  });
  electron = spawn(
    "pnpm",
    [
      "--filter",
      "@agenthub/desktop",
      "exec",
      "electron",
      `--remote-debugging-port=${debugPort}`,
      "dist/main.js",
    ],
    {
      cwd: rootCwd,
      env: {
        ...process.env,
        AGENTHUB_ELECTRON_ENTRY: "1",
        AGENTHUB_WEB_URL: webUrl,
      },
      stdio: ["ignore", "pipe", "pipe"],
    },
  );
  let desktopOutput = "";
  electron.stdout.on("data", (chunk) => {
    desktopOutput += String(chunk);
  });
  electron.stderr.on("data", (chunk) => {
    desktopOutput += String(chunk);
  });
  const targets = await waitForJson(`http://127.0.0.1:${debugPort}/json/list`);
  const page = targets.find((target) => target.type === "page" && target.url === webUrl);
  if (!page?.webSocketDebuggerUrl) {
    throw new Error(
      `Desktop renderer for ${webUrl} was not debuggable. Targets: ${JSON.stringify(
        targets.map((target) => ({ type: target.type, url: target.url })),
      )}\nOutput:\n${desktopOutput}`,
    );
  }
  const result = await evaluateInPage(
    page.webSocketDebuggerUrl,
    `(() => {
      const bridge = window.agentHubDesktop;
      if (!bridge || typeof bridge.getCapabilities !== "function") {
        return { ok: false, reason: "missing bridge" };
      }
      const capabilities = bridge.getCapabilities();
      return {
        ok: capabilities.version === "1.0.0" &&
          capabilities.capabilities.includes("project.choose-directory") &&
          capabilities.capabilities.includes("project.create-default"),
        capabilities,
      };
    })()`,
  );
  const value = result?.result?.result?.value;
  if (!value?.ok) {
    throw new Error(
      `Desktop capability bridge smoke failed: ${JSON.stringify(value)}\nOutput:\n${desktopOutput}`,
    );
  }
  console.log(
    `[smoke:desktop-bridge] bridge ${value.capabilities.version} capabilities=${value.capabilities.capabilities.join(",")}`,
  );
} finally {
  if (electron && !electron.killed) {
    electron.kill("SIGTERM");
  }
  server.close();
}

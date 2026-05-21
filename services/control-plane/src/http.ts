import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { parseBearerToken, verifySupabaseJwt, type AuthContext } from "./auth.js";
import { ControlPlaneRegistry } from "./runtime-registry.js";

export interface ControlPlaneServerOptions {
  readonly jwtSecret: string;
  readonly registry?: ControlPlaneRegistry;
}

async function readJson(request: IncomingMessage): Promise<unknown> {
  const chunks: Buffer[] = [];
  for await (const chunk of request) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  const raw = Buffer.concat(chunks).toString("utf8");
  return raw ? (JSON.parse(raw) as unknown) : {};
}

function sendJson(response: ServerResponse, status: number, body: unknown): void {
  response.writeHead(status, { "content-type": "application/json" });
  response.end(JSON.stringify(body));
}

function authenticate(request: IncomingMessage, jwtSecret: string): AuthContext {
  const token = parseBearerToken(request.headers.authorization);
  return verifySupabaseJwt(token, jwtSecret);
}

export function createControlPlaneServer(options: ControlPlaneServerOptions) {
  const registry = options.registry ?? new ControlPlaneRegistry();

  return createServer(async (request, response) => {
    try {
      const url = new URL(request.url ?? "/", "http://localhost");
      if (url.pathname === "/health") {
        sendJson(response, 200, { ok: true });
        return;
      }

      const auth = authenticate(request, options.jwtSecret);

      if (request.method === "GET" && url.pathname === "/events") {
        response.writeHead(200, {
          "cache-control": "no-cache",
          connection: "keep-alive",
          "content-type": "text/event-stream",
        });
        response.write(`event: ready\ndata: ${JSON.stringify({ ok: true })}\n\n`);
        const unsubscribe = registry.events.subscribe((event) => {
          if (event.ownerUserId === auth.userId) {
            response.write(`event: ${event.type}\ndata: ${JSON.stringify(event)}\n\n`);
          }
        });
        request.on("close", unsubscribe);
        return;
      }

      if (request.method === "POST" && url.pathname === "/runtime/register") {
        const body = (await readJson(request)) as {
          displayName: string;
          platform: "macos" | "windows" | "linux" | "cloud";
          appVersion: string;
          capabilities?: string[];
        };
        const device = registry.registerRuntimeDevice(auth.userId, {
          displayName: body.displayName,
          platform: body.platform,
          appVersion: body.appVersion,
          capabilities: body.capabilities ?? [],
        });
        sendJson(response, 200, { device });
        return;
      }

      if (request.method === "POST" && url.pathname === "/runtime/heartbeat") {
        const body = (await readJson(request)) as { runtimeDeviceId: string };
        const device = registry.recordHeartbeat(auth.userId, body.runtimeDeviceId);
        sendJson(response, 200, { device });
        return;
      }

      if (request.method === "POST" && url.pathname === "/runs") {
        const body = (await readJson(request)) as {
          workspaceId: string;
          conversationId: string;
          agentId: string;
          planId?: string | null;
        };
        const run = registry.createRun(auth.userId, body);
        sendJson(response, 201, { run });
        return;
      }

      const cancelMatch = url.pathname.match(/^\/runs\/([^/]+)\/cancel$/);
      if (request.method === "POST" && cancelMatch?.[1]) {
        const run = registry.cancelRun(auth.userId, cancelMatch[1]);
        sendJson(response, 200, { run });
        return;
      }

      sendJson(response, 404, { error: "Not found" });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      const status = message.includes("token") || message.includes("JWT") ? 401 : 400;
      sendJson(response, status, { error: message });
    }
  });
}

import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import {
  agentHubApiPaths,
  agentHubLocalDefaults,
  createLocalRunRequestSchema,
  providerRuntimeEventSchema,
  runtimeHeartbeatPayloadSchema,
  runtimeRegistrationPayloadSchema,
  type AgentHubAuthMode,
  type ServiceHealth,
} from "@agenthub/contracts";
import { parseBearerToken, verifySupabaseJwt, type AuthContext } from "./auth.js";
import { ControlPlaneRegistry } from "./runtime-registry.js";

export interface ControlPlaneServerOptions {
  readonly jwtSecret: string;
  readonly authMode?: AgentHubAuthMode;
  readonly localAuthToken?: string;
  readonly localUserId?: string;
  readonly providerMode?: "smoke" | "claude-code";
  readonly version?: string;
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
  response.writeHead(status, {
    "access-control-allow-headers": "authorization, content-type",
    "access-control-allow-methods": "GET, POST, OPTIONS",
    "access-control-allow-origin": "*",
    "content-type": "application/json",
  });
  response.end(JSON.stringify(body));
}

function authenticate(
  request: IncomingMessage,
  options: ControlPlaneServerOptions,
  url?: URL,
): AuthContext {
  const token = request.headers.authorization
    ? parseBearerToken(request.headers.authorization)
    : (url?.searchParams.get("access_token") ?? "");
  if (!token) {
    throw new Error("Missing bearer token");
  }
  if ((options.authMode ?? "supabase") === "local-demo") {
    const expected = options.localAuthToken ?? agentHubLocalDefaults.authToken;
    if (token !== expected) {
      throw new Error("Invalid local demo token");
    }
    return {
      userId: options.localUserId ?? agentHubLocalDefaults.userId,
      token,
      claims: { mode: "local-demo" },
    };
  }
  return verifySupabaseJwt(token, options.jwtSecret);
}

export function createControlPlaneServer(options: ControlPlaneServerOptions) {
  const registry = options.registry ?? new ControlPlaneRegistry();
  const authMode = options.authMode ?? "supabase";
  const version = options.version ?? "0.1.0";

  return createServer(async (request, response) => {
    try {
      const url = new URL(request.url ?? "/", "http://localhost");
      if (request.method === "OPTIONS") {
        sendJson(response, 204, {});
        return;
      }

      if (url.pathname === agentHubApiPaths.health) {
        registry.markExpiredDevicesOffline();
        const runtime = registry.latestRuntimeStatus(options.localUserId ?? agentHubLocalDefaults.userId);
        const body: ServiceHealth = {
          ok: true,
          service: "@agenthub/control-plane",
          version,
          mode: authMode,
          timestamp: new Date().toISOString(),
          runtime,
        };
        sendJson(response, 200, body);
        return;
      }

      const auth = authenticate(request, options, url);

      if (request.method === "GET" && url.pathname === agentHubApiPaths.events) {
        response.writeHead(200, {
          "access-control-allow-origin": "*",
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

      if (request.method === "GET" && url.pathname === agentHubApiPaths.workbenchSnapshot) {
        registry.markExpiredDevicesOffline();
        sendJson(response, 200, registry.createWorkbenchSnapshot(auth.userId));
        return;
      }

      if (request.method === "POST" && url.pathname === agentHubApiPaths.runtimeRegister) {
        const parsed = runtimeRegistrationPayloadSchema.parse(await readJson(request));
        const device = registry.registerRuntimeDevice(auth.userId, {
          displayName: parsed.displayName,
          platform: parsed.platform,
          appVersion: parsed.appVersion,
          capabilities: parsed.capabilities,
          workspace: parsed.workspace,
          ...(parsed.deviceId ? { id: parsed.deviceId } : {}),
        });
        sendJson(response, 200, { device });
        return;
      }

      if (request.method === "POST" && url.pathname === agentHubApiPaths.runtimeHeartbeat) {
        const body = runtimeHeartbeatPayloadSchema.parse(await readJson(request));
        const device = registry.recordHeartbeat(auth.userId, body.runtimeDeviceId);
        sendJson(response, 200, { device });
        return;
      }

      if (request.method === "POST" && url.pathname === agentHubApiPaths.runtimeOffline) {
        const body = runtimeHeartbeatPayloadSchema.parse(await readJson(request));
        const device = registry.markRuntimeOffline(auth.userId, body.runtimeDeviceId);
        sendJson(response, 200, { device });
        return;
      }

      if (request.method === "GET" && url.pathname === agentHubApiPaths.runtimeCommands) {
        const runtimeDeviceId = url.searchParams.get("deviceId");
        if (!runtimeDeviceId) {
          throw new Error("deviceId query parameter is required");
        }
        sendJson(response, 200, { commands: registry.takeRuntimeCommands(auth.userId, runtimeDeviceId) });
        return;
      }

      if (request.method === "POST" && url.pathname === agentHubApiPaths.runtimeEvents) {
        const event = providerRuntimeEventSchema.parse(await readJson(request));
        registry.recordProviderRuntimeEvent(auth.userId, event);
        sendJson(response, 202, { ok: true });
        return;
      }

      if (request.method === "POST" && url.pathname === agentHubApiPaths.runs) {
        const body = createLocalRunRequestSchema.parse(await readJson(request));
        const run = registry.createRun(
          auth.userId,
          {
            workspaceId: body.workspaceId,
            conversationId: body.conversationId,
            agentId: body.agentId,
            prompt: body.prompt,
            ...(body.planId ? { planId: body.planId } : {}),
          },
          options.providerMode ?? "smoke",
        );
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

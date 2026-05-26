import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import {
  agentHubApiPaths,
  agentHubLocalDefaults,
  addConversationAgentRequestSchema,
  createAgentConversationRequestSchema,
  createConnectionCheckRequestSchema,
  createAgentRequestSchema,
  createLocalRunRequestSchema,
  updateAgentRequestSchema,
  updateConversationAgentSettingsRequestSchema,
  updateConversationRequestSchema,
  providerRuntimeEventSchema,
  runtimeConnectionCheckResultSchema,
  runtimeHeartbeatPayloadSchema,
  runtimeRegistrationPayloadSchema,
  type AgentHubAuthMode,
  type ClaudeCodeRunOptions,
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
    "access-control-allow-methods": "GET, POST, PATCH, DELETE, OPTIONS",
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
        const runtime = registry.latestRuntimeStatus(
          options.localUserId ?? agentHubLocalDefaults.userId,
        );
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

      if (request.method === "GET" && url.pathname === agentHubApiPaths.runtimeProviderStatus) {
        sendJson(response, 200, { providerHealth: registry.latestProviderHealth(auth.userId) });
        return;
      }

      if (request.method === "GET" && url.pathname === agentHubApiPaths.memoryStatus) {
        sendJson(response, 200, { memoryHealth: registry.latestMemoryHealth(auth.userId) });
        return;
      }

      if (request.method === "POST" && url.pathname === agentHubApiPaths.connectionChecks) {
        const body = createConnectionCheckRequestSchema.parse(await readJson(request));
        const result = registry.requestConnectionChecks(auth.userId, body);
        sendJson(response, 202, result);
        return;
      }

      if (request.method === "GET" && url.pathname === agentHubApiPaths.agents) {
        const workspaceId = url.searchParams.get("workspaceId") ?? undefined;
        sendJson(response, 200, { agents: registry.listAgents(auth.userId, workspaceId) });
        return;
      }

      if (request.method === "POST" && url.pathname === agentHubApiPaths.agents) {
        const body = createAgentRequestSchema.parse(await readJson(request));
        const agent = registry.createAgent(auth.userId, body);
        sendJson(response, 201, { agent });
        return;
      }

      const agentMatch = url.pathname.match(/^\/agents\/([^/]+)$/);
      if (request.method === "PATCH" && agentMatch?.[1]) {
        const body = updateAgentRequestSchema.parse(await readJson(request));
        const agent = registry.updateAgent(auth.userId, agentMatch[1], body);
        sendJson(response, 200, { agent });
        return;
      }

      const archiveAgentMatch = url.pathname.match(/^\/agents\/([^/]+)\/archive$/);
      if (request.method === "POST" && archiveAgentMatch?.[1]) {
        const agent = registry.archiveAgent(auth.userId, archiveAgentMatch[1]);
        sendJson(response, 200, { agent });
        return;
      }

      const agentConversationMatch = url.pathname.match(/^\/agents\/([^/]+)\/conversations$/);
      if (request.method === "POST" && agentConversationMatch?.[1]) {
        const raw = (await readJson(request)) as Record<string, unknown>;
        const body = {
          workspaceId: String(raw["workspaceId"] ?? ""),
          projectId: typeof raw["projectId"] === "string" ? raw["projectId"] : undefined,
          agentIds: [agentConversationMatch[1]],
        };
        if (String(raw["agentId"] ?? agentConversationMatch[1]) !== agentConversationMatch[1]) {
          throw new Error("Agent id path and body must match");
        }
        const conversation = registry.createAgentConversation(auth.userId, body as never);
        sendJson(response, 201, conversation);
        return;
      }

      if (request.method === "POST" && url.pathname === agentHubApiPaths.conversations) {
        const body = createAgentConversationRequestSchema.parse(await readJson(request));
        const conversation = registry.createAgentConversation(auth.userId, body);
        sendJson(response, 201, conversation);
        return;
      }

      const conversationAgentMatch = url.pathname.match(/^\/conversations\/([^/]+)\/agents$/);
      if (request.method === "POST" && conversationAgentMatch?.[1]) {
        const body = addConversationAgentRequestSchema.parse(await readJson(request));
        const participant = registry.addAgentToConversation(
          auth.userId,
          conversationAgentMatch[1],
          body.agentId,
        );
        sendJson(response, 200, { participant });
        return;
      }

      const activeConversationMatch = url.pathname.match(/^\/conversations\/([^/]+)\/active$/);
      if (request.method === "POST" && activeConversationMatch?.[1]) {
        const conversation = registry.setActiveConversation(auth.userId, activeConversationMatch[1]);
        sendJson(response, 200, { conversation });
        return;
      }

      const conversationMatch = url.pathname.match(/^\/conversations\/([^/]+)$/);
      if (request.method === "PATCH" && conversationMatch?.[1]) {
        const body = updateConversationRequestSchema.parse(await readJson(request));
        const conversation = registry.updateConversation(auth.userId, conversationMatch[1], body);
        sendJson(response, 200, { conversation });
        return;
      }
      if (request.method === "DELETE" && conversationMatch?.[1]) {
        const conversation = registry.archiveConversation(auth.userId, conversationMatch[1]);
        sendJson(response, 200, { conversation });
        return;
      }

      const removeConversationAgentMatch = url.pathname.match(
        /^\/conversations\/([^/]+)\/agents\/([^/]+)$/,
      );
      if (
        request.method === "PATCH" &&
        removeConversationAgentMatch?.[1] &&
        removeConversationAgentMatch[2]
      ) {
        const body = updateConversationAgentSettingsRequestSchema.parse(await readJson(request));
        const participant = registry.updateConversationAgentSettings(
          auth.userId,
          removeConversationAgentMatch[1],
          removeConversationAgentMatch[2],
          body,
        );
        sendJson(response, 200, { participant });
        return;
      }
      if (
        request.method === "DELETE" &&
        removeConversationAgentMatch?.[1] &&
        removeConversationAgentMatch[2]
      ) {
        const participant = registry.removeAgentFromConversation(
          auth.userId,
          removeConversationAgentMatch[1],
          removeConversationAgentMatch[2],
        );
        sendJson(response, 200, { participant });
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
          ...(parsed.providerHealth ? { providerHealth: parsed.providerHealth } : {}),
          ...(parsed.memoryHealth ? { memoryHealth: parsed.memoryHealth } : {}),
          ...(parsed.claudeCodeDiscovery
            ? { claudeCodeDiscovery: parsed.claudeCodeDiscovery }
            : {}),
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
        sendJson(response, 200, {
          commands: registry.takeRuntimeCommands(auth.userId, runtimeDeviceId),
        });
        return;
      }

      if (request.method === "POST" && url.pathname === agentHubApiPaths.runtimeEvents) {
        const event = providerRuntimeEventSchema.parse(await readJson(request));
        registry.recordProviderRuntimeEvent(auth.userId, event);
        sendJson(response, 202, { ok: true });
        return;
      }

      if (
        request.method === "POST" &&
        url.pathname === agentHubApiPaths.runtimeConnectionCheckResults
      ) {
        const result = runtimeConnectionCheckResultSchema.parse(await readJson(request));
        registry.recordRuntimeConnectionCheckResult(auth.userId, {
          runtimeDeviceId: result.runtimeDeviceId,
          ...(result.providerHealth ? { providerHealth: result.providerHealth } : {}),
          ...(result.memoryHealth ? { memoryHealth: result.memoryHealth } : {}),
          ...(result.claudeCodeDiscovery
            ? { claudeCodeDiscovery: result.claudeCodeDiscovery }
            : {}),
        });
        sendJson(response, 202, { ok: true });
        return;
      }

      if (request.method === "POST" && url.pathname === agentHubApiPaths.runs) {
        const body = createLocalRunRequestSchema.parse(await readJson(request));
        const claudeCode = body.claudeCode as ClaudeCodeRunOptions | undefined;
        const run = registry.createRun(
          auth.userId,
          {
            workspaceId: body.workspaceId,
            ...(body.projectId ? { projectId: body.projectId } : {}),
            conversationId: body.conversationId,
            agentId: body.agentId,
            prompt: body.prompt,
            ...(body.planId ? { planId: body.planId } : {}),
            ...(claudeCode ? { claudeCode } : {}),
          },
          options.providerMode ?? "claude-code",
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

export { DesktopRuntimeControlPlaneClient } from "./control-plane-client.js";
export { AgentMemoryClient } from "./agent-memory-client.js";
export type {
  AgentMemoryContextInput,
  AgentMemoryObservationInput,
  AgentMemoryRuntimeClient,
} from "./agent-memory-client.js";
export type { RuntimeRegistrationInput } from "./control-plane-client.js";
export {
  createRuntimeRegistrationPayload,
  readDesktopRuntimeConfig,
} from "./config.js";
export { checkClaudeCodeProviderHealth } from "./provider-health.js";
export { ClaudeCodeProviderAdapter } from "./claude-code-provider-adapter.js";
export type { DesktopRuntimeProcessConfig } from "./config.js";
export { readDiffSummary, readWorkspaceGitMetadata } from "./git.js";
export { DesktopRuntime } from "./runtime.js";
export type { DesktopRuntimeConfig, LocalWorkspaceRegistration } from "./runtime.js";
export { SmokeProviderAdapter } from "./smoke-provider-adapter.js";
import { DesktopRuntime } from "./runtime.js";
export type {
  AgentRunHandle,
  AgentRunRequest,
  ProviderAdapter,
  RuntimeEventSink,
} from "./provider-adapter.js";

export const desktopRuntime = {
  deviceName: process.env.AGENTHUB_RUNTIME_DEVICE_NAME ?? "AgentHub Desktop Runtime",
  heartbeatSeconds: Number.parseInt(process.env.AGENTHUB_RUNTIME_HEARTBEAT_SECONDS ?? "15", 10),
};

if (process.env.AGENTHUB_DESKTOP_RUNTIME_ENTRY === "1") {
  const { readDesktopRuntimeConfig, createRuntimeRegistrationPayload } = await import("./config.js");
  const { SmokeProviderAdapter } = await import("./smoke-provider-adapter.js");
  const { ClaudeCodeProviderAdapter } = await import("./claude-code-provider-adapter.js");
  const { checkClaudeCodeProviderHealth } = await import("./provider-health.js");
  const { AgentMemoryClient } = await import("./agent-memory-client.js");
  const config = readDesktopRuntimeConfig();
  const memoryClient = new AgentMemoryClient({
    enabled: config.agentMemory.enabled,
    baseUrl: config.agentMemory.url,
    viewerUrl: config.agentMemory.viewerUrl,
    timeoutMs: config.agentMemory.timeoutMs,
    ...(config.agentMemory.secret ? { secret: config.agentMemory.secret } : {}),
  });
  const runtime = new DesktopRuntime(
    {
      authToken: config.authToken,
      controlPlaneUrl: config.controlPlaneUrl,
      deviceName: config.deviceName,
      heartbeatSeconds: config.heartbeatSeconds,
    },
    [
      new SmokeProviderAdapter(),
      new ClaudeCodeProviderAdapter({
        binaryPath: config.claudeCodeBin,
      }),
    ],
    { memoryClient },
  );
  const [providerHealth, memoryHealth] = await Promise.all([
    checkClaudeCodeProviderHealth({
      providerMode: config.providerMode,
      binaryPath: config.claudeCodeBin,
    }),
    memoryClient.checkHealth(),
  ]);
  const registration = await createRuntimeRegistrationPayload(config, { providerHealth, memoryHealth });
  const device = await runtime.registerDevice(registration);
  console.log(`[desktop-runtime] registered ${device.id} workspace=${registration.workspace.displayName}`);

  const heartbeat = setInterval(() => {
    void runtime.sendHeartbeat(device.id).catch((error: unknown) => {
      console.error("[desktop-runtime] heartbeat failed", error);
    });
  }, config.heartbeatSeconds * 1000);

  const poll = setInterval(() => {
    void runtime
      .pollAndHandleCommands(device.id)
      .catch((error: unknown) => {
        console.error("[desktop-runtime] command poll failed", error);
      });
  }, config.pollSeconds * 1000);

  const shutdown = async () => {
    clearInterval(heartbeat);
    clearInterval(poll);
    await runtime.markOffline(device.id).catch(() => undefined);
    process.exit(0);
  };
  process.on("SIGINT", () => void shutdown());
  process.on("SIGTERM", () => void shutdown());
}

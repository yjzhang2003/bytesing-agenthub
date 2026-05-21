export { DesktopRuntimeControlPlaneClient } from "./control-plane-client.js";
export type { RuntimeRegistrationInput } from "./control-plane-client.js";
export {
  createRuntimeRegistrationPayload,
  readDesktopRuntimeConfig,
} from "./config.js";
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
  const config = readDesktopRuntimeConfig();
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
        binaryPath: process.env.AGENTHUB_CLAUDE_CODE_BIN ?? "claude",
      }),
    ],
  );
  const registration = await createRuntimeRegistrationPayload(config);
  const device = await runtime.registerDevice(registration);
  console.log(`[desktop-runtime] registered ${device.id} workspace=${registration.workspace.displayName}`);

  const heartbeat = setInterval(() => {
    void runtime.sendHeartbeat(device.id).catch((error: unknown) => {
      console.error("[desktop-runtime] heartbeat failed", error);
    });
  }, config.heartbeatSeconds * 1000);

  const poll = setInterval(() => {
    void runtime
      .pollCommands(device.id)
      .then(async (commands: readonly import("@agenthub/contracts").RuntimeCommand[]) => {
        for (const command of commands) {
          await runtime.handleCommand(command);
        }
      })
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

export { DesktopRuntimeControlPlaneClient } from "./control-plane-client.js";
export type { RuntimeRegistrationInput } from "./control-plane-client.js";
export { readDiffSummary, readWorkspaceGitMetadata } from "./git.js";
export { DesktopRuntime } from "./runtime.js";
export type { DesktopRuntimeConfig, LocalWorkspaceRegistration } from "./runtime.js";
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

export interface DesktopShellConfig {
  readonly controlPlaneUrl: string;
  readonly startsRuntime: boolean;
  readonly webUrl: string;
}

export function readDesktopShellConfig(env: NodeJS.ProcessEnv = process.env): DesktopShellConfig {
  return {
    controlPlaneUrl: env.AGENTHUB_CONTROL_PLANE_URL ?? "http://127.0.0.1:5310",
    startsRuntime: true,
    webUrl: env.AGENTHUB_WEB_URL ?? "http://127.0.0.1:5173",
  };
}

export const defaultDesktopShellConfig: DesktopShellConfig = readDesktopShellConfig();

export function getRuntimeStartupSummary(): string {
  const deviceName = process.env.AGENTHUB_RUNTIME_DEVICE_NAME ?? "AgentHub Desktop Runtime";
  const heartbeatSeconds = Number.parseInt(
    process.env.AGENTHUB_RUNTIME_HEARTBEAT_SECONDS ?? "15",
    10,
  );
  return `${deviceName} heartbeat=${heartbeatSeconds}s`;
}

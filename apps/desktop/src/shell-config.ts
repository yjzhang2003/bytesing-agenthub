export interface DesktopShellConfig {
  readonly controlPlaneUrl: string;
  readonly startsRuntime: boolean;
  readonly webUrl: string;
}

export const defaultDesktopShellConfig: DesktopShellConfig = {
  controlPlaneUrl: process.env.AGENTHUB_CONTROL_PLANE_URL ?? "http://127.0.0.1:5310",
  startsRuntime: true,
  webUrl: process.env.AGENTHUB_WEB_URL ?? "http://127.0.0.1:5173",
};

export function getRuntimeStartupSummary(): string {
  const deviceName = process.env.AGENTHUB_RUNTIME_DEVICE_NAME ?? "AgentHub Desktop Runtime";
  const heartbeatSeconds = Number.parseInt(process.env.AGENTHUB_RUNTIME_HEARTBEAT_SECONDS ?? "15", 10);
  return `${deviceName} heartbeat=${heartbeatSeconds}s`;
}

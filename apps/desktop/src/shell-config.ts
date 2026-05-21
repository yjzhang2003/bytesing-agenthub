import { desktopRuntime } from "@agenthub/desktop-runtime";

export interface DesktopShellConfig {
  readonly controlPlaneUrl: string;
  readonly startsRuntime: boolean;
  readonly webUrl: string;
}

export const defaultDesktopShellConfig: DesktopShellConfig = {
  controlPlaneUrl: process.env.AGENTHUB_CONTROL_PLANE_URL ?? "http://127.0.0.1:4310",
  startsRuntime: true,
  webUrl: process.env.AGENTHUB_WEB_URL ?? "http://127.0.0.1:5173",
};

export function getRuntimeStartupSummary(): string {
  return `${desktopRuntime.deviceName} heartbeat=${desktopRuntime.heartbeatSeconds}s`;
}

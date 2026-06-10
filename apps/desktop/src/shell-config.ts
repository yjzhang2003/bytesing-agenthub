import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

export interface DesktopShellConfig {
  readonly controlPlaneUrl: string;
  readonly startsRuntime: boolean;
  readonly webUrl: string;
}

interface DesktopReleaseConfig {
  readonly controlPlaneUrl?: string;
  readonly webUrl?: string;
}

export function readDesktopShellConfig(
  env: NodeJS.ProcessEnv = process.env,
  options: { readonly releaseConfigPath?: string } = {},
): DesktopShellConfig {
  const releaseConfig = readDesktopReleaseConfig(
    options.releaseConfigPath ?? join(dirname(fileURLToPath(import.meta.url)), "release-config.json"),
  );
  return {
    controlPlaneUrl:
      env.AGENTHUB_CONTROL_PLANE_URL ?? releaseConfig.controlPlaneUrl ?? "http://127.0.0.1:5310",
    startsRuntime: true,
    webUrl: env.AGENTHUB_WEB_URL ?? releaseConfig.webUrl ?? "http://127.0.0.1:5173",
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

function readDesktopReleaseConfig(configPath: string): DesktopReleaseConfig {
  if (!existsSync(configPath)) {
    return {};
  }
  const parsed = JSON.parse(readFileSync(configPath, "utf8")) as DesktopReleaseConfig;
  validateReleaseUrl("AGENTHUB_CONTROL_PLANE_URL", parsed.controlPlaneUrl);
  validateReleaseUrl("AGENTHUB_WEB_URL", parsed.webUrl);
  return parsed;
}

function validateReleaseUrl(name: string, value: string | undefined): void {
  if (!value) {
    return;
  }
  const url = new URL(value);
  if (["127.0.0.1", "localhost", "::1"].includes(url.hostname)) {
    throw new Error(`${name} in packaged desktop release config must not use localhost.`);
  }
  if (url.protocol !== "https:") {
    throw new Error(`${name} in packaged desktop release config must use https.`);
  }
}

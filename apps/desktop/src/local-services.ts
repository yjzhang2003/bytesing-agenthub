import { spawn, type ChildProcessWithoutNullStreams } from "node:child_process";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { logDesktopError, logDesktopInfo } from "./desktop-log.js";
import type { DesktopShellConfig } from "./shell-config.js";

export interface DesktopBundlePaths {
  readonly bundleRoot: string;
  readonly controlPlaneEntryPath: string;
  readonly runtimeEntryPath: string;
  readonly webIndexPath: string;
}

export interface DesktopLocalServices {
  readonly controlPlane: ChildProcessWithoutNullStreams;
  readonly runtime: ChildProcessWithoutNullStreams;
  readonly stop: () => void;
}

type DesktopServiceEntry = "control-plane" | "runtime";

export function resolveDesktopBundlePaths(resourcesPath: string): DesktopBundlePaths {
  const bundleRoot = join(resourcesPath, "bundle");
  return {
    bundleRoot,
    controlPlaneEntryPath: join(bundleRoot, "services", "control-plane", "index.js"),
    runtimeEntryPath: join(bundleRoot, "runtimes", "desktop", "index.js"),
    webIndexPath: join(bundleRoot, "web", "index.html"),
  };
}

export function createDesktopServiceEnvironment(input: {
  readonly config: DesktopShellConfig;
  readonly entry: DesktopServiceEntry;
  readonly env?: NodeJS.ProcessEnv;
}): NodeJS.ProcessEnv {
  const env = { ...(input.env ?? process.env) };
  delete env.AGENTHUB_WEB_URL;
  delete env.AGENTHUB_CONTROL_PLANE_ENTRY;
  delete env.AGENTHUB_DESKTOP_RUNTIME_ENTRY;
  return {
    ...env,
    AGENTHUB_AUTH_MODE: "supabase",
    AGENTHUB_CONTROL_PLANE_URL: input.config.controlPlaneUrl,
    AGENTHUB_DESKTOP_LOCAL_AUTH: "1",
    ELECTRON_RUN_AS_NODE: "1",
    ...(input.entry === "control-plane"
      ? { AGENTHUB_CONTROL_PLANE_ENTRY: "1" }
      : { AGENTHUB_DESKTOP_RUNTIME_ENTRY: "1" }),
  };
}

export async function startDesktopLocalServices(input: {
  readonly config: DesktopShellConfig;
  readonly requireBundle: boolean;
  readonly resourcesPath: string;
}): Promise<DesktopLocalServices | null> {
  if (!input.config.startsRuntime) {
    return null;
  }

  const paths = resolveDesktopBundlePaths(input.resourcesPath);
  if (!existsSync(paths.controlPlaneEntryPath) || !existsSync(paths.runtimeEntryPath)) {
    const message = `[desktop] local service bundle is missing at ${paths.bundleRoot}`;
    if (input.requireBundle) {
      throw new Error(message);
    }
    logDesktopInfo(`${message}; assuming external development services`);
    return null;
  }

  const controlPlane = spawnDesktopService(paths.controlPlaneEntryPath, "control-plane", input.config);
  await waitForControlPlane(input.config.controlPlaneUrl);
  const runtime = spawnDesktopService(paths.runtimeEntryPath, "runtime", input.config);

  return {
    controlPlane,
    runtime,
    stop() {
      runtime.kill();
      controlPlane.kill();
    },
  };
}

function spawnDesktopService(
  entryPath: string,
  entry: DesktopServiceEntry,
  config: DesktopShellConfig,
): ChildProcessWithoutNullStreams {
  const child = spawn(process.execPath, [entryPath], {
    env: createDesktopServiceEnvironment({ config, entry }),
    stdio: "pipe",
  });
  child.stdout.on("data", (chunk: Buffer) => {
    logDesktopInfo(`[desktop:${entry}] ${chunk.toString("utf8").trim()}`);
  });
  child.stderr.on("data", (chunk: Buffer) => {
    logDesktopError(`[desktop:${entry}] ${chunk.toString("utf8").trim()}`);
  });
  child.on("exit", (code, signal) => {
    logDesktopInfo(`[desktop:${entry}] exited code=${code ?? "null"} signal=${signal ?? "null"}`);
  });
  return child;
}

async function waitForControlPlane(baseUrl: string): Promise<void> {
  const deadline = Date.now() + 10_000;
  let lastError = "not ready";
  while (Date.now() < deadline) {
    try {
      const response = await fetch(`${baseUrl.replace(/\/$/, "")}/health`);
      if (response.ok) {
        return;
      }
      lastError = `HTTP ${response.status}`;
    } catch (error) {
      lastError = error instanceof Error ? error.message : String(error);
    }
    await new Promise((resolve) => setTimeout(resolve, 200));
  }
  throw new Error(`Timed out waiting for local Control Plane at ${baseUrl}: ${lastError}`);
}

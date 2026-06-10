import { app, BrowserWindow } from "electron";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { logDesktopError, logDesktopInfo } from "./desktop-log.js";
import {
  flushPendingDesktopAuthCallbackUrls,
  registerAuthIpcHandlers,
  registerDesktopAuthCallbackHandlers,
} from "./auth-ipc.js";
import { registerProjectIpcHandlers } from "./project-ipc.js";
import { defaultDesktopShellConfig, type DesktopShellConfig } from "./shell-config.js";
import { loadDesktopWebUrl } from "./window-loader.js";

export { defaultDesktopShellConfig, getRuntimeStartupSummary } from "./shell-config.js";
export type { DesktopShellConfig } from "./shell-config.js";

export async function createAgentHubWindow(
  config: DesktopShellConfig = defaultDesktopShellConfig,
): Promise<BrowserWindow> {
  if (!config.controlPlaneUrl) {
    throw new Error("AGENTHUB_CONTROL_PLANE_URL is required");
  }
  if (!config.webUrl) {
    throw new Error("AGENTHUB_WEB_URL is required");
  }
  const window = new BrowserWindow({
    height: 900,
    show: false,
    title: "AgentHub",
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      preload: join(dirname(fileURLToPath(import.meta.url)), "preload.cjs"),
    },
    width: 1280,
  });

  window.webContents.on("console-message", (event) => {
    const details = event as unknown as {
      readonly lineNumber?: number;
      readonly message?: string;
      readonly sourceId?: string;
    };
    const message = details.message ?? "";
    if (message.includes("Unable to load preload script") || message.includes("agentHubDesktop")) {
      logDesktopError(
        `[desktop] renderer diagnostic ${details.sourceId ?? "renderer"}:${details.lineNumber ?? 0} ${message}`,
      );
    }
  });
  window.once("ready-to-show", () => {
    logDesktopInfo("[desktop] window ready to show");
    window.show();
    window.focus();
  });
  window.webContents.on("did-finish-load", () => {
    logDesktopInfo(`[desktop] loaded ${window.webContents.getURL()}`);
    void window.webContents
      .executeJavaScript(
        "Boolean(window.agentHubDesktop && window.agentHubDesktop.getCapabilities)",
      )
      .then((hasBridge: boolean) => {
        if (!hasBridge) {
          logDesktopError(
            "[desktop] native capability bridge is unavailable; Desktop-only actions will be hidden",
          );
        }
      })
      .catch((error: unknown) => {
        const message = error instanceof Error ? error.message : String(error);
        logDesktopError(`[desktop] capability bridge check failed: ${message}`);
      });
    flushPendingDesktopAuthCallbackUrls(window);
  });

  logDesktopInfo(`[desktop] loading ${config.webUrl}`);
  await loadDesktopWebUrl(window, config);
  if (!window.isVisible()) {
    window.show();
    window.focus();
  }
  return window;
}

export async function startDesktopApp(): Promise<void> {
  logDesktopInfo("[desktop] waiting for Electron app readiness");
  if (!registerDesktopAuthCallbackHandlers({ app, BrowserWindow })) {
    return;
  }
  await app.whenReady();
  logDesktopInfo("[desktop] Electron app ready");
  await registerAuthIpcHandlers();
  await registerProjectIpcHandlers();
  await createAgentHubWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      void createAgentHubWindow();
    }
  });

  app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
      app.quit();
    }
  });
}

if (process.env.AGENTHUB_ELECTRON_ENTRY === "1") {
  void startDesktopApp().catch((error: unknown) => {
    const message = error instanceof Error ? (error.stack ?? error.message) : String(error);
    logDesktopError(`[desktop] startup failed\n${message}`);
    app.exit(1);
  });
}

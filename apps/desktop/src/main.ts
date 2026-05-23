import { app, BrowserWindow } from "electron";
import { logDesktopError, logDesktopInfo } from "./desktop-log.js";
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
    },
    width: 1280,
  });

  window.once("ready-to-show", () => {
    logDesktopInfo("[desktop] window ready to show");
    window.show();
    window.focus();
  });
  window.webContents.on("did-finish-load", () => {
    logDesktopInfo(`[desktop] loaded ${window.webContents.getURL()}`);
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
  await app.whenReady();
  logDesktopInfo("[desktop] Electron app ready");
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
    const message = error instanceof Error ? error.stack ?? error.message : String(error);
    logDesktopError(`[desktop] startup failed\n${message}`);
    app.exit(1);
  });
}

import { app, BrowserWindow } from "electron";
import { defaultDesktopShellConfig, type DesktopShellConfig } from "./shell-config.js";

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
    title: "AgentHub",
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
    },
    width: 1280,
  });

  await window.loadURL(config.webUrl);
  return window;
}

if (process.env.AGENTHUB_ELECTRON_ENTRY === "1") {
  await app.whenReady();
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

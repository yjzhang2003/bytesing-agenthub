const { contextBridge, ipcRenderer } = require("electron") as typeof import("electron");

interface DesktopCapabilityBridgeInfo {
  readonly version: "1.0.0";
  readonly capabilities: readonly ("project.choose-directory" | "project.create-default")[];
}

interface DesktopProjectRegistration {
  readonly source: "desktop-directory" | "desktop-default";
  readonly runtimeDeviceId: string;
  readonly displayName: string;
  readonly localPath: string;
  readonly localPathLabel: string;
  readonly gitBranch?: string | null | undefined;
  readonly gitBaseCommit?: string | null | undefined;
  readonly dirty?: boolean | undefined;
}

interface DesktopProjectSelection {
  readonly projectId: string;
  readonly desktopProjectRegistration: DesktopProjectRegistration;
}

type DesktopProjectActionResult =
  | {
      readonly status: "selected";
      readonly selection: DesktopProjectSelection;
    }
  | {
      readonly status: "cancelled";
    }
  | {
      readonly status: "error";
      readonly message: string;
    };

const bridgeInfo: DesktopCapabilityBridgeInfo = {
  version: "1.0.0",
  capabilities: ["project.choose-directory", "project.create-default"],
};

const bridge = {
  getCapabilities: () => bridgeInfo,
  chooseProjectDirectory: () =>
    ipcRenderer.invoke("agenthub:choose-project-directory") as Promise<DesktopProjectActionResult>,
  createDefaultProject: () =>
    ipcRenderer.invoke("agenthub:create-default-project") as Promise<DesktopProjectActionResult>,
};

contextBridge.exposeInMainWorld("agentHubDesktop", bridge);

import type {
  contextBridge as ElectronContextBridge,
  ipcRenderer as ElectronIpcRenderer,
} from "electron";

// Electron preload runs as CommonJS because Electron loads this file before the ESM app entry.
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { contextBridge, ipcRenderer } = require("electron") as {
  contextBridge: typeof ElectronContextBridge;
  ipcRenderer: typeof ElectronIpcRenderer;
};

interface DesktopCapabilityBridgeInfo {
  readonly version: "1.0.0";
  readonly capabilities: readonly (
    | "project.choose-directory"
    | "project.create-default"
    | "auth.browser-login"
  )[];
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

type DesktopAuthActionResult =
  | { readonly status: "started" }
  | { readonly status: "signed-out" }
  | {
      readonly status: "completed";
      readonly callback: { readonly code: string; readonly state: string };
    }
  | { readonly status: "error"; readonly message: string };

const bridgeInfo: DesktopCapabilityBridgeInfo = {
  version: "1.0.0",
  capabilities: ["project.choose-directory", "project.create-default", "auth.browser-login"],
};

const bridge = {
  getCapabilities: () => bridgeInfo,
  chooseProjectDirectory: () =>
    ipcRenderer.invoke("agenthub:choose-project-directory") as Promise<DesktopProjectActionResult>,
  createDefaultProject: (displayName: string) =>
    ipcRenderer.invoke(
      "agenthub:create-default-project",
      displayName,
    ) as Promise<DesktopProjectActionResult>,
  completeAuthCallback: (callbackUrl: string) =>
    ipcRenderer.invoke(
      "agenthub:auth-complete-callback",
      callbackUrl,
    ) as Promise<DesktopAuthActionResult>,
  onAuthCallback: (handler: (callbackUrl: string) => void) => {
    const listener = (_event: unknown, callbackUrl: unknown): void => {
      if (typeof callbackUrl === "string") {
        handler(callbackUrl);
      }
    };
    ipcRenderer.on("agenthub:auth-callback", listener);
    return () => ipcRenderer.removeListener("agenthub:auth-callback", listener);
  },
  signOut: () => ipcRenderer.invoke("agenthub:auth-sign-out") as Promise<DesktopAuthActionResult>,
  startGitHubLogin: (authUrl: string) =>
    ipcRenderer.invoke("agenthub:auth-start-github", authUrl) as Promise<DesktopAuthActionResult>,
};

contextBridge.exposeInMainWorld("agentHubDesktop", bridge);

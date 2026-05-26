import type {
  DesktopCapabilityBridgeInfo,
  DesktopCapabilityId,
  DesktopProjectActionResult,
  DesktopProjectSelection,
} from "@agenthub/contracts";

export interface AgentHubDesktopBridge {
  readonly getCapabilities: () => DesktopCapabilityBridgeInfo;
  readonly chooseProjectDirectory: () => Promise<DesktopProjectActionResult>;
  readonly createDefaultProject: () => Promise<DesktopProjectActionResult>;
}

export interface AgentHubDesktopProjectActions {
  readonly capabilities: DesktopCapabilityBridgeInfo;
  readonly bridgeUnavailable: boolean;
  readonly chooseProjectDirectory?: (() => Promise<DesktopProjectSelection | null>) | undefined;
  readonly createDefaultProject?: (() => Promise<DesktopProjectSelection | null>) | undefined;
}

declare global {
  interface Window {
    readonly agentHubDesktop?: AgentHubDesktopBridge | undefined;
  }
}

export function getAgentHubDesktopBridge(): AgentHubDesktopBridge | null {
  if (typeof window === "undefined") {
    return null;
  }
  return window.agentHubDesktop ?? null;
}

export function getAgentHubDesktopCapabilities(): DesktopCapabilityBridgeInfo {
  const bridge = getAgentHubDesktopBridge();
  if (!bridge) {
    return { version: "1.0.0", capabilities: [] };
  }
  try {
    return bridge.getCapabilities();
  } catch {
    return { version: "1.0.0", capabilities: [] };
  }
}

export function createAgentHubDesktopProjectActions(): AgentHubDesktopProjectActions {
  const bridge = getAgentHubDesktopBridge();
  const capabilities = getAgentHubDesktopCapabilities();
  const isElectronRenderer =
    typeof navigator !== "undefined" && navigator.userAgent.includes("Electron/");
  if (!bridge) {
    return { bridgeUnavailable: isElectronRenderer, capabilities };
  }
  const hasCapability = (capability: DesktopCapabilityId) =>
    capabilities.capabilities.includes(capability);
  return {
    bridgeUnavailable: false,
    capabilities,
    ...(hasCapability("project.choose-directory")
      ? {
          chooseProjectDirectory: () => resolveDesktopProjectAction(bridge.chooseProjectDirectory()),
        }
      : {}),
    ...(hasCapability("project.create-default")
      ? {
          createDefaultProject: () => resolveDesktopProjectAction(bridge.createDefaultProject()),
        }
      : {}),
  };
}

async function resolveDesktopProjectAction(
  action: Promise<DesktopProjectActionResult>,
): Promise<DesktopProjectSelection | null> {
  const result = await action;
  if (result.status === "selected") {
    return result.selection;
  }
  if (result.status === "cancelled") {
    return null;
  }
  throw new Error(result.message);
}

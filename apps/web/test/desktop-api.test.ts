import { afterEach, describe, expect, it, vi } from "vitest";
import {
  createAgentHubDesktopProjectActions,
  getAgentHubDesktopCapabilities,
  type AgentHubDesktopBridge,
} from "../src/desktop-api.js";

describe("desktop bridge detection", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("returns no capabilities in a normal browser", () => {
    vi.stubGlobal("window", {});

    expect(getAgentHubDesktopCapabilities()).toEqual({
      version: "1.0.0",
      capabilities: [],
    });
    expect(createAgentHubDesktopProjectActions()).toEqual({
      bridgeUnavailable: false,
      capabilities: {
        version: "1.0.0",
        capabilities: [],
      },
    });
  });

  it("creates project actions only for discovered Desktop capabilities", async () => {
    const bridge: AgentHubDesktopBridge = {
      getCapabilities: () => ({
        version: "1.0.0",
        capabilities: ["project.choose-directory"],
      }),
      chooseProjectDirectory: async () => ({
        status: "selected",
        selection: {
          projectId: "project_desktop_1",
          desktopProjectRegistration: {
            source: "desktop-directory",
            runtimeDeviceId: "runtime_local_demo",
            displayName: "agenthub",
            localPath: "/tmp/agenthub",
            localPathLabel: "/tmp/agenthub",
          },
        },
      }),
      createDefaultProject: async () => ({ status: "cancelled" }),
    };
    vi.stubGlobal("window", {});
    Object.defineProperty(window, "agentHubDesktop", {
      configurable: true,
      value: bridge,
    });

    const actions = createAgentHubDesktopProjectActions();

    expect(actions.bridgeUnavailable).toBe(false);
    expect(actions.createDefaultProject).toBeUndefined();
    await expect(actions.chooseProjectDirectory?.()).resolves.toMatchObject({
      projectId: "project_desktop_1",
    });
  });

  it("maps cancelled and error action results for the workbench", async () => {
    const bridge: AgentHubDesktopBridge = {
      getCapabilities: () => ({
        version: "1.0.0",
        capabilities: ["project.choose-directory", "project.create-default"],
      }),
      chooseProjectDirectory: async () => ({ status: "cancelled" }),
      createDefaultProject: async () => ({
        status: "error",
        message: "Project path must be a directory",
      }),
    };
    vi.stubGlobal("window", {});
    Object.defineProperty(window, "agentHubDesktop", {
      configurable: true,
      value: bridge,
    });

    const actions = createAgentHubDesktopProjectActions();

    await expect(actions.chooseProjectDirectory?.()).resolves.toBeNull();
    await expect(actions.createDefaultProject?.("Broken project")).rejects.toThrow(
      "Project path must be a directory",
    );
  });

  it("passes default project names through the Desktop bridge", async () => {
    const bridge: AgentHubDesktopBridge = {
      getCapabilities: () => ({
        version: "1.0.0",
        capabilities: ["project.create-default"],
      }),
      chooseProjectDirectory: async () => ({ status: "cancelled" }),
      createDefaultProject: vi.fn(async (displayName: string) => ({
        status: "selected",
        selection: {
          projectId: "project_named",
          desktopProjectRegistration: {
            source: "desktop-default",
            runtimeDeviceId: "runtime_local_demo",
            displayName,
            localPath: `/tmp/${displayName}`,
            localPathLabel: `/tmp/${displayName}`,
          },
        },
      })),
    };
    vi.stubGlobal("window", {});
    Object.defineProperty(window, "agentHubDesktop", {
      configurable: true,
      value: bridge,
    });

    const actions = createAgentHubDesktopProjectActions();

    await expect(actions.createDefaultProject?.("API Client")).resolves.toMatchObject({
      desktopProjectRegistration: {
        displayName: "API Client",
        localPath: "/tmp/API Client",
      },
    });
    expect(bridge.createDefaultProject).toHaveBeenCalledWith("API Client");
  });
});

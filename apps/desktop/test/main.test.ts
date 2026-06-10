import { describe, expect, it } from "vitest";
import { mkdtemp, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import {
  defaultDesktopShellConfig,
  getRuntimeStartupSummary,
  readDesktopShellConfig,
} from "../src/shell-config.js";
import {
  createDesktopLoadFailureDataUrl,
  installDesktopLoadFailureHandler,
  loadDesktopWebUrl,
} from "../src/window-loader.js";
import {
  cancelledResult,
  registerLocalProject,
  resolveDefaultProjectPath,
  selectedResult,
  selectionFromRegistration,
  validateDesktopProjectActionResultOrThrow,
} from "../src/project-ipc.js";

describe("desktop shell config", () => {
  it("hosts the Web UI and starts runtime by default", () => {
    expect(defaultDesktopShellConfig.webUrl).toContain("127.0.0.1");
    expect(defaultDesktopShellConfig.startsRuntime).toBe(true);
    expect(getRuntimeStartupSummary()).toContain("heartbeat=");
  });

  it("reads release endpoints from environment configuration", () => {
    expect(
      readDesktopShellConfig({
        AGENTHUB_CONTROL_PLANE_URL: "https://api.agenthub.example",
        AGENTHUB_WEB_URL: "https://app.agenthub.example",
      }),
    ).toMatchObject({
      controlPlaneUrl: "https://api.agenthub.example",
      webUrl: "https://app.agenthub.example",
    });
  });

  it("reads release endpoints from a packaged desktop release config", async () => {
    const configDir = await mkdtemp(join(tmpdir(), "agenthub-release-config-"));
    const configPath = join(configDir, "release-config.json");
    await writeFile(
      configPath,
      JSON.stringify({
        controlPlaneUrl: "https://api.agenthub.example",
        webUrl: "https://app.agenthub.example",
      }),
    );

    expect(readDesktopShellConfig({}, { releaseConfigPath: configPath })).toMatchObject({
      controlPlaneUrl: "https://api.agenthub.example",
      webUrl: "https://app.agenthub.example",
    });
  });

  it("rejects localhost endpoints for packaged desktop release config", async () => {
    const configDir = await mkdtemp(join(tmpdir(), "agenthub-release-config-"));
    const configPath = join(configDir, "release-config.json");
    await writeFile(
      configPath,
      JSON.stringify({
        controlPlaneUrl: "http://127.0.0.1:5310",
        webUrl: "https://app.agenthub.example",
      }),
    );

    expect(() => readDesktopShellConfig({}, { releaseConfigPath: configPath })).toThrow(
      "must not use localhost",
    );
  });

  it("keeps the desktop window open with a diagnostic page when Web UI loading fails", async () => {
    const loaded: string[] = [];
    await loadDesktopWebUrl(
      {
        async loadURL() {
          throw new Error("ERR_CONNECTION_REFUSED");
        },
        async loadDataURL(url) {
          loaded.push(decodeURIComponent(url));
        },
      },
      defaultDesktopShellConfig,
    );

    expect(loaded[0]).toContain("AgentHub Web UI is not reachable");
    expect(loaded[0]).toContain("pnpm dev:web");
    expect(loaded[0]).toContain("ERR_CONNECTION_REFUSED");
  });

  it("escapes values in the desktop diagnostic page", () => {
    const url = createDesktopLoadFailureDataUrl(
      { ...defaultDesktopShellConfig, webUrl: "http://127.0.0.1:5173/?x=<script>" },
      "bad <value>",
    );

    expect(decodeURIComponent(url)).toContain("&lt;script&gt;");
    expect(decodeURIComponent(url)).toContain("bad &lt;value&gt;");
  });

  it("shows the diagnostic page when Electron reports renderer load failure", () => {
    const loaded: string[] = [];
    let listener:
      | ((
          event: unknown,
          errorCode: number,
          errorDescription: string,
          validatedURL: string,
        ) => void)
      | undefined;
    installDesktopLoadFailureHandler(
      {
        async loadURL() {
          return undefined;
        },
        async loadDataURL(url) {
          loaded.push(decodeURIComponent(url));
        },
        webContents: {
          on(_event, nextListener) {
            listener = nextListener;
          },
        },
      },
      defaultDesktopShellConfig,
    );

    listener?.({}, -102, "ERR_CONNECTION_REFUSED", defaultDesktopShellConfig.webUrl);

    expect(loaded[0]).toContain("AgentHub Web UI is not reachable");
    expect(loaded[0]).toContain("ERR_CONNECTION_REFUSED");
  });

  it("creates safe Desktop project action results from local directories", async () => {
    const projectPath = await mkdtemp(join(tmpdir(), "agenthub-desktop-project-"));
    const registration = await registerLocalProject({
      runtimeDeviceId: "runtime_local_demo",
      localPath: projectPath,
    });

    const result = selectedResult(selectionFromRegistration(registration));

    expect(result.status).toBe("selected");
    if (result.status === "selected") {
      expect(result.selection.projectId).toContain("project_desktop_");
      expect(result.selection.desktopProjectRegistration).toMatchObject({
        displayName: expect.stringContaining("agenthub-desktop-project-"),
        localPath: projectPath,
        localPathLabel: projectPath,
        runtimeDeviceId: "runtime_local_demo",
        source: "desktop-directory",
      });
    }
  });

  it("preserves Desktop project picker cancellation", () => {
    expect(cancelledResult()).toEqual({ status: "cancelled" });
  });

  it("uses the requested default project name as the managed folder name", () => {
    expect(resolveDefaultProjectPath("/Users/example/AgentHub/Default Project", "API Client")).toBe(
      "/Users/example/AgentHub/API Client",
    );
  });

  it("rejects invalid Desktop project action results before IPC returns them", () => {
    expect(() =>
      validateDesktopProjectActionResultOrThrow({
        status: "selected",
        selection: {
          projectId: "",
          desktopProjectRegistration: {
            source: "desktop-directory",
            runtimeDeviceId: "",
            displayName: "",
            localPath: "",
            localPathLabel: "",
          },
        },
      }),
    ).toThrow("selection metadata is required");
  });

  it("rejects local project registration for non-directory paths", async () => {
    const projectPath = await mkdtemp(join(tmpdir(), "agenthub-desktop-file-"));
    const filePath = join(projectPath, "not-a-directory.txt");
    await writeFile(filePath, "not a directory");

    await expect(
      registerLocalProject({
        runtimeDeviceId: "runtime_local_demo",
        localPath: filePath,
      }),
    ).rejects.toThrow("Project path must be a directory");
  });
});

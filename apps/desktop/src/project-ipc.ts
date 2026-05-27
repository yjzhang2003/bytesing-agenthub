import { createHash } from "node:crypto";
import { execFile } from "node:child_process";
import { mkdir, stat } from "node:fs/promises";
import { homedir } from "node:os";
import { basename, dirname, join } from "node:path";
import { promisify } from "node:util";
import { BrowserWindow, dialog, ipcMain, type OpenDialogOptions } from "electron";

const execFileAsync = promisify(execFile);

interface DesktopRuntimeProjectConfig {
  readonly deviceId: string;
  readonly defaultProjectPath: string;
}

interface WorkspaceGitMetadata {
  readonly branch: string | null;
  readonly baseCommit: string | null;
  readonly dirty: boolean;
}

export interface DesktopProjectRegistration {
  readonly source: "desktop-directory" | "desktop-default";
  readonly runtimeDeviceId: string;
  readonly displayName: string;
  readonly localPath: string;
  readonly localPathLabel: string;
  readonly gitBranch?: string | null | undefined;
  readonly gitBaseCommit?: string | null | undefined;
  readonly dirty?: boolean | undefined;
}

export interface DesktopProjectSelection {
  readonly projectId: string;
  readonly desktopProjectRegistration: DesktopProjectRegistration;
}

export type DesktopProjectActionResult =
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

function projectIdForRegistration(registration: DesktopProjectRegistration): string {
  const digest = createHash("sha1")
    .update(`${registration.source}:${registration.localPath}`)
    .digest("hex")
    .slice(0, 16);
  return `project_desktop_${digest}`;
}

function readDesktopRuntimeProjectConfig(): DesktopRuntimeProjectConfig {
  return {
    defaultProjectPath:
      process.env.AGENTHUB_DEFAULT_PROJECT_PATH ?? join(homedir(), "AgentHub", "Default Project"),
    deviceId: process.env.AGENTHUB_RUNTIME_DEVICE_ID ?? "runtime_local_demo",
  };
}

export function resolveDefaultProjectPath(defaultProjectPath: string, displayName: string): string {
  const folderName = displayName.trim();
  if (!folderName) {
    throw new Error("Project name is required");
  }
  if (folderName.includes("/") || folderName.includes("\\")) {
    throw new Error("Project name cannot contain path separators");
  }
  return join(dirname(defaultProjectPath), folderName);
}

export function selectionFromRegistration(
  registration: DesktopProjectRegistration,
): DesktopProjectSelection {
  return {
    desktopProjectRegistration: registration,
    projectId: projectIdForRegistration(registration),
  };
}

export function selectedResult(selection: DesktopProjectSelection): DesktopProjectActionResult {
  return validateDesktopProjectActionResultOrThrow({
    status: "selected",
    selection,
  });
}

export function cancelledResult(): DesktopProjectActionResult {
  return { status: "cancelled" };
}

export function errorResult(error: unknown): DesktopProjectActionResult {
  return validateDesktopProjectActionResultOrThrow({
    status: "error",
    message: error instanceof Error ? error.message : String(error),
  });
}

export function validateDesktopProjectActionResultOrThrow(
  value: DesktopProjectActionResult,
): DesktopProjectActionResult {
  if (value.status === "cancelled") {
    return value;
  }
  if (value.status === "error") {
    if (!value.message.trim()) {
      throw new Error("Invalid Desktop project action result: error message is required");
    }
    return value;
  }
  if (!value.selection.projectId || !value.selection.desktopProjectRegistration.displayName) {
    throw new Error("Invalid Desktop project action result: selection metadata is required");
  }
  const registration = value.selection.desktopProjectRegistration;
  if (
    (registration.source !== "desktop-directory" && registration.source !== "desktop-default") ||
    !registration.runtimeDeviceId ||
    !registration.localPath ||
    !registration.localPathLabel
  ) {
    throw new Error("Invalid Desktop project action result: project registration is incomplete");
  }
  return value;
}

export function registerProjectIpcHandlers(): void {
  ipcMain.handle("agenthub:choose-project-directory", async (event) => {
    try {
      const window = BrowserWindow.fromWebContents(event.sender) ?? undefined;
      const options: OpenDialogOptions = {
        buttonLabel: "Choose",
        properties: ["openDirectory", "createDirectory"],
        title: "Choose project folder",
      };
      const result = window
        ? await dialog.showOpenDialog(window, options)
        : await dialog.showOpenDialog(options);
      if (result.canceled || !result.filePaths[0]) {
        return cancelledResult();
      }
      const config = readDesktopRuntimeProjectConfig();
      const registration = await registerLocalProject({
        runtimeDeviceId: config.deviceId,
        localPath: result.filePaths[0],
      });
      return selectedResult(selectionFromRegistration(registration));
    } catch (error) {
      return errorResult(error);
    }
  });

  ipcMain.handle("agenthub:create-default-project", async (_event, displayName: unknown) => {
    try {
      const config = readDesktopRuntimeProjectConfig();
      const projectName = typeof displayName === "string" ? displayName.trim() : "";
      const defaultProjectPath = resolveDefaultProjectPath(config.defaultProjectPath, projectName);
      await mkdir(defaultProjectPath, { recursive: true });
      const registration = await registerLocalProject({
        displayName: projectName,
        runtimeDeviceId: config.deviceId,
        localPath: defaultProjectPath,
        source: "desktop-default",
      });
      return selectedResult(selectionFromRegistration(registration));
    } catch (error) {
      return errorResult(error);
    }
  });
}

export async function registerLocalProject(input: {
  readonly runtimeDeviceId: string;
  readonly localPath: string;
  readonly displayName?: string;
  readonly source?: "desktop-directory" | "desktop-default";
}): Promise<DesktopProjectRegistration> {
  const directory = await ensureReadableDirectory(input.localPath);
  const git = await readWorkspaceGitMetadata(directory);
  return {
    dirty: git.dirty,
    displayName: input.displayName?.trim() || basename(directory) || "Local project",
    gitBaseCommit: git.baseCommit,
    gitBranch: git.branch,
    localPath: directory,
    localPathLabel: directory,
    runtimeDeviceId: input.runtimeDeviceId,
    source: input.source ?? "desktop-directory",
  };
}

async function ensureReadableDirectory(localPath: string): Promise<string> {
  const stats = await stat(localPath);
  if (!stats.isDirectory()) {
    throw new Error("Project path must be a directory");
  }
  return localPath;
}

async function readWorkspaceGitMetadata(workspacePath: string): Promise<WorkspaceGitMetadata> {
  const [branch, baseCommit, status] = await Promise.all([
    gitOrNull(workspacePath, ["rev-parse", "--abbrev-ref", "HEAD"]),
    gitOrNull(workspacePath, ["rev-parse", "HEAD"]),
    gitOrNull(workspacePath, ["status", "--porcelain"]),
  ]);

  return {
    branch,
    baseCommit,
    dirty: Boolean(status),
  };
}

async function gitOrNull(cwd: string, args: readonly string[]): Promise<string | null> {
  try {
    const { stdout } = await execFileAsync("git", [...args], { cwd });
    return stdout.trim() || null;
  } catch {
    return null;
  }
}

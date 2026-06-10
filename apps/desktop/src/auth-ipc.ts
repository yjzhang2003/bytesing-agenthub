import { randomUUID } from "node:crypto";
import type { app, BrowserWindow, shell, ipcMain } from "electron";

const DESKTOP_AUTH_CALLBACK_PROTOCOL = "agenthub:";
const DESKTOP_AUTH_CALLBACK_CHANNEL = "agenthub:auth-callback";

interface DesktopAuthCallbackWindow {
  readonly isDestroyed: () => boolean;
  readonly show: () => void;
  readonly focus: () => void;
  readonly webContents: {
    readonly send: (channel: string, callbackUrl: string) => void;
  };
}

const pendingDesktopAuthCallbackUrls: string[] = [];

export interface DesktopOAuthStateStore {
  readonly current: () => string | null;
  readonly start: (state?: string) => string;
  readonly clear: () => void;
}

export function createDesktopOAuthStateStore(): DesktopOAuthStateStore {
  let activeState: string | null = null;
  return {
    current: () => activeState,
    start: (state = randomUUID()) => {
      activeState = state;
      return activeState;
    },
    clear: () => {
      activeState = null;
    },
  };
}

export function createDesktopGitHubOAuthUrl(input: {
  readonly redirectTo: string;
  readonly state: string;
  readonly supabaseUrl: string;
}): URL {
  const url = new URL("/auth/v1/authorize", input.supabaseUrl);
  url.searchParams.set("provider", "github");
  url.searchParams.set("redirect_to", input.redirectTo);
  url.searchParams.set("state", input.state);
  return url;
}

export function validateDesktopOAuthCallback(
  callbackUrl: string,
  stateStore: DesktopOAuthStateStore,
): { readonly code: string; readonly state: string } {
  const url = new URL(callbackUrl);
  const state = url.searchParams.get("state") ?? "";
  const code = url.searchParams.get("code") ?? "";
  if (!state || state !== stateStore.current()) {
    throw new Error("OAuth callback state does not match");
  }
  if (!code) {
    throw new Error("OAuth callback code is required");
  }
  stateStore.clear();
  return { code, state };
}

export function isDesktopAuthCallbackUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === DESKTOP_AUTH_CALLBACK_PROTOCOL && url.hostname === "auth";
  } catch {
    return false;
  }
}

export function extractDesktopAuthCallbackUrl(argv: readonly string[]): string | null {
  return argv.find((value) => isDesktopAuthCallbackUrl(value)) ?? null;
}

export function forwardDesktopAuthCallbackUrl(
  callbackUrl: string,
  windows: readonly DesktopAuthCallbackWindow[],
): void {
  const activeWindows = windows.filter((window) => !window.isDestroyed());
  if (activeWindows.length === 0) {
    pendingDesktopAuthCallbackUrls.push(callbackUrl);
    return;
  }
  for (const window of activeWindows) {
    window.webContents.send(DESKTOP_AUTH_CALLBACK_CHANNEL, callbackUrl);
    window.show();
    window.focus();
  }
}

export function flushPendingDesktopAuthCallbackUrls(window: DesktopAuthCallbackWindow): void {
  const pending = pendingDesktopAuthCallbackUrls.splice(0);
  for (const callbackUrl of pending) {
    forwardDesktopAuthCallbackUrl(callbackUrl, [window]);
  }
}

export function registerDesktopAuthCallbackHandlers(input: {
  readonly app: Pick<
    typeof app,
    "on" | "quit" | "requestSingleInstanceLock" | "setAsDefaultProtocolClient"
  >;
  readonly BrowserWindow: Pick<typeof BrowserWindow, "getAllWindows">;
}): boolean {
  const hasLock = input.app.requestSingleInstanceLock();
  if (!hasLock) {
    input.app.quit();
    return false;
  }
  input.app.setAsDefaultProtocolClient("agenthub");
  input.app.on("open-url", (event, callbackUrl) => {
    if (isDesktopAuthCallbackUrl(callbackUrl)) {
      event.preventDefault();
      forwardDesktopAuthCallbackUrl(callbackUrl, input.BrowserWindow.getAllWindows());
    }
  });
  input.app.on("second-instance", (_event, argv) => {
    const callbackUrl = extractDesktopAuthCallbackUrl(argv);
    if (callbackUrl) {
      forwardDesktopAuthCallbackUrl(callbackUrl, input.BrowserWindow.getAllWindows());
      return;
    }
    const [window] = input.BrowserWindow.getAllWindows().filter((candidate) => !candidate.isDestroyed());
    window?.show();
    window?.focus();
  });
  return true;
}

async function loadElectronAuthIpc(): Promise<{
  readonly ipcMain: typeof ipcMain;
  readonly shell: typeof shell;
}> {
  const electron = await import("electron");
  return { ipcMain: electron.ipcMain, shell: electron.shell };
}

export async function registerAuthIpcHandlers(
  stateStore = createDesktopOAuthStateStore(),
): Promise<void> {
  const { ipcMain, shell } = await loadElectronAuthIpc();
  ipcMain.handle("agenthub:auth-start-github", async (_event, authUrl: unknown) => {
    try {
      if (typeof authUrl !== "string") {
        throw new Error("GitHub OAuth URL is required");
      }
      const url = new URL(authUrl);
      if (url.protocol !== "https:" && url.protocol !== "http:") {
        throw new Error("GitHub OAuth URL must be an HTTP URL");
      }
      await shell.openExternal(url.toString());
      return { status: "started" };
    } catch (error) {
      return { status: "error", message: error instanceof Error ? error.message : String(error) };
    }
  });
  ipcMain.handle("agenthub:auth-complete-callback", async (_event, callbackUrl: unknown) => {
    try {
      if (typeof callbackUrl !== "string") {
        throw new Error("OAuth callback URL is required");
      }
      return {
        status: "completed",
        callback: validateDesktopOAuthCallback(callbackUrl, stateStore),
      };
    } catch (error) {
      return { status: "error", message: error instanceof Error ? error.message : String(error) };
    }
  });
  ipcMain.handle("agenthub:auth-sign-out", () => {
    stateStore.clear();
    return { status: "signed-out" };
  });
}

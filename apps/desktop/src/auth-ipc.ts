import { randomUUID } from "node:crypto";
import type { shell, ipcMain } from "electron";
import { readDesktopAuthConfig } from "./auth-config.js";

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
  ipcMain.handle("agenthub:auth-start-github", async () => {
    const config = readDesktopAuthConfig();
    if (!config.supabaseUrl) {
      return { status: "error", message: "VITE_SUPABASE_URL is required" };
    }
    const state = stateStore.start();
    const url = createDesktopGitHubOAuthUrl({
      redirectTo: process.env.AGENTHUB_DESKTOP_AUTH_CALLBACK_URL ?? "agenthub://auth/callback",
      state,
      supabaseUrl: config.supabaseUrl,
    });
    await shell.openExternal(url.toString());
    return { status: "started" };
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

import { logDesktopError } from "./desktop-log.js";
import type { DesktopShellConfig } from "./shell-config.js";

export interface LoadableDesktopWindow {
  readonly loadURL: (url: string) => Promise<void>;
  readonly loadFile?: (path: string) => Promise<void>;
  readonly loadDataURL?: (url: string) => Promise<void>;
  readonly webContents?: {
    readonly on: (
      event: "did-fail-load",
      listener: (
        event: unknown,
        errorCode: number,
        errorDescription: string,
        validatedURL: string,
      ) => void,
    ) => void;
  };
}

export async function loadDesktopWebUrl(
  window: LoadableDesktopWindow,
  config: DesktopShellConfig,
): Promise<void> {
  installDesktopLoadFailureHandler(window, config);
  try {
    await window.loadURL(config.webUrl);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logDesktopError(`[desktop] Failed to load ${config.webUrl}: ${message}`);
    if (!window.loadDataURL) {
      throw error;
    }
    await window.loadDataURL(createDesktopLoadFailureDataUrl(config, message));
  }
}

export function installDesktopLoadFailureHandler(
  window: LoadableDesktopWindow,
  config: DesktopShellConfig,
): void {
  let showingDiagnostic = false;
  window.webContents?.on("did-fail-load", (_event, errorCode, errorDescription, validatedURL) => {
    if (showingDiagnostic || validatedURL.startsWith("data:")) {
      return;
    }
    showingDiagnostic = true;
    const reason = `${errorDescription} (${errorCode})`;
    logDesktopError(`[desktop] Failed to load ${validatedURL || config.webUrl}: ${reason}`);
    void window.loadDataURL?.(createDesktopLoadFailureDataUrl(config, reason));
  });
}

export function createDesktopLoadFailureDataUrl(
  config: DesktopShellConfig,
  reason: string,
): string {
  const html = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>AgentHub Desktop</title>
    <style>
      body {
        margin: 0;
        min-height: 100vh;
        display: grid;
        place-items: center;
        background: #10110f;
        color: #f2f2ee;
        font: 14px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      }
      main {
        width: min(680px, calc(100vw - 48px));
        display: grid;
        gap: 12px;
      }
      code {
        padding: 2px 5px;
        border-radius: 4px;
        background: #282a26;
      }
      p {
        color: #bebfb7;
        line-height: 1.5;
      }
    </style>
  </head>
  <body>
    <main>
      <h1>AgentHub Web UI is not reachable</h1>
      <p>Desktop started, but it could not load <code>${escapeHtml(config.webUrl)}</code>.</p>
      <p>Start the Web client with <code>pnpm dev:web</code>, or set <code>AGENTHUB_WEB_URL</code> to a reachable AgentHub Web URL.</p>
      <p>Load error: <code>${escapeHtml(reason)}</code></p>
    </main>
  </body>
</html>`;
  return `data:text/html;charset=utf-8,${encodeURIComponent(html)}`;
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

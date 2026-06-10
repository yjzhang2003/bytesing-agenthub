import { describe, expect, it, vi } from "vitest";
import {
  createDesktopGitHubOAuthUrl,
  createDesktopOAuthStateStore,
  extractDesktopAuthCallbackUrl,
  forwardDesktopAuthCallbackUrl,
  validateDesktopOAuthCallback,
} from "../src/auth-ipc.js";

describe("desktop auth ipc", () => {
  it("creates a GitHub OAuth URL with Desktop callback and state", () => {
    const url = createDesktopGitHubOAuthUrl({
      redirectTo: "agenthub://auth/callback",
      state: "state_123",
      supabaseUrl: "https://example.supabase.co",
    });

    expect(url.origin).toBe("https://example.supabase.co");
    expect(url.pathname).toBe("/auth/v1/authorize");
    expect(url.searchParams.get("provider")).toBe("github");
    expect(url.searchParams.get("redirect_to")).toBe("agenthub://auth/callback");
    expect(url.searchParams.get("state")).toBe("state_123");
  });

  it("validates matching Desktop OAuth callback state", () => {
    const store = createDesktopOAuthStateStore();
    store.start("state_123");

    expect(
      validateDesktopOAuthCallback("agenthub://auth/callback?state=state_123&code=abc", store),
    ).toEqual({
      code: "abc",
      state: "state_123",
    });
  });

  it("rejects invalid Desktop OAuth callback state", () => {
    const store = createDesktopOAuthStateStore();
    store.start("state_123");

    expect(() =>
      validateDesktopOAuthCallback("agenthub://auth/callback?state=wrong&code=abc", store),
    ).toThrow("OAuth callback state does not match");
  });

  it("extracts Desktop OAuth callback URLs from second-instance arguments", () => {
    expect(
      extractDesktopAuthCallbackUrl([
        "/Applications/AgentHub.app/Contents/MacOS/AgentHub",
        "agenthub://auth/callback#access_token=jwt-token&refresh_token=refresh-token",
      ]),
    ).toBe("agenthub://auth/callback#access_token=jwt-token&refresh_token=refresh-token");
    expect(extractDesktopAuthCallbackUrl(["--flag", "https://example.com"])).toBeNull();
  });

  it("forwards Desktop OAuth callback URLs to renderer windows", () => {
    const send = vi.fn();
    const show = vi.fn();
    const focus = vi.fn();
    const window = {
      focus,
      isDestroyed: () => false,
      show,
      webContents: { send },
    };

    forwardDesktopAuthCallbackUrl("agenthub://auth/callback?code=abc", [window]);

    expect(send).toHaveBeenCalledWith("agenthub:auth-callback", "agenthub://auth/callback?code=abc");
    expect(show).toHaveBeenCalled();
    expect(focus).toHaveBeenCalled();
  });
});

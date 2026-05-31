import { describe, expect, it } from "vitest";
import {
  createDesktopGitHubOAuthUrl,
  createDesktopOAuthStateStore,
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
});

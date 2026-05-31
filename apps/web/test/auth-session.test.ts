import { describe, expect, it, vi } from "vitest";
import { agentHubLocalDefaults } from "@agenthub/contracts";
import type { Session } from "@supabase/supabase-js";
import {
  AuthenticationRequiredError,
  signInWithGitHub,
  signOutOfWebAuth,
  resolveWebControlPlaneClientOptions,
  sessionFromSupabase,
} from "../src/auth-session.js";

describe("web auth session", () => {
  it("returns an access token and user id from a Supabase session", () => {
    const session = {
      access_token: "jwt-token",
      user: { id: "user_123" },
    } as unknown as Session;

    expect(sessionFromSupabase(session)).toEqual({
      accessToken: "jwt-token",
      userId: "user_123",
    });
  });

  it("returns null when the Supabase session is missing token data", () => {
    expect(sessionFromSupabase(null)).toBeNull();
    expect(sessionFromSupabase({ user: { id: "user_123" } } as unknown as Session)).toBeNull();
  });

  it("uses a Supabase session token for production Control Plane calls", () => {
    expect(
      resolveWebControlPlaneClientOptions({
        env: {
          VITE_AGENTHUB_AUTH_MODE: "supabase",
          VITE_CONTROL_PLANE_URL: "https://api.agenthub.example",
        } as ImportMetaEnv,
        session: { accessToken: "jwt-token", userId: "user_123" },
      }),
    ).toEqual({
      accessToken: "jwt-token",
      baseUrl: "https://api.agenthub.example",
    });
  });

  it("requires a Supabase session in production auth mode", () => {
    expect(() =>
      resolveWebControlPlaneClientOptions({
        env: { VITE_AGENTHUB_AUTH_MODE: "supabase" } as ImportMetaEnv,
        session: null,
      }),
    ).toThrow(AuthenticationRequiredError);
  });

  it("preserves the local-demo token fallback", () => {
    expect(
      resolveWebControlPlaneClientOptions({ env: {} as ImportMetaEnv, session: null }),
    ).toEqual({
      accessToken: agentHubLocalDefaults.authToken,
      baseUrl: `http://127.0.0.1:${agentHubLocalDefaults.controlPlanePort}`,
    });
  });

  it("starts GitHub OAuth with Supabase and a redirect URL", async () => {
    const signInWithOAuth = vi.fn(async () => ({ data: {}, error: null }));
    await signInWithGitHub({
      redirectTo: "agenthub://auth/callback",
      supabase: { auth: { signInWithOAuth } },
    });

    expect(signInWithOAuth).toHaveBeenCalledWith({
      provider: "github",
      options: { redirectTo: "agenthub://auth/callback" },
    });
  });

  it("reports GitHub OAuth startup errors", async () => {
    await expect(
      signInWithGitHub({
        redirectTo: "https://app.agenthub.example/auth/callback",
        supabase: {
          auth: {
            signInWithOAuth: vi.fn(async () => ({
              data: {},
              error: { message: "provider disabled" },
            })),
          },
        },
      }),
    ).rejects.toThrow("provider disabled");
  });

  it("signs out through Supabase", async () => {
    const signOut = vi.fn(async () => ({ error: null }));
    await signOutOfWebAuth({ auth: { signOut } });

    expect(signOut).toHaveBeenCalled();
  });
});

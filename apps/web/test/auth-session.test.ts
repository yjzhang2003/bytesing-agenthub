import { describe, expect, it, vi } from "vitest";
import { agentHubLocalDefaults } from "@agenthub/contracts";
import type { Session } from "@supabase/supabase-js";
import {
  AuthenticationRequiredError,
  defaultWebEmailAuthRedirectTo,
  defaultWebPasswordResetRedirectTo,
  requestEmailPasswordReset,
  signInWithEmailPassword,
  signInWithGitHub,
  signOutOfWebAuth,
  signUpWithEmailPassword,
  updateEmailPassword,
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

  it("signs in with an AgentHub email account", async () => {
    const signInWithPassword = vi.fn(async () => ({ data: {}, error: null }));
    await signInWithEmailPassword({
      email: "user@example.com",
      password: "correct-horse",
      supabase: { auth: { signInWithPassword } },
    });

    expect(signInWithPassword).toHaveBeenCalledWith({
      email: "user@example.com",
      password: "correct-horse",
    });
  });

  it("reports email sign-in errors without raw Supabase objects", async () => {
    await expect(
      signInWithEmailPassword({
        email: "user@example.com",
        password: "wrong-password",
        supabase: {
          auth: {
            signInWithPassword: vi.fn(async () => ({
              data: {},
              error: { message: "Invalid login credentials" },
            })),
          },
        },
      }),
    ).rejects.toThrow("Invalid login credentials");
  });

  it("signs up with an email redirect URL and returns active session state", async () => {
    const signUp = vi.fn(async () => ({
      data: {
        session: {
          access_token: "jwt-token",
          user: { id: "user_123" },
        } as unknown as Session,
      },
      error: null,
    }));
    await expect(
      signUpWithEmailPassword({
        email: "new@example.com",
        password: "correct-horse",
        redirectTo: "https://app.agenthub.example/auth/callback",
        supabase: { auth: { signUp } },
      }),
    ).resolves.toEqual({ status: "signed-in" });

    expect(signUp).toHaveBeenCalledWith({
      email: "new@example.com",
      password: "correct-horse",
      options: { emailRedirectTo: "https://app.agenthub.example/auth/callback" },
    });
  });

  it("reports confirmation-required signup when Supabase returns no session", async () => {
    await expect(
      signUpWithEmailPassword({
        email: "new@example.com",
        password: "correct-horse",
        redirectTo: "https://app.agenthub.example/auth/callback",
        supabase: {
          auth: {
            signUp: vi.fn(async () => ({
              data: { session: null },
              error: null,
            })),
          },
        },
      }),
    ).resolves.toEqual({ status: "confirmation-required", email: "new@example.com" });
  });

  it("requests password reset with an AgentHub-owned reset redirect URL", async () => {
    const resetPasswordForEmail = vi.fn(async () => ({ data: {}, error: null }));
    await requestEmailPasswordReset({
      email: "user@example.com",
      redirectTo: "https://app.agenthub.example/auth/reset-password",
      supabase: { auth: { resetPasswordForEmail } },
    });

    expect(resetPasswordForEmail).toHaveBeenCalledWith("user@example.com", {
      redirectTo: "https://app.agenthub.example/auth/reset-password",
    });
  });

  it("updates the current user's password from the recovery session", async () => {
    const updateUser = vi.fn(async () => ({ data: {}, error: null }));
    await updateEmailPassword({
      password: "new-correct-horse",
      supabase: { auth: { updateUser } },
    });

    expect(updateUser).toHaveBeenCalledWith({ password: "new-correct-horse" });
  });

  it("builds hosted email auth callback URLs from the web origin", () => {
    const location = { origin: "https://agenthub-staging.vercel.app" } as Location;

    expect(defaultWebEmailAuthRedirectTo(location)).toBe(
      "https://agenthub-staging.vercel.app/auth/callback",
    );
    expect(defaultWebPasswordResetRedirectTo(location)).toBe(
      "https://agenthub-staging.vercel.app/auth/reset-password",
    );
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

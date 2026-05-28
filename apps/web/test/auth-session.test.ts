import { describe, expect, it } from "vitest";
import { agentHubLocalDefaults } from "@agenthub/contracts";
import type { Session } from "@supabase/supabase-js";
import {
  AuthenticationRequiredError,
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
});

import { describe, expect, it } from "vitest";
import {
  classifyWebAuthError,
  resolveWebEntryView,
  webPathFromLocation,
} from "../src/auth-session.js";

describe("web auth routing", () => {
  it("routes anonymous users to homepage, login, or callback views", () => {
    expect(resolveWebEntryView({ authenticated: false, pathname: "/" })).toBe("homepage");
    expect(resolveWebEntryView({ authenticated: false, pathname: "/login" })).toBe("login");
    expect(resolveWebEntryView({ authenticated: false, pathname: "/auth/callback" })).toBe(
      "auth-callback",
    );
    expect(resolveWebEntryView({ authenticated: false, pathname: "/auth/reset-password" })).toBe(
      "auth-reset-password",
    );
  });

  it("routes signed-in users away from public auth pages into the workbench", () => {
    expect(resolveWebEntryView({ authenticated: true, pathname: "/" })).toBe("workbench");
    expect(resolveWebEntryView({ authenticated: true, pathname: "/login" })).toBe("workbench");
    expect(resolveWebEntryView({ authenticated: true, pathname: "/auth/callback" })).toBe(
      "auth-callback",
    );
    expect(resolveWebEntryView({ authenticated: true, pathname: "/auth/reset-password" })).toBe(
      "workbench",
    );
  });

  it("extracts browser paths without query or hash callback data", () => {
    expect(
      webPathFromLocation({
        hash: "#access_token=token",
        pathname: "/auth/callback",
        search: "?code=abc",
      }),
    ).toBe("/auth/callback");
    expect(
      webPathFromLocation({
        hash: "#type=recovery",
        pathname: "/auth/reset-password",
        search: "?code=abc",
      }),
    ).toBe("/auth/reset-password");
  });

  it("distinguishes missing sessions from post-login Control Plane failures", () => {
    expect(classifyWebAuthError(new Error("Authentication is required to access AgentHub."))).toBe(
      "session-required",
    );
    expect(classifyWebAuthError(new Error("Control plane request failed: 404"))).toBe(
      "control-plane",
    );
    expect(classifyWebAuthError(new Error("provider disabled"))).toBe("oauth");
  });
});

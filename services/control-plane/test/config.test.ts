import { describe, expect, it } from "vitest";
import { readControlPlaneConfig } from "../src/config.js";

describe("readControlPlaneConfig", () => {
  it("keeps local-demo mode usable without Supabase secrets", () => {
    const config = readControlPlaneConfig({});

    expect(config.authMode).toBe("local-demo");
    expect(config.jwtSecret).toBe("dev-only-secret");
  });

  it("allows Supabase mode without embedding a JWT secret", () => {
    const config = readControlPlaneConfig({ AGENTHUB_AUTH_MODE: "supabase" });

    expect(config.authMode).toBe("supabase");
    expect(config.jwtSecret).toBe("");
  });

  it("accepts Supabase mode with a JWT secret", () => {
    const config = readControlPlaneConfig({
      AGENTHUB_AUTH_MODE: "supabase",
      SUPABASE_JWT_SECRET: "secret",
    });

    expect(config.authMode).toBe("supabase");
    expect(config.jwtSecret).toBe("secret");
  });

  it("uses hosted platform network settings when PORT is provided", () => {
    const config = readControlPlaneConfig({
      CONTROL_PLANE_PORT: "5310",
      PORT: "10000",
    });

    expect(config.host).toBe("0.0.0.0");
    expect(config.port).toBe(10000);
  });
});

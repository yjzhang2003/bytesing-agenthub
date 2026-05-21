import { describe, expect, it } from "vitest";
import { readDesktopAuthConfig } from "../src/auth-config.js";

describe("desktop auth config", () => {
  it("reads Supabase auth config from environment", () => {
    expect(
      readDesktopAuthConfig({
        VITE_SUPABASE_ANON_KEY: "anon",
        VITE_SUPABASE_URL: "https://example.supabase.co",
      }),
    ).toEqual({
      supabaseAnonKey: "anon",
      supabaseUrl: "https://example.supabase.co",
    });
  });
});


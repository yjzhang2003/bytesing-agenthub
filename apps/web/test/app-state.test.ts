import { describe, expect, it } from "vitest";
import { agentHubLocalDefaults } from "@agenthub/contracts";
import { createDemoWorkspaceFlow } from "../src/app-state.js";
import { createDefaultWebControlPlaneClient } from "../src/control-plane-client.js";
import { readWebSupabaseConfig } from "../src/supabase.js";

describe("web app state", () => {
  it("creates a workspace-first authenticated demo flow", () => {
    const flow = createDemoWorkspaceFlow();
    expect(flow.state.authenticated).toBe(true);
    expect(flow.activeWorkspace.id).toBe(flow.state.activeWorkspaceId);
    expect(flow.state.agents.map((agent) => agent.displayName)).toContain("Orchestrator");
    expect(flow.state.pendingPermissions[0]?.status).toBe("pending");
    expect(flow.state.activeDiff?.files[0]?.path).toContain("packages/ui");
  });

  it("reads Supabase config from Vite env shape", () => {
    expect(
      readWebSupabaseConfig({
        VITE_SUPABASE_URL: "https://example.supabase.co",
        VITE_SUPABASE_ANON_KEY: "anon",
      } as ImportMetaEnv),
    ).toEqual({
      anonKey: "anon",
      url: "https://example.supabase.co",
    });
  });

  it("creates a default Control Plane client from Vite env shape", () => {
    const client = createDefaultWebControlPlaneClient({
      VITE_CONTROL_PLANE_URL: "http://127.0.0.1:4310",
      VITE_AGENTHUB_LOCAL_AUTH_TOKEN: agentHubLocalDefaults.authToken,
    } as ImportMetaEnv);

    expect(client).toBeTruthy();
  });
});

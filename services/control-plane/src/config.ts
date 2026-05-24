import {
  agentHubLocalDefaults,
  type AgentHubAuthMode,
  type AgentHubProviderMode,
} from "@agenthub/contracts";

export interface ControlPlaneConfig {
  readonly authMode: AgentHubAuthMode;
  readonly jwtSecret: string;
  readonly localAuthToken: string;
  readonly localUserId: string;
  readonly port: number;
  readonly providerMode: AgentHubProviderMode;
}

export function readControlPlaneConfig(
  env: NodeJS.ProcessEnv = process.env,
): ControlPlaneConfig {
  const authMode = env.AGENTHUB_AUTH_MODE === "supabase" ? "supabase" : "local-demo";
  const providerMode = env.AGENTHUB_PROVIDER_MODE === "smoke" ? "smoke" : "claude-code";

  return {
    authMode,
    jwtSecret: env.SUPABASE_JWT_SECRET ?? "dev-only-secret",
    localAuthToken: env.AGENTHUB_LOCAL_AUTH_TOKEN ?? agentHubLocalDefaults.authToken,
    localUserId: env.AGENTHUB_LOCAL_USER_ID ?? agentHubLocalDefaults.userId,
    port: Number.parseInt(
      env.CONTROL_PLANE_PORT ?? String(agentHubLocalDefaults.controlPlanePort),
      10,
    ),
    providerMode,
  };
}

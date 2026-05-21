export { CollaborationService } from "./collaboration.js";
export type { MentionRoute, PlanRecord, TaskAssignment } from "./collaboration.js";
export { DiffArtifactService } from "./diffs.js";
export type { FullDiffProvider, FullDiffResult } from "./diffs.js";
export { PermissionService } from "./permissions.js";
export type { PermissionCreateInput } from "./permissions.js";
export { AuthError, parseBearerToken, verifySupabaseJwt } from "./auth.js";
export { ControlPlaneEventBus } from "./events.js";
export { readControlPlaneConfig } from "./config.js";
export type { ControlPlaneConfig } from "./config.js";
export { createControlPlaneServer } from "./http.js";
export { ControlPlaneRegistry } from "./runtime-registry.js";
export type {
  CreateRunInput,
  RegisterRuntimeDeviceInput,
  WorkspaceBinding,
} from "./runtime-registry.js";

export const controlPlaneService = {
  name: "@agenthub/control-plane",
  port: Number.parseInt(process.env.CONTROL_PLANE_PORT ?? "5310", 10),
};

import { createControlPlaneServer } from "./http.js";

if (process.env.AGENTHUB_CONTROL_PLANE_ENTRY === "1") {
  const { readControlPlaneConfig } = await import("./config.js");
  const config = readControlPlaneConfig();
  const server = createControlPlaneServer({
    authMode: config.authMode,
    jwtSecret: config.jwtSecret,
    localAuthToken: config.localAuthToken,
    localUserId: config.localUserId,
    providerMode: config.providerMode,
  });
  server.listen(config.port, "127.0.0.1", () => {
    console.log(
      `[control-plane] listening on http://127.0.0.1:${config.port} auth=${config.authMode}`,
    );
  });
}

export { CollaborationService } from "./collaboration.js";
export type { MentionRoute, PlanRecord, TaskAssignment } from "./collaboration.js";
export { DiffArtifactService } from "./diffs.js";
export type { FullDiffProvider, FullDiffResult } from "./diffs.js";
export { PermissionService } from "./permissions.js";
export type { PermissionCreateInput } from "./permissions.js";
export { AuthError, parseBearerToken, verifySupabaseJwt } from "./auth.js";
export { ControlPlaneEventBus } from "./events.js";
export { createControlPlaneServer } from "./http.js";
export { ControlPlaneRegistry } from "./runtime-registry.js";
export type {
  CreateRunInput,
  RegisterRuntimeDeviceInput,
  WorkspaceBinding,
} from "./runtime-registry.js";

export const controlPlaneService = {
  name: "@agenthub/control-plane",
  port: Number.parseInt(process.env.CONTROL_PLANE_PORT ?? "4310", 10),
};

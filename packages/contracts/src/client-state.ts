import type {
  Agent,
  Conversation,
  DiffFileSummary,
  PermissionRequest,
  Project,
  RuntimeDevice,
  Run,
  Workspace,
} from "./domain.js";
import type { OrchestratorDispatchPlan } from "./schemas.js";

export interface AgentHubClientState {
  readonly authenticated: boolean;
  readonly activeWorkspaceId: string | null;
  readonly workspaces: readonly Workspace[];
  readonly projects: readonly Project[];
  readonly runtimeDevices: readonly RuntimeDevice[];
  readonly conversations: readonly Conversation[];
  readonly agents: readonly Agent[];
  readonly runs: readonly Run[];
  readonly pendingPermissions: readonly PermissionRequest[];
  readonly activePlan: OrchestratorDispatchPlan | null;
  readonly activeDiff: {
    readonly runId: string;
    readonly files: readonly DiffFileSummary[];
  } | null;
}

export const emptyAgentHubClientState: AgentHubClientState = {
  activeDiff: null,
  activePlan: null,
  activeWorkspaceId: null,
  agents: [],
  authenticated: false,
  conversations: [],
  pendingPermissions: [],
  projects: [],
  runtimeDevices: [],
  runs: [],
  workspaces: [],
};

import { z } from "zod";

export const idSchema = z.string().min(1);

export const dispatchPlanStepSchema = z.object({
  id: idSchema,
  title: z.string().min(1),
  assignedAgentId: idSchema,
  dependsOnStepIds: z.array(idSchema).default([]),
  expectedArtifacts: z.array(z.string().min(1)).default([]),
  riskNotes: z.array(z.string().min(1)).default([]),
});

export const orchestratorDispatchPlanSchema = z.object({
  id: idSchema,
  conversationId: idSchema,
  workspaceId: idSchema,
  goal: z.string().min(1),
  assumptions: z.array(z.string().min(1)).default([]),
  steps: z.array(dispatchPlanStepSchema).min(1),
  status: z.enum([
    "draft",
    "invalid",
    "approved",
    "revision-requested",
    "cancelled",
    "dispatched",
    "completed",
    "failed",
  ]),
});

export const providerRuntimeEventSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("provider.session"),
    runId: idSchema,
    agentId: idSchema,
    providerMode: z.literal("claude-code"),
    sessionId: idSchema,
  }),
  z.object({
    type: z.literal("message.delta"),
    runId: idSchema,
    agentId: idSchema,
    delta: z.string(),
  }),
  z.object({
    type: z.literal("run.status"),
    runId: idSchema,
    agentId: idSchema,
    status: z.enum([
      "queued",
      "running",
      "streaming",
      "blocked",
      "cancelling",
      "cancelled",
      "completed",
      "failed",
    ]),
    message: z.string().optional(),
  }),
  z.object({
    type: z.literal("permission.requested"),
    runId: idSchema,
    agentId: idSchema,
    actionKind: z.enum([
      "file.read",
      "file.write",
      "file.delete",
      "command.run",
      "network.access",
      "deploy.publish",
    ]),
    risk: z.enum(["low", "medium", "high"]),
    summary: z.string().min(1),
    command: z.string().nullable().optional(),
    paths: z.array(z.string()).default([]),
  }),
  z.object({
    type: z.literal("artifact.updated"),
    runId: idSchema,
    artifactId: idSchema,
  }),
]);

export const diffMetadataSchema = z.object({
  workspaceId: idSchema,
  runId: idSchema,
  baseCommit: z.string().nullable(),
  workingTreeFingerprint: z.string().min(1),
  changedFiles: z.array(
    z.object({
      path: z.string().min(1),
      status: z.enum(["added", "modified", "deleted", "renamed"]),
      insertions: z.number().int().min(0),
      deletions: z.number().int().min(0),
    }),
  ),
  cacheExpiresAt: z.string().datetime().nullable(),
});

export const serviceHealthSchema = z.object({
  ok: z.boolean(),
  service: z.string().min(1),
  version: z.string().min(1),
  mode: z.enum(["local-demo", "supabase"]),
  timestamp: z.string().datetime(),
  runtime: z
    .object({
      online: z.boolean(),
      deviceId: idSchema.nullable(),
      lastHeartbeatAt: z.string().datetime().nullable(),
      capabilities: z.array(z.string()),
    })
    .optional(),
});

export const workspaceMetadataSchema = z.object({
  workspaceId: idSchema,
  displayName: z.string().min(1),
  localPathLabel: z.string().min(1),
  gitBranch: z.string().nullable(),
  gitBaseCommit: z.string().nullable(),
  dirty: z.boolean(),
  providerCapabilities: z.array(z.string()),
});

export const projectMetadataSchema = z.object({
  projectId: idSchema,
  workspaceId: idSchema,
  displayName: z.string().min(1),
  runtimeDeviceId: idSchema,
  localPathLabel: z.string().min(1),
  gitBranch: z.string().nullable(),
  gitBaseCommit: z.string().nullable(),
  dirty: z.boolean(),
  isDefault: z.boolean(),
  lastUsedAt: z.string().datetime().nullable(),
});

export const providerHealthSchema = z.object({
  providerMode: z.enum(["smoke", "claude-code"]),
  status: z.enum(["connected", "missing", "unavailable", "misconfigured"]),
  binaryPathLabel: z.string().min(1),
  checkedAt: z.string().datetime(),
  failureReason: z.string().nullable(),
});

export const memoryHealthSchema = z.object({
  enabled: z.boolean(),
  status: z.enum(["connected", "disabled", "unavailable", "misconfigured"]),
  url: z.string().min(1),
  viewerUrl: z.string().min(1),
  checkedAt: z.string().datetime(),
  failureReason: z.string().nullable(),
});

export const claudeCodeDiscoverySummarySchema = z.object({
  binaryPathLabel: z.string().min(1),
  checkedAt: z.string().datetime(),
  profileRootLabel: z.string().min(1),
  plugins: z.array(
    z.object({
      name: z.string().min(1),
      version: z.string().nullable(),
      pathLabel: z.string().min(1),
    }),
  ),
  skills: z.array(
    z.object({
      name: z.string().min(1),
      description: z.string(),
      pluginName: z.string().min(1),
      pathLabel: z.string().min(1),
    }),
  ),
  mcpServers: z.array(
    z.object({
      name: z.string().min(1),
      transport: z.enum(["stdio", "http", "sse", "unknown"]),
    }),
  ),
  workspaceClaudeFiles: z.object({
    claudeDir: z.boolean(),
    settingsJson: z.boolean(),
    settingsLocalJson: z.boolean(),
    mcpJson: z.boolean(),
    claudeMd: z.boolean(),
  }),
});

export const agentMemoryConfigSchema = z.object({
  namespace: z.string().min(1),
  enabled: z.boolean(),
});

export const claudeCodeRunOptionsSchema = z.object({
  permissionPreset: z.enum(["plan-only", "ask-first", "auto-edits", "full-access"]).optional(),
  settingsSource: z.enum(["inherit", "managed", "isolated"]).optional(),
  runtimeProfileId: idSchema.nullable().optional(),
  mcpProfileId: idSchema.nullable().optional(),
  pluginProfileId: idSchema.nullable().optional(),
  hooksPolicy: z.enum(["inherit", "disabled", "enabled"]).optional(),
  allowedTools: z.array(z.string().min(1)).optional(),
  disallowedTools: z.array(z.string().min(1)).optional(),
  effort: z.enum(["low", "medium", "high", "xhigh", "max"]).optional(),
  session: z
    .object({
      behavior: z.enum(["new", "continue", "fork"]),
      sessionId: idSchema.nullable().optional(),
    })
    .optional(),
});

export const conversationAgentClaudeSessionSchema = z.object({
  id: idSchema,
  ownerUserId: idSchema,
  workspaceId: idSchema,
  conversationId: idSchema,
  agentId: idSchema,
  providerMode: z.literal("claude-code"),
  sessionId: idSchema.nullable(),
  lastRunId: idSchema.nullable(),
  claudeCode: claudeCodeRunOptionsSchema.omit({ effort: true, session: true }),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const collaborationAgentAvailabilitySchema = z.enum([
  "active",
  "idle",
  "blocked",
  "stale",
  "completed",
  "failed",
  "unavailable",
]);

export const collaborationAgentBackendSchema = z.enum([
  "claude-code",
  "codex",
  "opencode",
  "custom",
  "unknown",
]);

export const collaborationMentionPurposeSchema = z.enum([
  "discussion",
  "task-handoff",
  "review",
  "status-nudge",
  "user-question",
]);

export const collaborationTaskStatusSchema = z.enum([
  "pending",
  "in-progress",
  "blocked",
  "completed",
  "failed",
  "cancelled",
]);

export const collaborationHeartbeatStatusSchema = z.enum([
  "idle",
  "polling",
  "executing",
  "blocked",
  "shutdown",
  "unavailable",
]);

export const collaborationEventTypeSchema = z.enum([
  "agent.joined",
  "agent.removed",
  "mention.recorded",
  "task.created",
  "task.claimed",
  "task.blocked",
  "task.completed",
  "task.failed",
  "question.created",
  "question.answered",
  "openspec.projected",
  "openspec.projection_failed",
]);

export const collaborationOpenSpecArtifactSchema = z.enum([
  "proposal",
  "design",
  "tasks",
  "spec",
]);

export const collaborationProjectionStatusSchema = z.enum([
  "pending",
  "projected",
  "failed",
  "skipped",
]);

export const collaborationAgentRosterEntrySchema = z.object({
  id: idSchema,
  ownerUserId: idSchema,
  workspaceId: idSchema,
  projectId: idSchema,
  conversationId: idSchema,
  agentId: idSchema,
  displayName: z.string().min(1),
  role: z.enum(["orchestrator", "worker"]),
  capabilities: z.array(z.string().min(1)),
  backend: collaborationAgentBackendSchema,
  availability: collaborationAgentAvailabilitySchema,
  currentTaskId: idSchema.nullable(),
  removedAt: z.string().datetime().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const collaborationMentionMessageSchema = z.object({
  id: idSchema,
  ownerUserId: idSchema,
  workspaceId: idSchema,
  projectId: idSchema,
  conversationId: idSchema,
  fromKind: z.enum(["user", "agent", "system"]),
  fromId: idSchema,
  toKind: z.enum(["agent", "user"]),
  toId: idSchema,
  purpose: collaborationMentionPurposeSchema,
  content: z.string().min(1),
  taskId: idSchema.nullable(),
  questionId: idSchema.nullable(),
  createdAt: z.string().datetime(),
});

const collaborationTaskClaimSchema = z.object({
  token: idSchema,
  agentId: idSchema,
  leasedUntil: z.string().datetime(),
});

export const collaborationTaskSchema = z
  .object({
    id: idSchema,
    ownerUserId: idSchema,
    workspaceId: idSchema,
    projectId: idSchema,
    conversationId: idSchema,
    title: z.string().min(1),
    description: z.string(),
    status: collaborationTaskStatusSchema,
    assignedAgentId: idSchema,
    claim: collaborationTaskClaimSchema.nullable(),
    version: z.number().int().min(1),
    blockedByQuestionIds: z.array(idSchema),
    openspecChangeName: z.string().min(1).nullable(),
    resultSummary: z.string().nullable(),
    failureReason: z.string().nullable(),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
  })
  .refine((value) => value.status === "in-progress" || value.claim === null, {
    message: "Only in-progress collaboration tasks may have an active claim",
    path: ["claim"],
  })
  .refine((value) => value.status !== "completed" || value.resultSummary !== null, {
    message: "Completed collaboration tasks require a result summary",
    path: ["resultSummary"],
  })
  .refine((value) => value.status !== "failed" || value.failureReason !== null, {
    message: "Failed collaboration tasks require a failure reason",
    path: ["failureReason"],
  });

export const collaborationUserQuestionSchema = z
  .object({
    id: idSchema,
    ownerUserId: idSchema,
    workspaceId: idSchema,
    projectId: idSchema,
    conversationId: idSchema,
    requestingAgentId: idSchema,
    taskId: idSchema.nullable(),
    status: z.enum(["pending", "answered", "cancelled"]),
    prompt: z.string().min(1),
    answer: z.string().nullable(),
    answeredAt: z.string().datetime().nullable(),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
  })
  .refine((value) => value.status !== "answered" || value.answer !== null, {
    message: "Answered collaboration questions require an answer",
    path: ["answer"],
  })
  .refine((value) => value.status !== "answered" || value.answeredAt !== null, {
    message: "Answered collaboration questions require answeredAt",
    path: ["answeredAt"],
  });

export const collaborationHeartbeatSchema = z.object({
  id: idSchema,
  ownerUserId: idSchema,
  workspaceId: idSchema,
  projectId: idSchema,
  conversationId: idSchema,
  agentId: idSchema,
  status: collaborationHeartbeatStatusSchema,
  currentTaskId: idSchema.nullable(),
  lastSeenAt: z.string().datetime(),
});

export const collaborationEventSchema = z.object({
  id: idSchema,
  ownerUserId: idSchema,
  workspaceId: idSchema,
  projectId: idSchema,
  conversationId: idSchema,
  type: collaborationEventTypeSchema,
  agentId: idSchema.nullable(),
  taskId: idSchema.nullable(),
  questionId: idSchema.nullable(),
  openspecChangeName: z.string().min(1).nullable(),
  payload: z.record(z.string(), z.unknown()),
  createdAt: z.string().datetime(),
});

export const collaborationOpenSpecLinkSchema = z.object({
  id: idSchema,
  ownerUserId: idSchema,
  workspaceId: idSchema,
  projectId: idSchema,
  conversationId: idSchema,
  openspecChangeName: z.string().min(1),
  artifact: collaborationOpenSpecArtifactSchema,
  artifactPath: z.string().min(1),
  collaborationTaskId: idSchema.nullable(),
  decisionId: idSchema.nullable(),
  projectionStatus: collaborationProjectionStatusSchema,
  lastProjectedAt: z.string().datetime().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

const collaborationStatusSummarySchema = z.object({
  conversationId: idSchema,
  projectId: idSchema.nullable(),
  state: z.enum(["available", "unavailable"]),
  agents: z.array(
    z.object({
      agentId: idSchema,
      displayName: z.string().min(1),
      availability: collaborationAgentAvailabilitySchema,
      currentTaskId: idSchema.nullable(),
      currentTaskTitle: z.string().nullable(),
      blockedQuestionCount: z.number().int().min(0),
      stale: z.boolean(),
    }),
  ),
  openSpecLinks: z.array(
    z.object({
      changeName: z.string().min(1),
      artifact: collaborationOpenSpecArtifactSchema,
      projectionStatus: collaborationProjectionStatusSchema,
    }),
  ),
  pendingUserQuestions: z.array(
    z.object({
      questionId: idSchema,
      requestingAgentId: idSchema,
      taskId: idSchema.nullable(),
      prompt: z.string().min(1),
      createdAt: z.string().datetime(),
    }),
  ),
  unavailableReason: z.string().min(1).optional(),
});

export const runtimeRegistrationPayloadSchema = z.object({
  deviceId: idSchema.optional(),
  displayName: z.string().min(1),
  platform: z.enum(["macos", "windows", "linux", "cloud"]),
  appVersion: z.string().min(1),
  capabilities: z.array(z.string()),
  workspace: workspaceMetadataSchema,
  providerHealth: providerHealthSchema.optional(),
  memoryHealth: memoryHealthSchema.optional(),
  claudeCodeDiscovery: claudeCodeDiscoverySummarySchema.optional(),
});

export const runtimeHeartbeatPayloadSchema = z.object({
  runtimeDeviceId: idSchema,
});

export const connectionCheckTargetSchema = z.enum(["runtime", "provider", "memory", "claude-code"]);
export const localConnectionCheckTargetSchema = z.enum(["provider", "memory", "claude-code"]);

export const createConnectionCheckRequestSchema = z.object({
  workspaceId: idSchema,
  targets: z.array(connectionCheckTargetSchema).min(1),
});

export const runtimeConnectionCheckResultSchema = z
  .object({
    runtimeDeviceId: idSchema,
    providerHealth: providerHealthSchema.optional(),
    memoryHealth: memoryHealthSchema.optional(),
    claudeCodeDiscovery: claudeCodeDiscoverySummarySchema.optional(),
  })
  .refine((value) => value.providerHealth || value.memoryHealth || value.claudeCodeDiscovery, {
    message: "At least one connection health result must be provided",
  });

export const createLocalRunRequestSchema = z.object({
  workspaceId: idSchema,
  projectId: idSchema.optional(),
  conversationId: idSchema,
  agentId: idSchema,
  prompt: z.string().min(1),
  planId: idSchema.nullable().optional(),
  claudeCode: claudeCodeRunOptionsSchema.optional(),
});

export const createAgentRequestSchema = z.object({
  workspaceId: idSchema,
  displayName: z.string().min(1),
  role: z.enum(["orchestrator", "worker"]),
  systemPrompt: z.string(),
  capabilityTags: z.array(z.string()).default([]),
  policy: z.record(z.string(), z.unknown()).default({}),
});

export const updateAgentRequestSchema = z
  .object({
    displayName: z.string().min(1).optional(),
    role: z.enum(["orchestrator", "worker"]).optional(),
    systemPrompt: z.string().optional(),
    capabilityTags: z.array(z.string()).optional(),
    policy: z.record(z.string(), z.unknown()).optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one agent field must be provided",
  });

export const addConversationAgentRequestSchema = z.object({
  agentId: idSchema,
});

export const conversationAgentSettingsSchema = z.object({
  displayNameOverride: z.string().trim().min(1).optional(),
  responsibilityOverride: z.string().trim().min(1).optional(),
  notes: z.string().optional(),
  enabled: z.boolean().optional(),
  participationMode: z.enum(["manual", "orchestrated", "proactive"]).optional(),
  priority: z.enum(["low", "normal", "high"]).optional(),
  quietMode: z.boolean().optional(),
  contextScope: z
    .enum(["conversation", "workspace-summary", "conversation-artifacts"])
    .optional(),
  includeHistorySummary: z.boolean().optional(),
  scopedInstructions: z.string().optional(),
  requireRunConfirmation: z.boolean().optional(),
  allowAutoDispatch: z.boolean().optional(),
});

export const updateConversationAgentSettingsRequestSchema = conversationAgentSettingsSchema.refine(
  (value) => Object.keys(value).length > 0,
  { message: "At least one conversation agent setting must be provided" },
);

export const desktopProjectRegistrationSchema = z.object({
  source: z.enum(["desktop-directory", "desktop-default"]),
  runtimeDeviceId: idSchema,
  displayName: z.string().min(1),
  localPath: z.string().min(1),
  localPathLabel: z.string().min(1),
  gitBranch: z.string().nullable().optional(),
  gitBaseCommit: z.string().nullable().optional(),
  dirty: z.boolean().optional(),
});

export const desktopCapabilityBridgeInfoSchema = z.object({
  version: z.literal("1.0.0"),
  capabilities: z.array(z.enum(["project.choose-directory", "project.create-default"])),
});

export const desktopProjectSelectionSchema = z.object({
  projectId: idSchema,
  desktopProjectRegistration: desktopProjectRegistrationSchema,
});

export const desktopProjectActionResultSchema = z.discriminatedUnion("status", [
  z.object({
    status: z.literal("selected"),
    selection: desktopProjectSelectionSchema,
  }),
  z.object({
    status: z.literal("cancelled"),
  }),
  z.object({
    status: z.literal("error"),
    message: z.string().min(1),
  }),
]);

export const createAgentConversationRequestSchema = z.object({
  workspaceId: idSchema,
  projectId: idSchema,
  agentIds: z.array(idSchema).min(1),
  desktopProjectRegistration: desktopProjectRegistrationSchema.optional(),
});

export const updateConversationRequestSchema = z
  .object({
    title: z.string().trim().min(1).optional(),
    pinned: z.boolean().optional(),
    notificationsMuted: z.boolean().optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one conversation field must be provided",
  });

export const runtimeCommandSchema = z.discriminatedUnion("type", [
  z.object({
    id: idSchema,
    type: z.literal("run.start"),
    runtimeDeviceId: idSchema,
    createdAt: z.string().datetime(),
    payload: z.object({
      runId: idSchema,
      workspaceId: idSchema,
      projectId: idSchema.nullable().optional(),
      conversationId: idSchema,
      agentId: idSchema,
      workspacePath: z.string().min(1),
      prompt: z.string().min(1),
      systemPrompt: z.string(),
      providerMode: z.enum(["smoke", "claude-code"]),
      memory: agentMemoryConfigSchema.optional(),
      claudeCode: claudeCodeRunOptionsSchema.optional(),
    }),
  }),
  z.object({
    id: idSchema,
    type: z.literal("run.cancel"),
    runtimeDeviceId: idSchema,
    createdAt: z.string().datetime(),
    payload: z.object({
      runId: idSchema,
    }),
  }),
  z.object({
    id: idSchema,
    type: z.literal("connection.check"),
    runtimeDeviceId: idSchema,
    createdAt: z.string().datetime(),
    payload: z.object({
      workspaceId: idSchema,
      targets: z.array(localConnectionCheckTargetSchema).min(1),
    }),
  }),
]);

const workspaceSchema = z.object({
  id: idSchema,
  ownerUserId: idSchema,
  name: z.string().min(1),
  runtimeKind: z.enum(["local", "cloud"]),
  runtimeDeviceId: idSchema.nullable(),
  localPath: z.string().nullable(),
  repoUrl: z.string().nullable(),
  defaultBranch: z.string().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

const projectSchema = z.object({
  id: idSchema,
  ownerUserId: idSchema,
  workspaceId: idSchema,
  name: z.string().min(1),
  runtimeDeviceId: idSchema,
  localPath: z.string().nullable(),
  localPathLabel: z.string().min(1),
  repoUrl: z.string().nullable(),
  gitBranch: z.string().nullable(),
  gitBaseCommit: z.string().nullable(),
  dirty: z.boolean(),
  isDefault: z.boolean(),
  lastUsedAt: z.string().datetime().nullable(),
  archivedAt: z.string().datetime().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

const runtimeDeviceSchema = z.object({
  id: idSchema,
  ownerUserId: idSchema,
  displayName: z.string().min(1),
  platform: z.enum(["macos", "windows", "linux", "cloud"]),
  appVersion: z.string().min(1),
  status: z.enum(["online", "offline", "degraded", "active-running"]),
  capabilities: z.array(z.string()),
  lastHeartbeatAt: z.string().datetime().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

const conversationSchema = z.object({
  id: idSchema,
  ownerUserId: idSchema,
  workspaceId: idSchema,
  projectId: idSchema.nullable(),
  kind: z.enum(["single-agent", "group"]),
  title: z.string().min(1),
  pinnedAt: z.string().datetime().nullable(),
  notificationsMuted: z.boolean(),
  archivedAt: z.string().datetime().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

const conversationParticipantSchema = z.object({
  id: idSchema,
  ownerUserId: idSchema,
  conversationId: idSchema,
  agentId: idSchema,
  addedByUserId: idSchema.nullable(),
  archivedAt: z.string().datetime().nullable(),
  conversationAgentSettings: conversationAgentSettingsSchema.optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

const agentSchema = z.object({
  id: idSchema,
  ownerUserId: idSchema,
  providerId: idSchema,
  workspaceId: idSchema,
  displayName: z.string().min(1),
  role: z.enum(["orchestrator", "worker"]),
  systemPrompt: z.string(),
  capabilityTags: z.array(z.string()),
  policy: z.record(z.string(), z.unknown()),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

const runSchema = z.object({
  id: idSchema,
  ownerUserId: idSchema,
  workspaceId: idSchema,
  projectId: idSchema.nullable().optional(),
  conversationId: idSchema,
  agentId: idSchema,
  planId: idSchema.nullable(),
  status: z.enum([
    "queued",
    "running",
    "streaming",
    "blocked",
    "cancelling",
    "cancelled",
    "completed",
    "failed",
  ]),
  startedAt: z.string().datetime().nullable(),
  completedAt: z.string().datetime().nullable(),
  failureReason: z.string().nullable(),
  claudeCode: claudeCodeRunOptionsSchema
    .extend({
      overrideSource: z.enum(["agent-default", "run-override"]),
      effectivePermissionPreset: z
        .enum(["plan-only", "ask-first", "auto-edits", "full-access"])
        .optional(),
      effectiveSettingsSource: z.enum(["inherit", "managed", "isolated"]).optional(),
    })
    .optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

const messagePartSchema = z.object({
  type: z.enum(["text", "markdown", "code", "artifact-ref", "run-event"]),
  text: z.string().optional(),
  language: z.string().optional(),
  artifactId: idSchema.optional(),
  runId: idSchema.optional(),
});

const messageSchema = z.object({
  id: idSchema,
  ownerUserId: idSchema,
  conversationId: idSchema,
  authorKind: z.enum(["user", "agent", "system"]),
  authorId: idSchema,
  parts: z.array(messagePartSchema),
  replyToMessageId: idSchema.nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const workbenchSnapshotSchema = z.object({
  authenticated: z.boolean(),
  userId: idSchema,
  activeWorkspaceId: idSchema,
  activeConversationId: idSchema,
  workspaces: z.array(workspaceSchema),
  projects: z.array(projectSchema).default([]),
  runtimeDevices: z.array(runtimeDeviceSchema),
  workspaceMetadata: workspaceMetadataSchema.nullable(),
  providerHealth: providerHealthSchema.nullable().optional(),
  memoryHealth: memoryHealthSchema.nullable().optional(),
  claudeCodeDiscovery: claudeCodeDiscoverySummarySchema.nullable().optional(),
  conversations: z.array(conversationSchema),
  conversationParticipants: z.array(conversationParticipantSchema).optional(),
  agents: z.array(agentSchema),
  runs: z.array(runSchema),
  messages: z.array(messageSchema),
  availableActions: z.array(z.string()),
  collaborationStatus: collaborationStatusSummarySchema.nullable().optional(),
});

export type OrchestratorDispatchPlan = z.infer<typeof orchestratorDispatchPlanSchema>;
export type AddConversationAgentRequestPayload = z.infer<typeof addConversationAgentRequestSchema>;
export type ConversationAgentSettingsPayload = z.infer<typeof conversationAgentSettingsSchema>;
export type CreateAgentConversationRequestPayload = z.infer<
  typeof createAgentConversationRequestSchema
>;
export type DesktopProjectRegistrationPayload = z.infer<typeof desktopProjectRegistrationSchema>;
export type DesktopCapabilityBridgeInfoPayload = z.infer<
  typeof desktopCapabilityBridgeInfoSchema
>;
export type DesktopProjectSelectionPayload = z.infer<typeof desktopProjectSelectionSchema>;
export type DesktopProjectActionResultPayload = z.infer<
  typeof desktopProjectActionResultSchema
>;
export type UpdateConversationAgentSettingsRequestPayload = z.infer<
  typeof updateConversationAgentSettingsRequestSchema
>;
export type UpdateConversationRequestPayload = z.infer<typeof updateConversationRequestSchema>;
export type ProviderRuntimeEvent = z.infer<typeof providerRuntimeEventSchema>;
export type ClaudeCodeRunOptionsPayload = z.infer<typeof claudeCodeRunOptionsSchema>;
export type ConversationAgentClaudeSessionPayload = z.infer<
  typeof conversationAgentClaudeSessionSchema
>;
export type ClaudeCodeDiscoverySummaryPayload = z.infer<typeof claudeCodeDiscoverySummarySchema>;
export type CollaborationAgentRosterEntryPayload = z.infer<
  typeof collaborationAgentRosterEntrySchema
>;
export type CollaborationMentionMessagePayload = z.infer<
  typeof collaborationMentionMessageSchema
>;
export type CollaborationTaskPayload = z.infer<typeof collaborationTaskSchema>;
export type CollaborationUserQuestionPayload = z.infer<typeof collaborationUserQuestionSchema>;
export type CollaborationHeartbeatPayload = z.infer<typeof collaborationHeartbeatSchema>;
export type CollaborationEventPayload = z.infer<typeof collaborationEventSchema>;
export type CollaborationOpenSpecLinkPayload = z.infer<typeof collaborationOpenSpecLinkSchema>;
export type CollaborationStatusSummaryPayload = z.infer<typeof collaborationStatusSummarySchema>;
export type CreateAgentRequestPayload = z.infer<typeof createAgentRequestSchema>;
export type CreateConnectionCheckRequestPayload = z.infer<
  typeof createConnectionCheckRequestSchema
>;
export type DiffMetadataPayload = z.infer<typeof diffMetadataSchema>;
export type ConnectionCheckTargetPayload = z.infer<typeof connectionCheckTargetSchema>;
export type LocalConnectionCheckTargetPayload = z.infer<typeof localConnectionCheckTargetSchema>;
export type MemoryHealthPayload = z.infer<typeof memoryHealthSchema>;
export type RuntimeConnectionCheckResultPayload = z.infer<
  typeof runtimeConnectionCheckResultSchema
>;
export type RuntimeCommandPayload = z.infer<typeof runtimeCommandSchema>;
export type ProviderHealthPayload = z.infer<typeof providerHealthSchema>;
export type ProjectMetadataPayload = z.infer<typeof projectMetadataSchema>;
export type ServiceHealthPayload = z.infer<typeof serviceHealthSchema>;
export type UpdateAgentRequestPayload = z.infer<typeof updateAgentRequestSchema>;
export type RuntimeRegistrationPayloadData = z.infer<typeof runtimeRegistrationPayloadSchema>;
export type WorkbenchSnapshotPayload = z.infer<typeof workbenchSnapshotSchema>;

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

export const runtimeRegistrationPayloadSchema = z.object({
  deviceId: idSchema.optional(),
  displayName: z.string().min(1),
  platform: z.enum(["macos", "windows", "linux", "cloud"]),
  appVersion: z.string().min(1),
  capabilities: z.array(z.string()),
  workspace: workspaceMetadataSchema,
});

export const runtimeHeartbeatPayloadSchema = z.object({
  runtimeDeviceId: idSchema,
});

export const createLocalRunRequestSchema = z.object({
  workspaceId: idSchema,
  conversationId: idSchema,
  agentId: idSchema,
  prompt: z.string().min(1),
  planId: idSchema.nullable().optional(),
});

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
  kind: z.enum(["single-agent", "group"]),
  title: z.string().min(1),
  archivedAt: z.string().datetime().nullable(),
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
  runtimeDevices: z.array(runtimeDeviceSchema),
  workspaceMetadata: workspaceMetadataSchema.nullable(),
  conversations: z.array(conversationSchema),
  agents: z.array(agentSchema),
  runs: z.array(runSchema),
  messages: z.array(messageSchema),
  availableActions: z.array(z.string()),
});

export type OrchestratorDispatchPlan = z.infer<typeof orchestratorDispatchPlanSchema>;
export type ProviderRuntimeEvent = z.infer<typeof providerRuntimeEventSchema>;
export type DiffMetadataPayload = z.infer<typeof diffMetadataSchema>;
export type ServiceHealthPayload = z.infer<typeof serviceHealthSchema>;
export type RuntimeRegistrationPayloadData = z.infer<typeof runtimeRegistrationPayloadSchema>;
export type WorkbenchSnapshotPayload = z.infer<typeof workbenchSnapshotSchema>;

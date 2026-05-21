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

export type OrchestratorDispatchPlan = z.infer<typeof orchestratorDispatchPlanSchema>;
export type ProviderRuntimeEvent = z.infer<typeof providerRuntimeEventSchema>;
export type DiffMetadataPayload = z.infer<typeof diffMetadataSchema>;


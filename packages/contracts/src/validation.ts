import type { z } from "zod";
import {
  addConversationAgentRequestSchema,
  createAgentConversationRequestSchema,
  createConnectionCheckRequestSchema,
  createLocalRunRequestSchema,
  createAgentRequestSchema,
  diffMetadataSchema,
  memoryHealthSchema,
  orchestratorDispatchPlanSchema,
  providerHealthSchema,
  providerRuntimeEventSchema,
  runtimeCommandSchema,
  runtimeConnectionCheckResultSchema,
  runtimeHeartbeatPayloadSchema,
  runtimeRegistrationPayloadSchema,
  serviceHealthSchema,
  workbenchSnapshotSchema,
  workspaceMetadataSchema,
  updateAgentRequestSchema,
} from "./schemas.js";

export interface ValidationResult<T> {
  readonly ok: boolean;
  readonly data?: T;
  readonly issues?: readonly string[];
}

function parseWithSchema<TSchema extends z.ZodType>(
  schema: TSchema,
  value: unknown,
): ValidationResult<z.infer<TSchema>> {
  const result = schema.safeParse(value);
  if (result.success) {
    return { ok: true, data: result.data };
  }

  return {
    ok: false,
    issues: result.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`),
  };
}

export function validateOrchestratorDispatchPlan(
  value: unknown,
): ValidationResult<z.infer<typeof orchestratorDispatchPlanSchema>> {
  return parseWithSchema(orchestratorDispatchPlanSchema, value);
}

export function validateProviderRuntimeEvent(
  value: unknown,
): ValidationResult<z.infer<typeof providerRuntimeEventSchema>> {
  return parseWithSchema(providerRuntimeEventSchema, value);
}

export function validateDiffMetadata(
  value: unknown,
): ValidationResult<z.infer<typeof diffMetadataSchema>> {
  return parseWithSchema(diffMetadataSchema, value);
}

export function validateServiceHealth(
  value: unknown,
): ValidationResult<z.infer<typeof serviceHealthSchema>> {
  return parseWithSchema(serviceHealthSchema, value);
}

export function validateProviderHealth(
  value: unknown,
): ValidationResult<z.infer<typeof providerHealthSchema>> {
  return parseWithSchema(providerHealthSchema, value);
}

export function validateMemoryHealth(
  value: unknown,
): ValidationResult<z.infer<typeof memoryHealthSchema>> {
  return parseWithSchema(memoryHealthSchema, value);
}

export function validateRuntimeRegistrationPayload(
  value: unknown,
): ValidationResult<z.infer<typeof runtimeRegistrationPayloadSchema>> {
  return parseWithSchema(runtimeRegistrationPayloadSchema, value);
}

export function validateRuntimeHeartbeatPayload(
  value: unknown,
): ValidationResult<z.infer<typeof runtimeHeartbeatPayloadSchema>> {
  return parseWithSchema(runtimeHeartbeatPayloadSchema, value);
}

export function validateCreateConnectionCheckRequest(
  value: unknown,
): ValidationResult<z.infer<typeof createConnectionCheckRequestSchema>> {
  return parseWithSchema(createConnectionCheckRequestSchema, value);
}

export function validateRuntimeConnectionCheckResult(
  value: unknown,
): ValidationResult<z.infer<typeof runtimeConnectionCheckResultSchema>> {
  return parseWithSchema(runtimeConnectionCheckResultSchema, value);
}

export function validateWorkspaceMetadata(
  value: unknown,
): ValidationResult<z.infer<typeof workspaceMetadataSchema>> {
  return parseWithSchema(workspaceMetadataSchema, value);
}

export function validateWorkbenchSnapshot(
  value: unknown,
): ValidationResult<z.infer<typeof workbenchSnapshotSchema>> {
  return parseWithSchema(workbenchSnapshotSchema, value);
}

export function validateCreateLocalRunRequest(
  value: unknown,
): ValidationResult<z.infer<typeof createLocalRunRequestSchema>> {
  return parseWithSchema(createLocalRunRequestSchema, value);
}

export function validateCreateAgentRequest(
  value: unknown,
): ValidationResult<z.infer<typeof createAgentRequestSchema>> {
  return parseWithSchema(createAgentRequestSchema, value);
}

export function validateAddConversationAgentRequest(
  value: unknown,
): ValidationResult<z.infer<typeof addConversationAgentRequestSchema>> {
  return parseWithSchema(addConversationAgentRequestSchema, value);
}

export function validateCreateAgentConversationRequest(
  value: unknown,
): ValidationResult<z.infer<typeof createAgentConversationRequestSchema>> {
  return parseWithSchema(createAgentConversationRequestSchema, value);
}

export function validateUpdateAgentRequest(
  value: unknown,
): ValidationResult<z.infer<typeof updateAgentRequestSchema>> {
  return parseWithSchema(updateAgentRequestSchema, value);
}

export function validateRuntimeCommand(
  value: unknown,
): ValidationResult<z.infer<typeof runtimeCommandSchema>> {
  return parseWithSchema(runtimeCommandSchema, value);
}

export function isDiffMetadataStale(
  storedFingerprint: string,
  currentFingerprint: string,
): boolean {
  return storedFingerprint !== currentFingerprint;
}

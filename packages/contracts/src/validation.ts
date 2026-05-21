import type { z } from "zod";
import {
  createLocalRunRequestSchema,
  diffMetadataSchema,
  orchestratorDispatchPlanSchema,
  providerRuntimeEventSchema,
  runtimeHeartbeatPayloadSchema,
  runtimeRegistrationPayloadSchema,
  serviceHealthSchema,
  workbenchSnapshotSchema,
  workspaceMetadataSchema,
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

export function isDiffMetadataStale(
  storedFingerprint: string,
  currentFingerprint: string,
): boolean {
  return storedFingerprint !== currentFingerprint;
}

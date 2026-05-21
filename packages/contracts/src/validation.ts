import type { z } from "zod";
import {
  diffMetadataSchema,
  orchestratorDispatchPlanSchema,
  providerRuntimeEventSchema,
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

export function isDiffMetadataStale(
  storedFingerprint: string,
  currentFingerprint: string,
): boolean {
  return storedFingerprint !== currentFingerprint;
}


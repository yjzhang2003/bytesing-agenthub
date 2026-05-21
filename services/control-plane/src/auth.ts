import { createHmac, timingSafeEqual } from "node:crypto";

export interface AuthContext {
  readonly userId: string;
  readonly token: string;
  readonly claims: Record<string, unknown>;
}

export class AuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuthError";
  }
}

function decodeBase64Url(value: string): Buffer {
  return Buffer.from(value, "base64url");
}

function parseJsonSegment(segment: string): Record<string, unknown> {
  const parsed = JSON.parse(decodeBase64Url(segment).toString("utf8")) as unknown;
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new AuthError("JWT segment is not an object");
  }
  return parsed as Record<string, unknown>;
}

export function verifySupabaseJwt(token: string, jwtSecret: string): AuthContext {
  const parts = token.split(".");
  if (parts.length !== 3) {
    throw new AuthError("Invalid JWT format");
  }

  const [encodedHeader, encodedPayload, encodedSignature] = parts;
  if (!encodedHeader || !encodedPayload || !encodedSignature) {
    throw new AuthError("Invalid JWT segments");
  }

  const header = parseJsonSegment(encodedHeader);
  if (header.alg !== "HS256") {
    throw new AuthError("Unsupported JWT algorithm");
  }

  const expectedSignature = createHmac("sha256", jwtSecret)
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest();
  const actualSignature = decodeBase64Url(encodedSignature);
  if (
    actualSignature.length !== expectedSignature.length ||
    !timingSafeEqual(actualSignature, expectedSignature)
  ) {
    throw new AuthError("Invalid JWT signature");
  }

  const claims = parseJsonSegment(encodedPayload);
  const subject = claims.sub;
  if (typeof subject !== "string" || subject.length === 0) {
    throw new AuthError("JWT subject is required");
  }

  const expiration = claims.exp;
  if (typeof expiration === "number" && expiration * 1000 < Date.now()) {
    throw new AuthError("JWT is expired");
  }

  return { userId: subject, token, claims };
}

export function parseBearerToken(authorizationHeader: string | null | undefined): string {
  if (!authorizationHeader?.startsWith("Bearer ")) {
    throw new AuthError("Missing bearer token");
  }
  return authorizationHeader.slice("Bearer ".length);
}


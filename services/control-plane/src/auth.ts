import {
  createHmac,
  createPublicKey,
  createVerify,
  timingSafeEqual,
  type JsonWebKey as NodeJsonWebKey,
} from "node:crypto";

export interface AuthContext {
  readonly userId: string;
  readonly token: string;
  readonly claims: Record<string, unknown>;
}

interface SupabaseJwks {
  readonly keys: readonly (JsonWebKey & {
    readonly alg?: string;
    readonly kid?: string;
    readonly use?: string;
  })[];
}

export interface SupabaseJwtVerifyOptions {
  readonly fetchJwks?: ((url: string) => Promise<SupabaseJwks>) | undefined;
  readonly jwtSecret: string;
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

async function fetchSupabaseJwks(url: string): Promise<SupabaseJwks> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new AuthError(`Unable to fetch Supabase JWKS: ${response.status}`);
  }
  const body = (await response.json()) as unknown;
  if (!body || typeof body !== "object" || !Array.isArray((body as SupabaseJwks).keys)) {
    throw new AuthError("Supabase JWKS response is invalid");
  }
  return body as SupabaseJwks;
}

function assertValidClaims(claims: Record<string, unknown>): void {
  const subject = claims.sub;
  if (typeof subject !== "string" || subject.length === 0) {
    throw new AuthError("JWT subject is required");
  }

  const expiration = claims.exp;
  if (typeof expiration === "number" && expiration * 1000 < Date.now()) {
    throw new AuthError("JWT is expired");
  }
}

function verifyHs256Jwt(input: {
  readonly data: string;
  readonly encodedSignature: string;
  readonly jwtSecret: string;
}): void {
  const expectedSignature = createHmac("sha256", input.jwtSecret).update(input.data).digest();
  const actualSignature = decodeBase64Url(input.encodedSignature);
  if (
    actualSignature.length !== expectedSignature.length ||
    !timingSafeEqual(actualSignature, expectedSignature)
  ) {
    throw new AuthError("Invalid JWT signature");
  }
}

async function verifyEs256Jwt(input: {
  readonly claims: Record<string, unknown>;
  readonly data: string;
  readonly encodedSignature: string;
  readonly fetchJwks: (url: string) => Promise<SupabaseJwks>;
  readonly header: Record<string, unknown>;
}): Promise<void> {
  const keyId = input.header.kid;
  if (typeof keyId !== "string" || keyId.length === 0) {
    throw new AuthError("JWT key id is required");
  }
  const issuer = input.claims.iss;
  if (typeof issuer !== "string" || issuer.length === 0) {
    throw new AuthError("JWT issuer is required");
  }
  const jwksUrl = `${issuer.replace(/\/$/, "")}/.well-known/jwks.json`;
  const jwks = await input.fetchJwks(jwksUrl);
  const jwk = jwks.keys.find((key) => key.kid === keyId && key.alg === "ES256");
  if (!jwk) {
    throw new AuthError("JWT signing key was not found");
  }

  const verifier = createVerify("sha256");
  verifier.update(input.data);
  verifier.end();
  const publicJwk = { ...jwk } as NodeJsonWebKey;
  const ok = verifier.verify(
    {
      dsaEncoding: "ieee-p1363",
      key: createPublicKey({ format: "jwk", key: publicJwk }),
    },
    decodeBase64Url(input.encodedSignature),
  );
  if (!ok) {
    throw new AuthError("Invalid JWT signature");
  }
}

export async function verifySupabaseJwt(
  token: string,
  options: SupabaseJwtVerifyOptions,
): Promise<AuthContext> {
  const parts = token.split(".");
  if (parts.length !== 3) {
    throw new AuthError("Invalid JWT format");
  }

  const [encodedHeader, encodedPayload, encodedSignature] = parts;
  if (!encodedHeader || !encodedPayload || !encodedSignature) {
    throw new AuthError("Invalid JWT segments");
  }

  const header = parseJsonSegment(encodedHeader);
  const claims = parseJsonSegment(encodedPayload);
  const data = `${encodedHeader}.${encodedPayload}`;

  if (header.alg === "HS256") {
    verifyHs256Jwt({
      data,
      encodedSignature,
      jwtSecret: options.jwtSecret,
    });
  } else if (header.alg === "ES256") {
    await verifyEs256Jwt({
      claims,
      data,
      encodedSignature,
      fetchJwks: options.fetchJwks ?? fetchSupabaseJwks,
      header,
    });
  } else {
    throw new AuthError("Unsupported JWT algorithm");
  }

  assertValidClaims(claims);

  return { userId: claims.sub as string, token, claims };
}

export function parseBearerToken(authorizationHeader: string | null | undefined): string {
  if (!authorizationHeader?.startsWith("Bearer ")) {
    throw new AuthError("Missing bearer token");
  }
  return authorizationHeader.slice("Bearer ".length);
}

import { agentHubLocalDefaults } from "@agenthub/contracts";
import type { Session } from "@supabase/supabase-js";

export type WebAuthMode = "local-demo" | "supabase";
export type WebEntryView = "homepage" | "login" | "auth-callback" | "workbench";
export type WebAuthErrorKind = "session-required" | "control-plane" | "oauth";

export interface WebAuthSession {
  readonly accessToken: string;
  readonly userId: string;
}

export interface WebControlPlaneAuthOptions {
  readonly accessToken: string;
  readonly baseUrl: string;
}

export interface WebSupabaseAuthClient {
  readonly auth: {
    readonly signInWithOAuth: (input: {
      readonly provider: "github";
      readonly options: { readonly redirectTo: string };
    }) => Promise<{ readonly error: { readonly message: string } | null }>;
    readonly signOut: () => Promise<{ readonly error: { readonly message: string } | null }>;
  };
}

export class AuthenticationRequiredError extends Error {
  constructor(message = "Authentication is required to access AgentHub.") {
    super(message);
    this.name = "AuthenticationRequiredError";
  }
}

export function webPathFromLocation(
  location: Pick<Location, "pathname" | "search" | "hash"> = window.location,
): string {
  return location.pathname || "/";
}

export function resolveWebEntryView(input: {
  readonly authenticated: boolean;
  readonly pathname: string;
}): WebEntryView {
  if (input.pathname === "/auth/callback") {
    return "auth-callback";
  }
  if (input.authenticated) {
    return "workbench";
  }
  if (input.pathname === "/login") {
    return "login";
  }
  return "homepage";
}

export function classifyWebAuthError(error: unknown): WebAuthErrorKind {
  if (error instanceof AuthenticationRequiredError) {
    return "session-required";
  }
  const message = error instanceof Error ? error.message : String(error);
  if (/authentication is required/i.test(message)) {
    return "session-required";
  }
  if (/control plane/i.test(message)) {
    return "control-plane";
  }
  return "oauth";
}

export function readWebAuthMode(env: ImportMetaEnv = import.meta.env): WebAuthMode {
  return env.VITE_AGENTHUB_AUTH_MODE === "supabase" ? "supabase" : "local-demo";
}

export function defaultWebOAuthRedirectTo(
  location: Pick<Location, "origin"> = window.location,
): string {
  return `${location.origin}/auth/callback`;
}

export function sessionFromSupabase(session: Session | null): WebAuthSession | null {
  if (!session?.access_token || !session.user.id) {
    return null;
  }

  return {
    accessToken: session.access_token,
    userId: session.user.id,
  };
}

export function resolveWebControlPlaneClientOptions(input: {
  readonly env?: ImportMetaEnv;
  readonly session: WebAuthSession | null;
}): WebControlPlaneAuthOptions {
  const env = input.env ?? import.meta.env;
  const baseUrl =
    env.VITE_CONTROL_PLANE_URL ?? `http://127.0.0.1:${agentHubLocalDefaults.controlPlanePort}`;

  if (readWebAuthMode(env) === "supabase") {
    if (!input.session) {
      throw new AuthenticationRequiredError();
    }
    return {
      accessToken: input.session.accessToken,
      baseUrl,
    };
  }

  return {
    accessToken: env.VITE_AGENTHUB_LOCAL_AUTH_TOKEN ?? agentHubLocalDefaults.authToken,
    baseUrl,
  };
}

export async function signInWithGitHub(input: {
  readonly redirectTo: string;
  readonly supabase: Pick<WebSupabaseAuthClient, "auth">;
}): Promise<void> {
  const { error } = await input.supabase.auth.signInWithOAuth({
    provider: "github",
    options: { redirectTo: input.redirectTo },
  });
  if (error) {
    throw new Error(error.message);
  }
}

export async function signOutOfWebAuth(
  supabase: Pick<WebSupabaseAuthClient, "auth">,
): Promise<void> {
  const { error } = await supabase.auth.signOut();
  if (error) {
    throw new Error(error.message);
  }
}

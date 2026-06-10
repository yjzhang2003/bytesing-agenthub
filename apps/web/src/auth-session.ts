import { agentHubLocalDefaults } from "@agenthub/contracts";
import { AGENTHUB_LOCALE_STORAGE_KEY, type AgentHubLocale } from "@agenthub/ui";
import type { Session } from "@supabase/supabase-js";

export type WebAuthMode = "local-demo" | "supabase";
export type WebEntryView =
  | "homepage"
  | "login"
  | "auth-callback"
  | "auth-reset-password"
  | "workbench";
export type WebAuthErrorKind = "session-required" | "control-plane" | "oauth";
export type WebEmailSignupResult =
  | { readonly status: "signed-in" }
  | { readonly status: "confirmation-required"; readonly email: string };

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
      readonly options: {
        readonly redirectTo: string;
        readonly skipBrowserRedirect?: boolean;
      };
    }) => Promise<{
      readonly data?: { readonly url?: string | null | undefined } | null | undefined;
      readonly error: { readonly message: string } | null;
    }>;
    readonly signInWithPassword: (input: {
      readonly email: string;
      readonly password: string;
    }) => Promise<{ readonly error: { readonly message: string } | null }>;
    readonly signUp: (input: {
      readonly email: string;
      readonly password: string;
      readonly options: { readonly emailRedirectTo: string };
    }) => Promise<{
      readonly data: { readonly session: Session | null } | null;
      readonly error: { readonly message: string } | null;
    }>;
    readonly resetPasswordForEmail: (
      email: string,
      options: { readonly redirectTo: string },
    ) => Promise<{ readonly error: { readonly message: string } | null }>;
    readonly updateUser: (input: {
      readonly password: string;
    }) => Promise<{ readonly error: { readonly message: string } | null }>;
    readonly exchangeCodeForSession?: ((authCode: string) => Promise<{
      readonly error: { readonly message: string } | null;
    }>) | undefined;
    readonly setSession?: ((input: {
      readonly access_token: string;
      readonly refresh_token: string;
    }) => Promise<{ readonly error: { readonly message: string } | null }>) | undefined;
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
  if (input.pathname === "/auth/reset-password") {
    return input.authenticated ? "workbench" : "auth-reset-password";
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

export function resolvePublicWebLocale(
  storage: Pick<Storage, "getItem"> = window.localStorage,
): AgentHubLocale {
  const normalizedValue = storage
    .getItem(AGENTHUB_LOCALE_STORAGE_KEY)
    ?.trim()
    .toLowerCase()
    .replace("_", "-");
  if (normalizedValue === "en" || normalizedValue === "en-us") {
    return "en-US";
  }
  return "zh-CN";
}

export function defaultWebOAuthRedirectTo(
  location: Pick<Location, "origin"> = window.location,
): string {
  return `${location.origin}/auth/callback`;
}

export function defaultDesktopOAuthRedirectTo(): string {
  return "agenthub://auth/callback";
}

export function defaultWebEmailAuthRedirectTo(
  location: Pick<Location, "origin"> = window.location,
): string {
  return `${location.origin}/auth/callback`;
}

export function defaultWebPasswordResetRedirectTo(
  location: Pick<Location, "origin"> = window.location,
): string {
  return `${location.origin}/auth/reset-password`;
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
  readonly supabase: { readonly auth: Pick<WebSupabaseAuthClient["auth"], "signInWithOAuth"> };
}): Promise<void> {
  const { error } = await input.supabase.auth.signInWithOAuth({
    provider: "github",
    options: { redirectTo: input.redirectTo },
  });
  if (error) {
    throw new Error(error.message);
  }
}

export async function createGitHubOAuthUrl(input: {
  readonly redirectTo: string;
  readonly supabase: { readonly auth: Pick<WebSupabaseAuthClient["auth"], "signInWithOAuth"> };
}): Promise<string> {
  const { data, error } = await input.supabase.auth.signInWithOAuth({
    provider: "github",
    options: { redirectTo: input.redirectTo, skipBrowserRedirect: true },
  });
  if (error) {
    throw new Error(error.message);
  }
  if (!data?.url) {
    throw new Error("Supabase did not return a GitHub OAuth URL.");
  }
  return data.url;
}

export async function completeOAuthCallback(input: {
  readonly callbackUrl: string;
  readonly supabase: {
    readonly auth: Pick<
      WebSupabaseAuthClient["auth"],
      "exchangeCodeForSession" | "setSession"
    >;
  };
}): Promise<void> {
  const url = new URL(input.callbackUrl);
  const hashParams = new URLSearchParams(url.hash.replace(/^#/, ""));
  const searchParams = url.searchParams;
  const errorDescription =
    searchParams.get("error_description") ??
    hashParams.get("error_description") ??
    searchParams.get("error") ??
    hashParams.get("error");
  if (errorDescription) {
    throw new Error(errorDescription);
  }
  const accessToken = hashParams.get("access_token") ?? searchParams.get("access_token");
  const refreshToken = hashParams.get("refresh_token") ?? searchParams.get("refresh_token");
  if (accessToken && refreshToken) {
    if (!input.supabase.auth.setSession) {
      throw new Error("Supabase setSession is unavailable.");
    }
    const { error } = await input.supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });
    if (error) {
      throw new Error(error.message);
    }
    return;
  }
  const code = searchParams.get("code") ?? hashParams.get("code");
  if (code) {
    if (!input.supabase.auth.exchangeCodeForSession) {
      throw new Error("Supabase code exchange is unavailable.");
    }
    const { error } = await input.supabase.auth.exchangeCodeForSession(code);
    if (error) {
      throw new Error(error.message);
    }
    return;
  }
  throw new Error("OAuth callback did not include a Supabase session.");
}

export async function signInWithEmailPassword(input: {
  readonly email: string;
  readonly password: string;
  readonly supabase: { readonly auth: Pick<WebSupabaseAuthClient["auth"], "signInWithPassword"> };
}): Promise<void> {
  const { error } = await input.supabase.auth.signInWithPassword({
    email: input.email,
    password: input.password,
  });
  if (error) {
    throw new Error(error.message);
  }
}

export async function signUpWithEmailPassword(input: {
  readonly email: string;
  readonly password: string;
  readonly redirectTo: string;
  readonly supabase: { readonly auth: Pick<WebSupabaseAuthClient["auth"], "signUp"> };
}): Promise<WebEmailSignupResult> {
  const { data, error } = await input.supabase.auth.signUp({
    email: input.email,
    password: input.password,
    options: { emailRedirectTo: input.redirectTo },
  });
  if (error) {
    throw new Error(error.message);
  }
  if (data?.session) {
    return { status: "signed-in" };
  }
  return { status: "confirmation-required", email: input.email };
}

export async function requestEmailPasswordReset(input: {
  readonly email: string;
  readonly redirectTo: string;
  readonly supabase: {
    readonly auth: Pick<WebSupabaseAuthClient["auth"], "resetPasswordForEmail">;
  };
}): Promise<void> {
  const { error } = await input.supabase.auth.resetPasswordForEmail(input.email, {
    redirectTo: input.redirectTo,
  });
  if (error) {
    throw new Error(error.message);
  }
}

export async function updateEmailPassword(input: {
  readonly password: string;
  readonly supabase: { readonly auth: Pick<WebSupabaseAuthClient["auth"], "updateUser"> };
}): Promise<void> {
  const { error } = await input.supabase.auth.updateUser({
    password: input.password,
  });
  if (error) {
    throw new Error(error.message);
  }
}

export async function signOutOfWebAuth(supabase: {
  readonly auth: Pick<WebSupabaseAuthClient["auth"], "signOut">;
}): Promise<void> {
  const { error } = await supabase.auth.signOut();
  if (error) {
    throw new Error(error.message);
  }
}

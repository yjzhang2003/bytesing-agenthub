import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export interface DesktopAuthConfig {
  readonly supabaseUrl: string;
  readonly supabaseAnonKey: string;
}

export function readDesktopAuthConfig(env: NodeJS.ProcessEnv = process.env): DesktopAuthConfig {
  return {
    supabaseAnonKey: env.VITE_SUPABASE_ANON_KEY ?? "",
    supabaseUrl: env.VITE_SUPABASE_URL ?? "",
  };
}

export function createDesktopSupabaseClient(
  config = readDesktopAuthConfig(),
): SupabaseClient | null {
  if (!config.supabaseUrl || !config.supabaseAnonKey) {
    return null;
  }
  return createClient(config.supabaseUrl, config.supabaseAnonKey);
}


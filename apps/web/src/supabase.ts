import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export interface WebSupabaseConfig {
  readonly url: string;
  readonly anonKey: string;
}

export function readWebSupabaseConfig(env: ImportMetaEnv = import.meta.env): WebSupabaseConfig {
  return {
    anonKey: env.VITE_SUPABASE_ANON_KEY ?? "",
    url: env.VITE_SUPABASE_URL ?? "",
  };
}

export function createWebSupabaseClient(config = readWebSupabaseConfig()): SupabaseClient | null {
  if (!config.url || !config.anonKey) {
    return null;
  }
  return createClient(config.url, config.anonKey);
}


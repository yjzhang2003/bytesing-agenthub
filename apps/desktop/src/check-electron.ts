import { existsSync } from "node:fs";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);

try {
  const electronPath = require.resolve("electron");
  const electronPackagePath = require.resolve("electron/package.json");
  const electronPackage = require(electronPackagePath) as { readonly version: string };
  if (!existsSync(electronPath)) {
    throw new Error("Electron module resolved but binary entry is missing");
  }
  console.log(`[desktop] Electron ${electronPackage.version} is available`);
} catch (error) {
  const message = error instanceof Error ? error.message : "unknown error";
  console.error(`[desktop] Electron is not available: ${message}`);
  console.error("[desktop] Run `pnpm approve-builds` and approve electron, then run `pnpm install`.");
  console.error("[desktop] If approval is already configured, run `pnpm --filter @agenthub/desktop rebuild electron`.");
  process.exit(1);
}

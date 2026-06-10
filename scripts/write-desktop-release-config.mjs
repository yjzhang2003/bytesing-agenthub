import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const outputPath = join(root, "apps", "desktop", "dist", "release-config.json");
const requireConfig = process.env.AGENTHUB_REQUIRE_RELEASE_CONFIG === "1";

const config = {
  controlPlaneUrl: normalizeUrl("AGENTHUB_CONTROL_PLANE_URL", process.env.AGENTHUB_CONTROL_PLANE_URL),
  webUrl: normalizeUrl("AGENTHUB_WEB_URL", process.env.AGENTHUB_WEB_URL),
};

if (!config.controlPlaneUrl || !config.webUrl) {
  if (requireConfig) {
    throw new Error(
      "AGENTHUB_CONTROL_PLANE_URL and AGENTHUB_WEB_URL are required for desktop release builds.",
    );
  }
  console.log("[desktop] release config not written; using local development defaults");
  process.exit(0);
}

await mkdir(dirname(outputPath), { recursive: true });
await writeFile(outputPath, `${JSON.stringify(config, null, 2)}\n`, "utf8");
console.log(`[desktop] wrote release config to ${outputPath}`);

function normalizeUrl(name, value) {
  if (!value) {
    return undefined;
  }
  const url = new URL(value);
  if (["127.0.0.1", "localhost", "::1"].includes(url.hostname)) {
    throw new Error(`${name} must not use localhost for desktop release builds.`);
  }
  if (url.protocol !== "https:") {
    throw new Error(`${name} must use https for desktop release builds.`);
  }
  return url.toString().replace(/\/$/, "");
}

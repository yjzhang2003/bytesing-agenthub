import { cp, mkdir, rm, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const desktopDist = join(root, "apps", "desktop", "dist");
const bundleRoot = join(desktopDist, "bundle");

const paths = {
  webDist: join(root, "apps", "web", "dist"),
  controlPlaneDist: join(root, "dist", "services", "control-plane", "src"),
  runtimeDist: join(root, "dist", "runtimes", "desktop", "src"),
  contractsDist: join(root, "dist", "packages", "contracts", "src"),
  zodPackage: join(root, "node_modules", "zod"),
};

await rm(bundleRoot, { force: true, recursive: true });
await mkdir(bundleRoot, { recursive: true });

await copyRequired(paths.webDist, join(bundleRoot, "web"), "Web UI build");
await copyRequired(
  paths.controlPlaneDist,
  join(bundleRoot, "services", "control-plane"),
  "Control Plane build",
);
await copyRequired(paths.runtimeDist, join(bundleRoot, "runtimes", "desktop"), "Desktop Runtime build");
await copyRequired(
  paths.contractsDist,
  join(bundleRoot, "node_modules", "@agenthub", "contracts", "dist"),
  "contracts build",
);
await writeFile(
  join(bundleRoot, "node_modules", "@agenthub", "contracts", "package.json"),
  `${JSON.stringify(
    {
      name: "@agenthub/contracts",
      type: "module",
      exports: {
        ".": {
          default: "./dist/index.js",
          types: "./dist/index.d.ts",
        },
      },
    },
    null,
    2,
  )}\n`,
  "utf8",
);
await copyRequired(paths.zodPackage, join(bundleRoot, "node_modules", "zod"), "zod package");

console.log(`[desktop] prepared local service bundle at ${bundleRoot}`);

async function copyRequired(source, target, label) {
  await cp(source, target, { dereference: true, recursive: true }).catch((error) => {
    throw new Error(`${label} is missing; build required workspace packages first: ${error.message}`);
  });
}

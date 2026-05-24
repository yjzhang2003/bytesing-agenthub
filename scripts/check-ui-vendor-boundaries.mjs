import { execFile } from "node:child_process";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { promisify } from "node:util";

const root = process.cwd();
const uiRoot = path.join(root, "packages", "ui");
const sourceRoots = [
  path.join(uiRoot, "src"),
  path.join(uiRoot, "test"),
];

const forbiddenPackageNames = new Set(["antd", "@ant-design/icons", "@ant-design/x"]);
const forbiddenImportPattern =
  /(?:from\s+["']|import\s*\(\s*["']|import\s+["'])(antd(?:\/[^"']*)?|@ant-design\/(?:icons|x)(?:\/[^"']*)?)["']/g;
const forbiddenCssPattern = /\.(?:ant-[A-Za-z0-9_-]+|agenthub-antd-[A-Za-z0-9_-]+)/g;
const forbiddenLockfilePattern = /(?:^|[\s'"/])(?:antd|@ant-design\/(?:icons|x))(?:@|[\s:'"/]|$)/m;
const execFileAsync = promisify(execFile);

async function readJson(filePath) {
  return JSON.parse(await readFile(filePath, "utf8"));
}

async function* walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const filePath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      yield* walk(filePath);
    } else if (/\.(?:ts|tsx|js|jsx|css|md)$/.test(entry.name)) {
      yield filePath;
    }
  }
}

function formatPath(filePath) {
  return path.relative(root, filePath);
}

const failures = [];

const packageJsonPath = path.join(uiRoot, "package.json");
const packageJson = await readJson(packageJsonPath);
for (const field of ["dependencies", "devDependencies", "peerDependencies", "optionalDependencies"]) {
  const deps = packageJson[field] ?? {};
  for (const depName of Object.keys(deps)) {
    if (forbiddenPackageNames.has(depName)) {
      failures.push(`${formatPath(packageJsonPath)}: forbidden ${field} entry "${depName}"`);
    }
  }
}

const lockfilePath = path.join(root, "pnpm-lock.yaml");
const lockfile = await readFile(lockfilePath, "utf8");
if (forbiddenLockfilePattern.test(lockfile)) {
  failures.push(`${formatPath(lockfilePath)}: forbidden Ant Design package remains in lockfile`);
}

try {
  const { stdout } = await execFileAsync("pnpm", [
    "list",
    "--filter",
    "@agenthub/ui",
    "--depth",
    "Infinity",
    "--json",
  ], {
    cwd: root,
    maxBuffer: 1024 * 1024 * 8,
  });
  const dependencyGraph = JSON.stringify(JSON.parse(stdout));
  for (const depName of forbiddenPackageNames) {
    if (dependencyGraph.includes(`"name":"${depName}"`) || dependencyGraph.includes(`"/${depName}@`)) {
      failures.push(`pnpm list @agenthub/ui: forbidden resolved dependency "${depName}"`);
    }
  }
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  failures.push(`pnpm list @agenthub/ui: unable to inspect resolved dependency graph (${message})`);
}

for (const sourceRoot of sourceRoots) {
  for await (const filePath of walk(sourceRoot)) {
    const text = await readFile(filePath, "utf8");
    for (const match of text.matchAll(forbiddenImportPattern)) {
      failures.push(`${formatPath(filePath)}: forbidden import "${match[1]}"`);
    }
    for (const match of text.matchAll(forbiddenCssPattern)) {
      failures.push(`${formatPath(filePath)}: forbidden vendor selector "${match[0]}"`);
    }
  }
}

if (failures.length > 0) {
  console.error("AgentHub UI vendor boundary check failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exitCode = 1;
} else {
  console.log("AgentHub UI vendor boundary check passed.");
}

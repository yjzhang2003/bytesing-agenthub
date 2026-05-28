import { execFileSync, spawnSync } from "node:child_process";
import { existsSync } from "node:fs";

const supportedExtensions = new Set([
  ".cts",
  ".js",
  ".json",
  ".md",
  ".mjs",
  ".ts",
  ".tsx",
  ".yaml",
  ".yml",
]);

function git(args) {
  return execFileSync("git", args, { encoding: "utf8" }).trim();
}

function changedFiles() {
  if (process.env.GITHUB_BASE_REF) {
    execFileSync("git", ["fetch", "origin", process.env.GITHUB_BASE_REF, "--depth=1"], {
      stdio: "inherit",
    });
    return git([
      "diff",
      "--name-only",
      "--diff-filter=ACMR",
      `origin/${process.env.GITHUB_BASE_REF}...HEAD`,
    ]);
  }

  const tracked = git(["diff", "--name-only", "--diff-filter=ACMR", "HEAD"]);
  const staged = git(["diff", "--cached", "--name-only", "--diff-filter=ACMR"]);
  return [tracked, staged].filter(Boolean).join("\n");
}

const files = [...new Set(changedFiles().split("\n").filter(Boolean))]
  .filter((file) => file !== "pnpm-lock.yaml")
  .filter((file) => existsSync(file))
  .filter((file) => {
    const dotIndex = file.lastIndexOf(".");
    return dotIndex >= 0 && supportedExtensions.has(file.slice(dotIndex));
  });

if (files.length === 0) {
  console.log("No changed files require Prettier checks.");
  process.exit(0);
}

const result = spawnSync("pnpm", ["exec", "prettier", "--check", ...files], {
  stdio: "inherit",
});

process.exit(result.status ?? 1);

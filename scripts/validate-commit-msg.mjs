import { readFileSync } from "node:fs";

const messageFile = process.argv[2];
const message = messageFile
  ? readFileSync(messageFile, "utf8").trim()
  : readFileSync(0, "utf8").trim();

const firstLine = message.split(/\r?\n/, 1)[0] ?? "";
const conventionalCommitPattern =
  /^(build|chore|ci|docs|feat|fix|perf|refactor|revert|style|test)(\([a-z0-9-]+\))?!?: .{1,72}$/;

if (!conventionalCommitPattern.test(firstLine)) {
  console.error("Invalid commit message.");
  console.error("");
  console.error("Use Conventional Commits:");
  console.error("  <type>(optional-scope): <subject>");
  console.error("");
  console.error("Examples:");
  console.error("  feat(runtime): add smoke provider");
  console.error("  fix(web): handle local event stream auth");
  console.error("  docs(openspec): archive runnable topology change");
  process.exit(1);
}

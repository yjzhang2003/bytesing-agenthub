import { execFile } from "node:child_process";
import { promisify } from "node:util";
import type { DiffFileSummary } from "@agenthub/contracts";

const execFileAsync = promisify(execFile);

export interface WorkspaceGitMetadata {
  readonly branch: string | null;
  readonly baseCommit: string | null;
  readonly dirty: boolean;
}

export async function readWorkspaceGitMetadata(workspacePath: string): Promise<WorkspaceGitMetadata> {
  const [branch, baseCommit, status] = await Promise.all([
    gitOrNull(workspacePath, ["rev-parse", "--abbrev-ref", "HEAD"]),
    gitOrNull(workspacePath, ["rev-parse", "HEAD"]),
    gitOrNull(workspacePath, ["status", "--porcelain"]),
  ]);

  return {
    branch,
    baseCommit,
    dirty: Boolean(status),
  };
}

export async function readDiffSummary(workspacePath: string): Promise<readonly DiffFileSummary[]> {
  const output = await gitOrNull(workspacePath, ["diff", "--numstat", "--no-renames"]);
  if (!output) {
    return [];
  }

  return output
    .split("\n")
    .filter(Boolean)
    .map((line): DiffFileSummary => {
      const [insertions = "0", deletions = "0", path = ""] = line.split("\t");
      return {
        path,
        status: "modified",
        insertions: Number.parseInt(insertions, 10) || 0,
        deletions: Number.parseInt(deletions, 10) || 0,
      };
    });
}

async function gitOrNull(cwd: string, args: readonly string[]): Promise<string | null> {
  try {
    const { stdout } = await execFileAsync("git", [...args], { cwd });
    return stdout.trim() || null;
  } catch {
    return null;
  }
}


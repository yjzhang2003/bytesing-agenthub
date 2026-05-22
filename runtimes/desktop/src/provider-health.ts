import { access } from "node:fs/promises";
import { constants } from "node:fs";
import { execFile } from "node:child_process";
import { delimiter, join } from "node:path";
import type { AgentHubProviderMode, ProviderHealth } from "@agenthub/contracts";

export interface ClaudeCodeProviderHealthInput {
  readonly providerMode: AgentHubProviderMode;
  readonly binaryPath: string;
  readonly now?: () => Date;
}

function execFileResult(
  command: string,
  args: readonly string[],
  timeoutMs = 2_000,
): Promise<{ readonly code: number | null; readonly stdout: string; readonly stderr: string }> {
  return new Promise((resolve) => {
    const child = execFile(command, [...args], { timeout: timeoutMs }, (error, stdout, stderr) => {
      if (error && typeof (error as { code?: unknown }).code === "number") {
        resolve({ code: (error as { code: number }).code, stdout, stderr });
        return;
      }
      if (error) {
        resolve({ code: 1, stdout, stderr: stderr || error.message });
        return;
      }
      resolve({ code: 0, stdout, stderr });
    });
    child.on("error", (error) => {
      resolve({ code: 1, stdout: "", stderr: error.message });
    });
  });
}

async function resolveBinary(binaryPath: string): Promise<string | null> {
  if (binaryPath.includes("/")) {
    try {
      await access(binaryPath, constants.X_OK);
      return binaryPath;
    } catch {
      return null;
    }
  }

  for (const pathEntry of (process.env.PATH ?? "").split(delimiter)) {
    if (!pathEntry) {
      continue;
    }
    const candidate = join(pathEntry, binaryPath);
    try {
      await access(candidate, constants.X_OK);
      return candidate;
    } catch {
      // Keep looking through PATH entries.
    }
  }
  return null;
}

export async function checkClaudeCodeProviderHealth(
  input: ClaudeCodeProviderHealthInput,
): Promise<ProviderHealth> {
  const checkedAt = (input.now ?? (() => new Date()))().toISOString();
  if (input.providerMode === "smoke") {
    return {
      providerMode: "smoke",
      status: "connected",
      binaryPathLabel: "smoke",
      checkedAt,
      failureReason: null,
    };
  }

  const binaryPath = input.binaryPath.trim();
  if (!binaryPath || /[\s\0]/u.test(binaryPath)) {
    return {
      providerMode: input.providerMode,
      status: "misconfigured",
      binaryPathLabel: input.binaryPath,
      checkedAt,
      failureReason: "Claude Code binary path is empty or contains invalid whitespace",
    };
  }

  const resolved = await resolveBinary(binaryPath);
  if (!resolved) {
    return {
      providerMode: input.providerMode,
      status: "missing",
      binaryPathLabel: binaryPath,
      checkedAt,
      failureReason: "Claude Code binary was not found or is not executable",
    };
  }

  const version = await execFileResult(resolved, ["--version"], 2_000);
  if (version.code !== 0) {
    return {
      providerMode: input.providerMode,
      status: "unavailable",
      binaryPathLabel: resolved,
      checkedAt,
      failureReason: version.stderr || "Claude Code preflight failed",
    };
  }

  return {
    providerMode: input.providerMode,
    status: "connected",
    binaryPathLabel: resolved,
    checkedAt,
    failureReason: null,
  };
}

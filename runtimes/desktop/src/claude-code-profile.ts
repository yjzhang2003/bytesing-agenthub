import { constants } from "node:fs";
import { access, mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { basename, join } from "node:path";
import type {
  ClaudeCodeHooksPolicy,
  ClaudeCodeSettingsSource,
  ClaudeCodeRunOptions,
} from "@agenthub/contracts";

export interface MaterializeClaudeCodeProfileInput extends ClaudeCodeRunOptions {
  readonly profileRoot: string;
  readonly workspacePath: string;
  readonly workspaceId: string;
  readonly agentId: string;
  readonly runId?: string;
  readonly settingsSource: ClaudeCodeSettingsSource;
  readonly hooksPolicy?: ClaudeCodeHooksPolicy;
  readonly mcpConfig?: Record<string, unknown>;
}

export interface MaterializedClaudeCodeProfile {
  readonly profilePathLabel: string;
  readonly settingsPath?: string;
  readonly mcpConfigPath?: string;
  readonly settingSources: string;
  readonly strictMcpConfig: boolean;
}

export interface ClaudeCodeRuntimeDiscoveryInput {
  readonly binaryPath: string;
  readonly workspacePath: string;
  readonly pluginDirs?: readonly string[];
  readonly profileRoot: string;
  readonly now?: () => Date;
}

export interface ClaudeCodePluginSummary {
  readonly name: string;
  readonly version: string | null;
  readonly pathLabel: string;
}

export interface ClaudeCodeSkillSummary {
  readonly name: string;
  readonly description: string;
  readonly pluginName: string;
  readonly pathLabel: string;
}

export interface ClaudeCodeMcpServerSummary {
  readonly name: string;
  readonly transport: "stdio" | "http" | "sse" | "unknown";
}

export interface ClaudeCodeRuntimeDiscovery {
  readonly binaryPathLabel: string;
  readonly checkedAt: string;
  readonly profileRootLabel: string;
  readonly plugins: readonly ClaudeCodePluginSummary[];
  readonly skills: readonly ClaudeCodeSkillSummary[];
  readonly mcpServers: readonly ClaudeCodeMcpServerSummary[];
  readonly workspaceClaudeFiles: {
    readonly claudeDir: boolean;
    readonly settingsJson: boolean;
    readonly settingsLocalJson: boolean;
    readonly mcpJson: boolean;
    readonly claudeMd: boolean;
  };
}

export async function materializeClaudeCodeProfile(
  input: MaterializeClaudeCodeProfileInput,
): Promise<MaterializedClaudeCodeProfile> {
  const profilePath = join(
    input.profileRoot,
    safePathSegment(input.workspaceId),
    safePathSegment(input.agentId),
    safePathSegment(input.runId ?? "default"),
  );
  await mkdir(profilePath, { recursive: true });

  if (input.settingsSource === "inherit") {
    return {
      profilePathLabel: profilePath,
      settingSources: "user,project,local",
      strictMcpConfig: false,
    };
  }

  const settingsPath = join(profilePath, "settings.json");
  await writeFile(settingsPath, JSON.stringify(createSettings(input), null, 2));

  const mcpConfigPath = input.mcpConfig ? join(profilePath, "mcp.json") : undefined;
  if (mcpConfigPath && input.mcpConfig) {
    await writeFile(mcpConfigPath, JSON.stringify(input.mcpConfig, null, 2));
  }

  return {
    profilePathLabel: profilePath,
    settingsPath,
    ...(mcpConfigPath ? { mcpConfigPath } : {}),
    settingSources: input.settingsSource === "isolated" ? "local" : "project,local",
    strictMcpConfig: input.settingsSource === "isolated",
  };
}

export async function discoverClaudeCodeRuntime(
  input: ClaudeCodeRuntimeDiscoveryInput,
): Promise<ClaudeCodeRuntimeDiscovery> {
  const plugins = await Promise.all((input.pluginDirs ?? []).map(readPluginSummary));
  const presentPlugins = plugins.filter((plugin): plugin is ClaudeCodePluginSummary =>
    Boolean(plugin),
  );
  const skills = (
    await Promise.all(
      presentPlugins.map((plugin) => readSkillSummaries(plugin.pathLabel, plugin.name)),
    )
  ).flat();

  return {
    binaryPathLabel: input.binaryPath,
    checkedAt: (input.now ?? (() => new Date()))().toISOString(),
    profileRootLabel: input.profileRoot,
    plugins: presentPlugins,
    skills,
    mcpServers: await readWorkspaceMcpServers(input.workspacePath),
    workspaceClaudeFiles: {
      claudeDir: await exists(join(input.workspacePath, ".claude")),
      settingsJson: await exists(join(input.workspacePath, ".claude", "settings.json")),
      settingsLocalJson: await exists(join(input.workspacePath, ".claude", "settings.local.json")),
      mcpJson: await exists(join(input.workspacePath, ".mcp.json")),
      claudeMd: await exists(join(input.workspacePath, "CLAUDE.md")),
    },
  };
}

function createSettings(input: MaterializeClaudeCodeProfileInput): Record<string, unknown> {
  return {
    ...(input.allowedTools || input.disallowedTools
      ? {
          permissions: {
            ...(input.allowedTools ? { allow: [...input.allowedTools] } : {}),
            ...(input.disallowedTools ? { deny: [...input.disallowedTools] } : {}),
          },
        }
      : {}),
    ...(input.hooksPolicy === "disabled" ? { hooks: {} } : {}),
  };
}

async function readPluginSummary(pluginPath: string): Promise<ClaudeCodePluginSummary | null> {
  const directManifest = join(pluginPath, "plugin.json");
  const claudeManifest = join(pluginPath, ".claude-plugin", "plugin.json");
  const manifestPath = (await exists(directManifest)) ? directManifest : claudeManifest;
  if (!(await exists(manifestPath))) {
    return {
      name: basename(pluginPath),
      version: null,
      pathLabel: pluginPath,
    };
  }

  const parsed = JSON.parse(await readFile(manifestPath, "utf8")) as {
    name?: unknown;
    version?: unknown;
  };
  return {
    name: typeof parsed.name === "string" ? parsed.name : basename(pluginPath),
    version: typeof parsed.version === "string" ? parsed.version : null,
    pathLabel: pluginPath,
  };
}

async function readSkillSummaries(
  pluginPath: string,
  pluginName: string,
): Promise<readonly ClaudeCodeSkillSummary[]> {
  const skillsPath = join(pluginPath, "skills");
  if (!(await exists(skillsPath))) {
    return [];
  }

  const entries = await readdir(skillsPath, { withFileTypes: true }).catch(() => []);
  const summaries: ClaudeCodeSkillSummary[] = [];
  for (const entry of entries) {
    if (!entry.isDirectory()) {
      continue;
    }
    const skillPath = join(skillsPath, entry.name, "SKILL.md");
    if (!(await exists(skillPath))) {
      continue;
    }
    const frontmatter = parseSkillFrontmatter(await readFile(skillPath, "utf8"));
    summaries.push({
      name: frontmatter.name ?? entry.name,
      description: frontmatter.description ?? "",
      pluginName,
      pathLabel: skillPath,
    });
  }
  return summaries;
}

async function readWorkspaceMcpServers(
  workspacePath: string,
): Promise<readonly ClaudeCodeMcpServerSummary[]> {
  const mcpPath = join(workspacePath, ".mcp.json");
  if (!(await exists(mcpPath))) {
    return [];
  }

  const parsed = JSON.parse(await readFile(mcpPath, "utf8")) as {
    mcpServers?: Record<string, { transport?: unknown; type?: unknown; url?: unknown }>;
  };
  return Object.entries(parsed.mcpServers ?? {}).map(([name, server]) => ({
    name,
    transport: inferTransport(server),
  }));
}

function inferTransport(server: { transport?: unknown; type?: unknown; url?: unknown }) {
  const explicit = typeof server.transport === "string" ? server.transport : server.type;
  if (explicit === "http" || explicit === "sse" || explicit === "stdio") {
    return explicit;
  }
  if (typeof server.url === "string") {
    return "http";
  }
  return "stdio";
}

function parseSkillFrontmatter(content: string): {
  readonly name?: string;
  readonly description?: string;
} {
  const match = /^---\n([\s\S]*?)\n---/u.exec(content);
  const frontmatter = match?.[1];
  if (!frontmatter) {
    return {};
  }
  const fields = new Map<string, string>();
  for (const line of frontmatter.split("\n")) {
    const separator = line.indexOf(":");
    if (separator <= 0) {
      continue;
    }
    fields.set(line.slice(0, separator).trim(), line.slice(separator + 1).trim());
  }
  const name = fields.get("name");
  const description = fields.get("description");
  return {
    ...(name ? { name } : {}),
    ...(description ? { description } : {}),
  };
}

async function exists(path: string): Promise<boolean> {
  try {
    await access(path, constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

function safePathSegment(value: string): string {
  return value.replace(/[^a-zA-Z0-9_.-]/gu, "_");
}

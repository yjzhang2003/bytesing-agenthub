import { spawn, type ChildProcessWithoutNullStreams } from "node:child_process";
import type {
  AgentRunHandle,
  AgentRunRequest,
  ClaudeCodeLaunchOptions,
  ProviderAdapter,
  RuntimeEventSink,
} from "./provider-adapter.js";

export interface ClaudeCodeProviderAdapterOptions {
  readonly binaryPath: string;
  readonly extraArgs?: readonly string[];
}

export class ClaudeCodeProviderAdapter implements ProviderAdapter {
  readonly kind = "claude-code";
  readonly #options: ClaudeCodeProviderAdapterOptions;

  constructor(options: ClaudeCodeProviderAdapterOptions) {
    this.#options = options;
  }

  async startRun(request: AgentRunRequest, sink: RuntimeEventSink): Promise<AgentRunHandle> {
    const child = this.#spawnClaude(request);
    sink({
      type: "run.status",
      runId: request.runId,
      agentId: request.agentId,
      status: "running",
      message: "Claude Code process started",
    });

    let stdoutBuffer = "";
    let stderrBuffer = "";
    const streamState: ClaudeStreamState = { sawPartialText: false, sessionId: null };
    child.stdout.on("data", (chunk: Buffer) => {
      stdoutBuffer = this.#handleStdoutChunk(
        request,
        sink,
        stdoutBuffer + chunk.toString("utf8"),
        streamState,
      );
    });

    child.stderr.on("data", (chunk: Buffer) => {
      stderrBuffer = `${stderrBuffer}${chunk.toString("utf8")}`.slice(-4_000);
      sink({
        type: "run.status",
        runId: request.runId,
        agentId: request.agentId,
        status: "streaming",
        message: chunk.toString("utf8"),
      });
    });

    let settled = false;
    const done = new Promise<void>((resolve) => {
      child.on("error", (error) => {
        if (settled) {
          return;
        }
        settled = true;
        sink({
          type: "run.status",
          runId: request.runId,
          agentId: request.agentId,
          status: "failed",
          message: `Claude Code process failed to start: ${error.message}`,
        });
        resolve();
      });
      child.on("close", (code) => {
        if (settled) {
          return;
        }
        settled = true;
        sink({
          type: "run.status",
          runId: request.runId,
          agentId: request.agentId,
          status: code === 0 ? "completed" : "failed",
          message:
            code === 0
              ? "Claude Code process completed"
              : formatClaudeFailure(code, stderrBuffer),
        });
        resolve();
      });
    });

    return {
      runId: request.runId,
      async cancel() {
        child.kill("SIGTERM");
        sink({
          type: "run.status",
          runId: request.runId,
          agentId: request.agentId,
          status: "cancelling",
          message: "Cancellation requested",
        });
      },
      done,
    };
  }

  #spawnClaude(request: AgentRunRequest): ChildProcessWithoutNullStreams {
    const prompt = [
      request.systemPrompt,
      "",
      ...request.conversationContext,
      "",
      request.prompt,
    ].join("\n");

    return spawn(this.#options.binaryPath, this.#buildArgs(prompt, request.claudeCode), {
      cwd: request.workspacePath,
      env: process.env,
    });
  }

  #buildArgs(prompt: string, options: ClaudeCodeLaunchOptions | undefined): string[] {
    return [
      "-p",
      prompt,
      "--output-format",
      "stream-json",
      "--verbose",
      "--include-partial-messages",
      ...this.#optionArgs(options),
      ...(this.#options.extraArgs ?? []),
    ];
  }

  #optionArgs(options: ClaudeCodeLaunchOptions | undefined): string[] {
    if (!options) {
      return [];
    }
    const args: string[] = [];
    if (options.permissionPreset) {
      args.push("--permission-mode", permissionModeForPreset(options.permissionPreset));
    }
    if (options.settingSources) {
      args.push("--setting-sources", options.settingSources);
    } else if (options.settingsSource) {
      args.push("--setting-sources", settingSourcesForMode(options.settingsSource));
    }
    if (options.settingsPath) {
      args.push("--settings", options.settingsPath);
    }
    if (options.mcpConfigPath) {
      args.push("--mcp-config", options.mcpConfigPath);
    }
    if (options.strictMcpConfig) {
      args.push("--strict-mcp-config");
    }
    for (const pluginDir of options.pluginDirs ?? []) {
      args.push("--plugin-dir", pluginDir);
    }
    if (options.allowedTools?.length) {
      args.push("--allowedTools", options.allowedTools.join(","));
    }
    if (options.disallowedTools?.length) {
      args.push("--disallowedTools", options.disallowedTools.join(","));
    }
    if (options.effort) {
      args.push("--effort", options.effort);
    }
    if (options.session?.behavior === "continue") {
      args.push(options.session.sessionId ? "--resume" : "--continue");
      if (options.session.sessionId) {
        args.push(options.session.sessionId);
      }
    }
    if (options.session?.behavior === "fork") {
      if (options.session.sessionId) {
        args.push("--resume", options.session.sessionId);
      }
      args.push("--fork-session");
    }
    return args;
  }

  #handleStdoutChunk(
    request: AgentRunRequest,
    sink: RuntimeEventSink,
    buffer: string,
    streamState: ClaudeStreamState,
  ): string {
    const lines = buffer.split(/\r?\n/u);
    const remainder = lines.pop() ?? "";
    for (const line of lines) {
      if (!line.trim()) {
        continue;
      }
      const sessionId = parseClaudeSessionId(line);
      if (sessionId && streamState.sessionId !== sessionId) {
        streamState.sessionId = sessionId;
        sink({
          type: "provider.session",
          runId: request.runId,
          agentId: request.agentId,
          providerMode: "claude-code",
          sessionId,
        });
      }
      const parsed = parseClaudeStreamText(line);
      if (parsed === null) {
        continue;
      }
      if (!parsed.partial && streamState.sawPartialText) {
        continue;
      }
      if (parsed.partial) {
        streamState.sawPartialText = true;
      }
      sink({
        type: "message.delta",
        runId: request.runId,
        agentId: request.agentId,
        delta: parsed.text,
      });
    }
    return remainder;
  }
}

interface ClaudeStreamState {
  sawPartialText: boolean;
  sessionId: string | null;
}

type ParsedClaudeStreamText = {
  readonly partial: boolean;
  readonly text: string;
};

function permissionModeForPreset(
  preset: NonNullable<ClaudeCodeLaunchOptions["permissionPreset"]>,
): string {
  switch (preset) {
    case "plan-only":
      return "plan";
    case "auto-edits":
      return "acceptEdits";
    case "full-access":
      return "bypassPermissions";
    case "ask-first":
      return "default";
  }
}

function settingSourcesForMode(mode: NonNullable<ClaudeCodeLaunchOptions["settingsSource"]>): string {
  switch (mode) {
    case "inherit":
      return "user,project,local";
    case "managed":
      return "project,local";
    case "isolated":
      return "local";
  }
}

function formatClaudeFailure(code: number | null, stderr: string): string {
  const reason = stderr.trim().replace(/\s+/gu, " ");
  const exitLabel = code === null ? "unknown code" : code;
  return reason ? `Claude Code exited with ${exitLabel}: ${reason}` : `Claude Code exited with ${exitLabel}`;
}

function parseClaudeStreamText(line: string): ParsedClaudeStreamText | null {
  try {
    const parsed = JSON.parse(line) as {
      type?: unknown;
      event?: {
        type?: unknown;
        delta?: {
          type?: unknown;
          text?: unknown;
        };
      };
      message?: { content?: readonly { type?: unknown; text?: unknown }[] };
    };
    if (
      parsed.type === "stream_event" &&
      parsed.event?.type === "content_block_delta" &&
      parsed.event.delta?.type === "text_delta" &&
      typeof parsed.event.delta.text === "string"
    ) {
      return parsed.event.delta.text ? { partial: true, text: parsed.event.delta.text } : null;
    }
    if (parsed.type !== "assistant" || !Array.isArray(parsed.message?.content)) {
      return null;
    }
    const text = parsed.message.content
      .filter((part) => part.type === "text" && typeof part.text === "string")
      .map((part) => part.text)
      .join("");
    return text ? { partial: false, text } : null;
  } catch {
    return { partial: false, text: line };
  }
}

function parseClaudeSessionId(line: string): string | null {
  try {
    const parsed = JSON.parse(line) as unknown;
    return findSessionId(parsed);
  } catch {
    return null;
  }
}

function findSessionId(value: unknown): string | null {
  if (!value || typeof value !== "object") {
    return null;
  }
  if (Array.isArray(value)) {
    for (const item of value) {
      const found = findSessionId(item);
      if (found) {
        return found;
      }
    }
    return null;
  }
  const record = value as Record<string, unknown>;
  const direct = record["session_id"] ?? record["sessionId"];
  if (typeof direct === "string" && direct.trim()) {
    return direct;
  }
  for (const item of Object.values(record)) {
    const found = findSessionId(item);
    if (found) {
      return found;
    }
  }
  return null;
}

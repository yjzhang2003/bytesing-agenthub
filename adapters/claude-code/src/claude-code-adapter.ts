import { spawn, type ChildProcessWithoutNullStreams } from "node:child_process";
import type {
  AgentRunHandle,
  AgentRunRequest,
  ProviderAdapter,
  RuntimeEventSink,
} from "@agenthub/desktop-runtime";

export interface ClaudeCodeAdapterOptions {
  readonly binaryPath: string;
  readonly extraArgs?: readonly string[];
}

export class ClaudeCodeAdapter implements ProviderAdapter {
  readonly kind = "claude-code-local-process";
  readonly #options: ClaudeCodeAdapterOptions;

  constructor(options: ClaudeCodeAdapterOptions) {
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

    child.stdout.on("data", (chunk: Buffer) => {
      sink({
        type: "message.delta",
        runId: request.runId,
        agentId: request.agentId,
        delta: chunk.toString("utf8"),
      });
    });

    child.stderr.on("data", (chunk: Buffer) => {
      sink({
        type: "run.status",
        runId: request.runId,
        agentId: request.agentId,
        status: "streaming",
        message: chunk.toString("utf8"),
      });
    });

    const done = new Promise<void>((resolve) => {
      child.on("close", (code) => {
        sink({
          type: "run.status",
          runId: request.runId,
          agentId: request.agentId,
          status: code === 0 ? "completed" : "failed",
          message: code === 0 ? "Claude Code process completed" : `Claude Code exited with ${code}`,
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

    return spawn(this.#options.binaryPath, ["-p", prompt, ...(this.#options.extraArgs ?? [])], {
      cwd: request.workspacePath,
      env: process.env,
    });
  }
}


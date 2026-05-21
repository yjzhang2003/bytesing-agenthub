import type { ProviderAdapter } from "./provider-adapter.js";

export class SmokeProviderAdapter implements ProviderAdapter {
  readonly kind = "smoke";

  async startRun(request: Parameters<ProviderAdapter["startRun"]>[0], sink: Parameters<ProviderAdapter["startRun"]>[1]) {
    let cancelled = false;
    const done = (async () => {
      sink({
        type: "run.status",
        runId: request.runId,
        agentId: request.agentId,
        status: "running",
        message: "Smoke provider started",
      });
      await new Promise((resolve) => setTimeout(resolve, 25));
      if (cancelled) {
        sink({
          type: "run.status",
          runId: request.runId,
          agentId: request.agentId,
          status: "cancelled",
          message: "Smoke provider cancelled",
        });
        return;
      }
      sink({
        type: "message.delta",
        runId: request.runId,
        agentId: request.agentId,
        delta: `Smoke provider received: ${request.prompt}`,
      });
      sink({
        type: "run.status",
        runId: request.runId,
        agentId: request.agentId,
        status: "completed",
        message: "Smoke provider completed",
      });
    })();

    return {
      runId: request.runId,
      async cancel() {
        cancelled = true;
      },
      done,
    };
  }
}

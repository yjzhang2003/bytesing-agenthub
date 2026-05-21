import type { AgentHubEvent } from "@agenthub/contracts";

export type EventListener = (event: AgentHubEvent) => void;

export class ControlPlaneEventBus {
  readonly #listeners = new Set<EventListener>();
  readonly #events: AgentHubEvent[] = [];

  publish(event: AgentHubEvent): void {
    this.#events.push(event);
    for (const listener of this.#listeners) {
      listener(event);
    }
  }

  subscribe(listener: EventListener): () => void {
    this.#listeners.add(listener);
    return () => {
      this.#listeners.delete(listener);
    };
  }

  snapshot(): readonly AgentHubEvent[] {
    return [...this.#events];
  }
}


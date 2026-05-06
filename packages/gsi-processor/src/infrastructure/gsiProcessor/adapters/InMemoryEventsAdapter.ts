import type { EventsPort } from "../../../application/gsiProcessor/ports/EventsPort";
import type { GsiProcessorEvent } from "../../../domain/gsiProcessor/gsiProcessorTypes";

/**
 * In-memory pub/sub bus for processor domain events.
 */
export class InMemoryEventsAdapter implements EventsPort {
  private listeners: Array<(event: GsiProcessorEvent) => void> = [];

  publish(event: GsiProcessorEvent): void {
    for (const listener of this.listeners) {
      listener(event);
    }
  }

  subscribe(listener: (event: GsiProcessorEvent) => void): () => void {
    this.listeners = [...this.listeners, listener];
    return () => {
      this.listeners = this.listeners.filter((entry) => entry !== listener);
    };
  }
}

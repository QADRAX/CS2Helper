import type { StatePort } from "../../../application/gsiProcessor/ports/StatePort";
import type { GsiProcessorState } from "../../../domain/gsiProcessor/gsiProcessorTypes";

/**
 * In-memory persistence and subscription for aggregate state.
 */
export class InMemoryStateAdapter implements StatePort {
  private listeners: Array<(state: Readonly<GsiProcessorState>) => void> = [];

  constructor(private state: GsiProcessorState) {}

  getState(): Readonly<GsiProcessorState> {
    return this.state;
  }

  setState(state: GsiProcessorState): void {
    this.state = state;
    this.listeners.forEach((listener) => listener(state));
  }

  subscribeState(listener: (state: Readonly<GsiProcessorState>) => void): () => void {
    this.listeners = [...this.listeners, listener];
    return () => {
      this.listeners = this.listeners.filter((entry) => entry !== listener);
    };
  }
}

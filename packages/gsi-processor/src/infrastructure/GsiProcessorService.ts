import {
  getState,
  processTick,
  subscribeEvents,
  subscribeState,
} from "../application";
import {
  type GSIProcessor,
  createInitialGsiProcessorMemory,
  createInitialGsiProcessorState,
} from "../domain";
import { InMemoryEventsAdapter } from "./adapters/InMemoryEventsAdapter";
import { InMemoryMemoryAdapter } from "./adapters/InMemoryMemoryAdapter";
import { InMemoryStateAdapter } from "./adapters/InMemoryStateAdapter";
import { SystemClockAdapter } from "./adapters/SystemClockAdapter";

export interface GsiProcessorOptions {
  /** Deterministic timestamp source, mainly useful for tests and replays. */
  getTimestamp?: () => number;
}

/**
 * Composition root that assembles a GSI processor using class-based adapters.
 * Implements the domain contract by delegating to standardized application use cases.
 */
export class GsiProcessorService implements GSIProcessor {
  private readonly statePort: InMemoryStateAdapter;
  private readonly memoryPort: InMemoryMemoryAdapter;
  private readonly eventsPort: InMemoryEventsAdapter;
  private readonly clockPort: SystemClockAdapter | { now: () => number };

  constructor(options: GsiProcessorOptions = {}) {
    this.statePort = new InMemoryStateAdapter(createInitialGsiProcessorState());
    this.memoryPort = new InMemoryMemoryAdapter(createInitialGsiProcessorMemory());
    this.eventsPort = new InMemoryEventsAdapter();
    this.clockPort = options.getTimestamp
      ? { now: options.getTimestamp }
      : new SystemClockAdapter();
  }

  processTick(tick: any, timestamp?: number): void {
    processTick([this.statePort, this.memoryPort, this.eventsPort, this.clockPort], tick, timestamp);
  }

  getState() {
    return getState([this.statePort]);
  }

  subscribeState(listener: (state: any) => void) {
    return subscribeState([this.statePort], listener);
  }

  subscribeEvents(listener: (event: any) => void) {
    return subscribeEvents([this.eventsPort], listener);
  }
}

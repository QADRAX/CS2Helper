import {
  getState,
  processTick,
  subscribeEvents,
  subscribeState,
} from "../../application/gsiProcessor";
import {
  type GSIProcessor,
  createInitialGsiProcessorMemory,
  createInitialGsiProcessorState,
} from "../../domain/gsiProcessor";
import { InMemoryEventsAdapter } from "./adapters/InMemoryEventsAdapter";
import { InMemoryMemoryAdapter } from "./adapters/InMemoryMemoryAdapter";
import { InMemoryStateAdapter } from "./adapters/InMemoryStateAdapter";
import { SystemClockAdapter } from "./adapters/SystemClockAdapter";

/** Optional infrastructure overrides when creating a processor instance. */
export interface CreateGsiProcessorOptions {
  /** Deterministic timestamp source, mainly useful for tests and replays. */
  getTimestamp?: () => number;
}

/**
 * Assembles a fully wired GSI processor instance using class-based adapters.
 */
export function createGsiProcessor(options: CreateGsiProcessorOptions = {}): GSIProcessor {
  const statePort = new InMemoryStateAdapter(createInitialGsiProcessorState());
  const memoryPort = new InMemoryMemoryAdapter(createInitialGsiProcessorMemory());
  const eventsPort = new InMemoryEventsAdapter();
  const clockPort = options.getTimestamp
    ? { now: options.getTimestamp }
    : new SystemClockAdapter();

  return {
    processTick: (tick, timestamp) => processTick(statePort, memoryPort, eventsPort, clockPort, tick, timestamp),
    getState: () => getState(statePort),
    subscribeState: (listener) => subscribeState(statePort, listener),
    subscribeEvents: (listener) => subscribeEvents(eventsPort, listener),
  };
}

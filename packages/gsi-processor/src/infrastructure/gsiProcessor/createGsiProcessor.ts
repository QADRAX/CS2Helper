import {
  createGetStateUseCase,
  createProcessTickUseCase,
  createSubscribeEventsUseCase,
  createSubscribeStateUseCase,
} from "../../application/gsiProcessor";
import {
  composeEngineAPI,
  type CoreEngineUseCaseContext,
  type MatchEngineAPI,
  createInitialCoreEngineMemory,
  createInitialCoreEngineState,
} from "../../domain/gsiProcessor";
import { createInMemoryGsiProcessorEventsBus } from "./internal/createInMemoryGsiProcessorEventsBus";
import { createInMemoryGsiProcessorMemoryStore } from "./internal/createInMemoryGsiProcessorMemoryStore";
import { createInMemoryGsiProcessorStateStore } from "./internal/createInMemoryGsiProcessorStateStore";
import { createSystemClock } from "./internal/createSystemClock";

/** Optional infrastructure overrides when creating a processor instance. */
export interface CreateGsiProcessorOptions {
  /** Deterministic timestamp source, mainly useful for tests and replays. */
  getTimestamp?: () => number;
}

/**
 * Assembles a fully wired GSI processor instance from in-memory adapters.
 *
 * Infrastructure is the composition root: it chooses concrete state/memory/event
 * adapters, creates the application use cases, and exposes them as a public API.
 */
export function createGsiProcessor(options: CreateGsiProcessorOptions = {}): MatchEngineAPI {
  const stateStore = createInMemoryGsiProcessorStateStore(createInitialCoreEngineState());
  const memoryStore = createInMemoryGsiProcessorMemoryStore(createInitialCoreEngineMemory());
  const eventsBus = createInMemoryGsiProcessorEventsBus();
  const clock = options.getTimestamp
    ? { now: options.getTimestamp }
    : createSystemClock();

  const useCaseContext: CoreEngineUseCaseContext = {
    state: stateStore,
    memory: memoryStore,
    events: eventsBus,
    clock,
  };

  const processTickUseCase = createProcessTickUseCase(useCaseContext);
  const getStateUseCase = createGetStateUseCase(useCaseContext);
  const subscribeStateUseCase = createSubscribeStateUseCase(useCaseContext);
  const subscribeEventsUseCase = createSubscribeEventsUseCase(useCaseContext);

  return composeEngineAPI()
    .add("processTick", processTickUseCase)
    .add("getState", getStateUseCase)
    .add("subscribeState", subscribeStateUseCase)
    .add("subscribeEvents", subscribeEventsUseCase)
    .build() as MatchEngineAPI;
}

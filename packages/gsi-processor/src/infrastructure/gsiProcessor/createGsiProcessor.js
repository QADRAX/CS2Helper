import { createGetStateUseCase, createProcessTickUseCase, createSubscribeEventsUseCase, createSubscribeStateUseCase, } from "../../application/gsiProcessor";
import { createInitialGsiProcessorMemory, createInitialGsiProcessorState, } from "../../domain/gsiProcessor";
import { createInMemoryGsiProcessorEventsBus } from "./internal/createInMemoryGsiProcessorEventsBus";
import { createInMemoryGsiProcessorMemoryStore } from "./internal/createInMemoryGsiProcessorMemoryStore";
import { createInMemoryGsiProcessorStateStore } from "./internal/createInMemoryGsiProcessorStateStore";
import { createSystemClock } from "./internal/createSystemClock";
/**
 * Assembles a fully wired GSI processor instance from in-memory adapters.
 *
 * Infrastructure is the composition root: it chooses concrete state/memory/event
 * adapters, creates the application use cases, and exposes them as a public API.
 */
export function createGsiProcessor(options = {}) {
    const stateStore = createInMemoryGsiProcessorStateStore(createInitialGsiProcessorState());
    const memoryStore = createInMemoryGsiProcessorMemoryStore(createInitialGsiProcessorMemory());
    const eventsBus = createInMemoryGsiProcessorEventsBus();
    const clock = options.getTimestamp
        ? { now: options.getTimestamp }
        : createSystemClock();
    const useCaseContext = {
        state: stateStore,
        memory: memoryStore,
        events: eventsBus,
        clock,
    };
    const processTickUseCase = createProcessTickUseCase(useCaseContext);
    const getStateUseCase = createGetStateUseCase(useCaseContext);
    const subscribeStateUseCase = createSubscribeStateUseCase(useCaseContext);
    const subscribeEventsUseCase = createSubscribeEventsUseCase(useCaseContext);
    return {
        processTick: processTickUseCase.execute,
        getState: getStateUseCase.execute,
        subscribeState: subscribeStateUseCase.execute,
        subscribeEvents: subscribeEventsUseCase.execute,
    };
}

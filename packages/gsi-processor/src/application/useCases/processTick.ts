import type { UseCase } from "@cs2helper/shared";
import type { ClockPort, EventsPort, MemoryPort, StatePort } from "../ports";
import { processTickDomain } from "../../domain/processTick";

/**
 * Orchestrates the processing of a single GSI tick through the domain engine.
 *
 * Ports tuple order: `[state, memory, events, clock]`.
 */
export const processTick: UseCase<
  [StatePort, MemoryPort, EventsPort, ClockPort],
  [tick: any, timestamp?: number],
  void
> = ([state, memory, eventsPort, clock], tick, timestamp) => {
  const currentState = state.getState();
  const currentMemory = memory.getMemory();
  const now = timestamp ?? clock.now();

  const { state: newState, memory: newMemory, events } = processTickDomain(
    currentState,
    currentMemory,
    tick,
    now
  );

  state.setState(newState);
  memory.setMemory(newMemory);
  events.forEach((event) => eventsPort.publish(event));
};

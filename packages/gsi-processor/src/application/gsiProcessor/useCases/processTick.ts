import type { UseCase } from "@cs2helper/shared";
import type { StatePort, MemoryPort, EventsPort, ClockPort } from "../ports";
import { processTickDomain } from "../../../domain/gsiProcessor/processTick";

export interface ProcessTickPorts {
  state: StatePort;
  memory: MemoryPort;
  events: EventsPort;
  clock: ClockPort;
}

/**
 * Orchestrates the processing of a single GSI tick through the domain engine.
 */
export const processTick: UseCase<ProcessTickPorts, [tick: any, timestamp?: number], void> = (
  { state, memory, events: eventsPort, clock },
  tick,
  timestamp
) => {
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

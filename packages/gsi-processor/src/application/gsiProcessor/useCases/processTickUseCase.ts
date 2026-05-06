import type { StatePort, MemoryPort, EventsPort, ClockPort } from "../ports";
import { processTickDomain } from "../../../domain/gsiProcessor/processTick";

export const processTick = (
  statePort: StatePort,
  memoryPort: MemoryPort,
  eventsPort: EventsPort,
  clockPort: ClockPort,
  tick: any,
  timestamp?: number
) => {
  const currentState = statePort.getState();
  const currentMemory = memoryPort.getMemory();
  const now = timestamp ?? clockPort.now();

  const { state, memory, events } = processTickDomain(
    currentState,
    currentMemory,
    tick,
    now
  );

  statePort.setState(state);
  memoryPort.setMemory(memory);
  events.forEach((event) => eventsPort.publish(event));
};

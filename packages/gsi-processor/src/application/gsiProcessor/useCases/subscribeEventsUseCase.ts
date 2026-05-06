import type { EventsPort } from "../ports";
import type { GsiProcessorEvent } from "../../../domain/gsiProcessor/gsiProcessorTypes";

export const subscribeEvents = (
  eventsPort: EventsPort,
  listener: (event: GsiProcessorEvent) => void
) => {
  return eventsPort.subscribe(listener);
};

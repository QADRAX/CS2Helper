import type { UseCase } from "@cs2helper/shared";
import type { EventsPort } from "../ports/EventsPort";
import type { GsiProcessorEvent } from "../../../domain/gsiProcessor/gsiProcessorTypes";

export interface SubscribeEventsPorts {
  events: EventsPort;
}

/**
 * Subscribes a listener to the domain events bus.
 */
export const subscribeEvents: UseCase<
  SubscribeEventsPorts,
  [listener: (event: GsiProcessorEvent) => void],
  () => void
> = ({ events }, listener) => {
  return events.subscribe(listener);
};

import type { UseCase } from "@cs2helper/shared";
import type { GsiProcessorEvent } from "../../domain/gsiProcessorTypes";
import type { EventsPort } from "../ports/EventsPort";

/**
 * Subscribes a listener to the domain events bus.
 *
 * Ports tuple order: `[events]`.
 */
export const subscribeEvents: UseCase<
  [EventsPort],
  [listener: (event: GsiProcessorEvent) => void],
  () => void
> = ([events], listener) => {
  return events.subscribe(listener);
};

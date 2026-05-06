import type { GsiProcessorEvent } from "../../../domain/gsiProcessor/gsiProcessorTypes";

/** Event publication/subscription port. */
export interface EventsPort {
  publish: (event: GsiProcessorEvent) => void;
  subscribe: (listener: (event: GsiProcessorEvent) => void) => () => void;
}

import type { GsiProcessorEvent } from "../../domain/gsiProcessorTypes";

/** Event publication/subscription port. */
export interface EventsPort {
  publish: (event: GsiProcessorEvent) => void;
  subscribe: (listener: (event: GsiProcessorEvent) => void) => () => void;
}

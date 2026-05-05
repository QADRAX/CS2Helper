import type { GsiProcessorClockPort } from "../../../domain/gsiProcessor";

/** Clock adapter backed by the local system time. */
export function createSystemClock(): GsiProcessorClockPort {
  return {
    now() {
      return Date.now();
    },
  };
}

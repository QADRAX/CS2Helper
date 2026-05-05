import type { CoreEngineClockPort } from "../../../domain/gsiProcessor";

/** Clock adapter backed by the local system time. */
export function createSystemClock(): CoreEngineClockPort {
  return {
    now() {
      return Date.now();
    },
  };
}

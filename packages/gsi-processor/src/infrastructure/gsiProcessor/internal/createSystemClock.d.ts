import type { GsiProcessorClockPort } from "../../../domain/gsiProcessor";
/** Clock adapter backed by the local system time. */
export declare function createSystemClock(): GsiProcessorClockPort;

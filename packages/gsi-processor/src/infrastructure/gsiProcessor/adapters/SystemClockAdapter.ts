import type { ClockPort } from "../../../application/gsiProcessor/ports/ClockPort";

/**
 * Real-time system clock implementation.
 */
export class SystemClockAdapter implements ClockPort {
  now(): number {
    return Date.now() / 1000;
  }
}

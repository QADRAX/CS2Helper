import type { ClockPort } from "../../application/ports";

export class SystemClockAdapter implements ClockPort {
  now(): Date {
    return new Date();
  }
}

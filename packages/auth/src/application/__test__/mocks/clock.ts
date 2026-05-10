import { vi } from "vitest";
import type { ClockPort } from "../../ports";

export function createClockFake(now = new Date("2026-01-01T00:00:00.000Z")): ClockPort {
  return { now: vi.fn(() => now) };
}

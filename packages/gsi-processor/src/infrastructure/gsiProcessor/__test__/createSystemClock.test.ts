import { describe, expect, it } from "vitest";
import { SystemClockAdapter } from "../adapters/SystemClockAdapter";

describe("SystemClockAdapter", () => {
  it("returns a finite millisecond timestamp", () => {
    const clock = new SystemClockAdapter();
    const t = clock.now();
    expect(typeof t).toBe("number");
    expect(Number.isFinite(t)).toBe(true);
  });
});

import { describe, expect, it } from "vitest";
import { createSystemClock } from "../internal/createSystemClock";

describe("createSystemClock", () => {
  it("returns a finite millisecond timestamp", () => {
    const clock = createSystemClock();
    const t = clock.now();
    expect(typeof t).toBe("number");
    expect(Number.isFinite(t)).toBe(true);
  });
});

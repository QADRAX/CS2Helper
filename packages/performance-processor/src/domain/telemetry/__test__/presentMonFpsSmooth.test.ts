import { describe, expect, it } from "vitest";
import { appendPresentMonFpsSmoothing } from "../presentMonFpsSmooth";

describe("appendPresentMonFpsSmoothing", () => {
  it("adds fpsSmoothed from rolling frametimes", () => {
    const buf: number[] = [];
    const s1 = appendPresentMonFpsSmoothing({ frametimeMs: 20 }, buf, 4);
    expect(s1.fpsSmoothed).toBeCloseTo(50, 5);
    const s2 = appendPresentMonFpsSmoothing({ frametimeMs: 20 }, buf, 4);
    expect(s2.fpsSmoothed).toBeCloseTo(50, 5);
  });

  it("returns sample unchanged when frametime missing", () => {
    const buf: number[] = [];
    const s = appendPresentMonFpsSmoothing({}, buf);
    expect(s.fpsSmoothed).toBeUndefined();
    expect(buf).toEqual([]);
  });
});

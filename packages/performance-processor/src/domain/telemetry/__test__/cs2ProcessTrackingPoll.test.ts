import { describe, expect, it } from "vitest";
import {
  cpuPercentSinceLastOsSamples,
  cs2ProcessTrackingStatusKey,
  normalizeLogicalCpuCount,
  resolveCs2ProcessTrackingPollIntervals,
  withDerivedCpuPercent,
} from "../cs2ProcessTrackingPoll";

describe("resolveCs2ProcessTrackingPollIntervals", () => {
  it("defaults system metrics interval to process poll", () => {
    const r = resolveCs2ProcessTrackingPollIntervals({ processPollIntervalMs: 500 });
    expect(r.processPollMs).toBe(500);
    expect(r.systemMetricsMs).toBe(500);
  });

  it("clamps system metrics interval to at least process poll", () => {
    const r = resolveCs2ProcessTrackingPollIntervals({
      processPollIntervalMs: 500,
      systemMetricsIntervalMs: 200,
    });
    expect(r.systemMetricsMs).toBe(500);
  });
});

describe("cpuPercentSinceLastOsSamples", () => {
  it("returns percent from cumulative times and wall clock", () => {
    const pct = cpuPercentSinceLastOsSamples(
      { kernelTimeMs: 300, userTimeMs: 100 },
      { kernelTimeMs: 100, userTimeMs: 50 },
      1000,
      4
    );
    expect(pct).toBeDefined();
    expect(pct!).toBeGreaterThan(0);
  });
});

describe("withDerivedCpuPercent", () => {
  it("leaves sample unchanged without previous", () => {
    const s = withDerivedCpuPercent({ workingSetBytes: 1 }, undefined, undefined, 10, 4);
    expect(s).toEqual({ workingSetBytes: 1 });
  });
});

describe("cs2ProcessTrackingStatusKey", () => {
  it("serializes running and pid", () => {
    expect(cs2ProcessTrackingStatusKey(true, 42)).toBe("true:42");
    expect(cs2ProcessTrackingStatusKey(false, undefined)).toBe("false:");
  });
});

describe("normalizeLogicalCpuCount", () => {
  it("uses 1 when length is non-positive", () => {
    expect(normalizeLogicalCpuCount(0)).toBe(1);
    expect(normalizeLogicalCpuCount(-3)).toBe(1);
  });
});

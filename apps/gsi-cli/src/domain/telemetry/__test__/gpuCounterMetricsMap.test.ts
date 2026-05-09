import { describe, expect, it } from "vitest";
import {
  mapGpuCounterJsonToSample,
  parseGpuCounterJsonPayload,
} from "../gpuCounterMetricsMap";

describe("gpuCounterMetricsMap", () => {
  it("maps numeric fields", () => {
    const s = mapGpuCounterJsonToSample({
      dedicatedMemoryBytes: 1_048_576,
      sharedMemoryBytes: 512_000,
      gpuUtilizationPercent: 42.5,
    });
    expect(s).not.toBeNull();
    expect(s!.dedicatedMemoryBytes).toBe(1_048_576);
    expect(s!.sharedMemoryBytes).toBe(512_000);
    expect(s!.gpuUtilizationPercent).toBe(42.5);
  });

  it("returns null when no metrics present", () => {
    expect(mapGpuCounterJsonToSample({})).toBeNull();
    expect(parseGpuCounterJsonPayload("null")).toBeNull();
  });
});

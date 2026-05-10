import type { GpuProcessMetricsSample } from "./gpuProcessMetrics";

function readFiniteNumber(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim().length > 0) {
    const n = Number(value);
    if (Number.isFinite(n)) return n;
  }
  return undefined;
}

export function mapGpuCounterJsonToSample(raw: unknown): GpuProcessMetricsSample | null {
  if (raw === null || typeof raw !== "object") {
    return null;
  }
  const row = raw as Record<string, unknown>;
  const dedicated = readFiniteNumber(row.dedicatedMemoryBytes);
  const shared = readFiniteNumber(row.sharedMemoryBytes);
  const util = readFiniteNumber(row.gpuUtilizationPercent);

  if (dedicated === undefined && shared === undefined && util === undefined) {
    return null;
  }

  const sample: GpuProcessMetricsSample = {};
  if (dedicated !== undefined) sample.dedicatedMemoryBytes = Math.round(dedicated);
  if (shared !== undefined) sample.sharedMemoryBytes = Math.round(shared);
  if (util !== undefined) sample.gpuUtilizationPercent = util;
  return sample;
}

export function parseGpuCounterJsonPayload(text: string): unknown {
  const trimmed = text.trim();
  if (trimmed.length === 0 || trimmed === "null") return null;
  try {
    return JSON.parse(trimmed) as unknown;
  } catch {
    return null;
  }
}

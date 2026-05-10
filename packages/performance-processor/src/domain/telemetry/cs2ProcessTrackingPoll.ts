import {
  DEFAULT_CS2_PROCESS_TRACKING_INTERVAL_MS,
  DEFAULT_PRESENT_NOTIFY_INTERVAL_MS,
} from "./cs2ProcessTrackingConstants";
import type { OsProcessMetricsSample } from "./osProcessMetrics";

/** User-tunable poll / notify cadence for CS2 process tracking (pure config shape). */
export interface Cs2ProcessTrackingPollOptions {
  /**
   * How often the tracker wakes to check process visibility (running / pid) and run the poll loop.
   * Defaults to {@link DEFAULT_CS2_PROCESS_TRACKING_INTERVAL_MS}.
   */
  processPollIntervalMs?: number;
  /**
   * Minimum time between OS + GPU counter samples (ms). Can be **longer** than
   * {@link processPollIntervalMs} so FPS-style updates stay frequent while CPU/GPU
   * refresh stays cheaper. If omitted, defaults to `processPollIntervalMs`.
   */
  systemMetricsIntervalMs?: number;
  /**
   * Minimum time between listener callbacks triggered by present-chain frames.
   * Defaults to {@link DEFAULT_PRESENT_NOTIFY_INTERVAL_MS}.
   */
  presentNotifyIntervalMs?: number;
}

export function resolveCs2ProcessTrackingPollIntervals(
  options: Cs2ProcessTrackingPollOptions | undefined
): { processPollMs: number; systemMetricsMs: number; presentNotifyMs: number } {
  const processPollMs =
    options?.processPollIntervalMs ?? DEFAULT_CS2_PROCESS_TRACKING_INTERVAL_MS;
  const rawSystem = options?.systemMetricsIntervalMs ?? processPollMs;
  const systemMetricsMs = Math.max(rawSystem, processPollMs);
  const presentNotifyMs =
    options?.presentNotifyIntervalMs ?? DEFAULT_PRESENT_NOTIFY_INTERVAL_MS;
  return { processPollMs, systemMetricsMs, presentNotifyMs };
}

export function normalizeLogicalCpuCount(length: number): number {
  return length > 0 ? length : 1;
}

export function cs2ProcessTrackingStatusKey(running: boolean, pid: number | undefined): string {
  return `${running}:${pid ?? ""}`;
}

/**
 * Derives process CPU % from two cumulative kernel+user time samples and wall time between them.
 */
export function cpuPercentSinceLastOsSamples(
  current: OsProcessMetricsSample,
  previous: OsProcessMetricsSample,
  wallMs: number,
  logicalCpus: number
): number | undefined {
  const k = current.kernelTimeMs;
  const u = current.userTimeMs;
  const pk = previous.kernelTimeMs;
  const pu = previous.userTimeMs;
  if (k === undefined || u === undefined || pk === undefined || pu === undefined) {
    return undefined;
  }
  if (wallMs < 1) return undefined;
  const deltaCpuMs = k + u - pk - pu;
  if (deltaCpuMs < 0) return undefined;
  const n = Math.max(1, logicalCpus);
  return Math.min(100 * n, (100 * deltaCpuMs) / (wallMs * n));
}

/**
 * Attaches `cpuPercent` to `raw` when a previous raw sample and timestamp exist.
 */
export function withDerivedCpuPercent(
  raw: OsProcessMetricsSample,
  previousRaw: OsProcessMetricsSample | undefined,
  previousAtMs: number | undefined,
  nowMs: number,
  logicalCpus: number
): OsProcessMetricsSample {
  if (previousRaw === undefined || previousAtMs === undefined) {
    return raw;
  }
  const wall = nowMs - previousAtMs;
  const pct = cpuPercentSinceLastOsSamples(raw, previousRaw, wall, logicalCpus);
  return pct === undefined ? raw : { ...raw, cpuPercent: pct };
}

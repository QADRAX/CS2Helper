import type { GpuProcessMetricsSample } from "../../../../domain/telemetry/gpuProcessMetrics";

export type { GpuProcessMetricsSample };

/**
 * Read-only access to per-process GPU metrics on Windows (WDDM / PDH).
 */
export interface GpuProcessMetricsPort {
  /**
   * One snapshot for the given PID, or `null` if counters are missing or
   * unsupported on this machine.
   */
  sample: (pid: number) => Promise<GpuProcessMetricsSample | null>;
}

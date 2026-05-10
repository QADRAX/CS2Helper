import type { OsProcessMetricsSample } from "../../../domain/telemetry/osProcessMetrics";

export type { OsProcessMetricsSample };

/**
 * Read-only access to OS-level process metrics on Windows.
 */
export interface OsProcessMetricsPort {
  /** Returns one metrics snapshot for the given PID. */
  sample: (pid: number) => Promise<OsProcessMetricsSample>;
}

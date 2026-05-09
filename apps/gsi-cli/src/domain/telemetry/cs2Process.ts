import type { GpuProcessMetricsSample } from "./gpuProcessMetrics";
import type { OsProcessMetricsSample } from "./osProcessMetrics";
import type { PresentFrameSample } from "./presentChain";

/**
 * Status snapshot of the CS2 game process on the host machine.
 */
export interface Cs2ProcessStatus {
  running: boolean;
  pid?: number;
}

/**
 * Process visibility plus optional performance samples for `cs2.exe`.
 * `present` reflects PresentMon/ETW presentation-chain observation, not `net_graph`.
 */
export interface Cs2ProcessTrackingSnapshot extends Cs2ProcessStatus {
  /** Last OS/process metrics sample (e.g. CIM `Win32_Process`). */
  os?: OsProcessMetricsSample;
  /**
   * Per-process GPU counters when available; `null` means sampled but no data
   * (e.g. unsupported counters). Omitted when the process is not being tracked.
   */
  gpu?: GpuProcessMetricsSample | null;
  /** Latest present-chain sample while a PresentMon session is active. */
  present?: PresentFrameSample;
}

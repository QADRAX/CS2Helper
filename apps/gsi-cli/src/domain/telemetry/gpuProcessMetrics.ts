/**
 * Windows-only: GPU utilization and memory attributed to a process, typically via
 * WDDM performance counters (Windows 10+). Availability and counter shapes vary
 * by **Windows build and GPU driver**; adapters should return `null` when the
 * host cannot supply trustworthy data.
 *
 * **Note on DXGI:** Per-process GPU stats from *outside* the game are usually
 * obtained through **WDDM/PDH** (e.g. engine utilization, dedicated/shared memory
 * counters), not by creating a DXGI device in the CLI.
 */
export interface GpuProcessMetricsSample {
  /** Adapter LUID as string when the source exposes it. */
  adapterLuid?: string;
  /** Zero-based adapter index when LUID is unavailable. */
  adapterIndex?: number;
  /**
   * Utilization attributed to the process when counters allow (e.g. filtered
   * engine utilization); 0–100 when defined.
   */
  gpuUtilizationPercent?: number;
  /** Dedicated GPU memory for the process in bytes, when available. */
  dedicatedMemoryBytes?: number;
  /** Shared GPU memory for the process in bytes, when available. */
  sharedMemoryBytes?: number;
}

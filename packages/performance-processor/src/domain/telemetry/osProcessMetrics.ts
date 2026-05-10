/**
 * Windows-only: one snapshot of CPU, memory, and I/O counters for a process
 * identified by PID (e.g. `cs2.exe`). Implementations may use `GetProcessTimes`,
 * PDH (`typeperf`), WMI (`Win32_PerfRawData_PerfProc_Process`), or similar.
 *
 * **CPU percent:** A meaningful `% Processor Time` for the process requires **two
 * samples** and elapsed real time between them (same idea as differencing
 * `GetProcessTimes` or using a PDH interval). A single `sample()` returns
 * cumulative kernel/user time when available; callers compute percent in a use case.
 *
 * **I/O:** When fields are **cumulative** totals, derive bytes/sec (or ops/sec) by
 * subtracting two samples and dividing by the wall-clock interval. Adapters that
 * read PDH in “rate” form may populate complementary fields later without breaking
 * this contract.
 */
export interface OsProcessMetricsSample {
  /**
   * Cumulative kernel-mode time for the process, in milliseconds, if the
   * adapter exposes it (e.g. from `GetProcessTimes`).
   */
  kernelTimeMs?: number;
  /**
   * Cumulative user-mode time for the process, in milliseconds, if the adapter
   * exposes it.
   */
  userTimeMs?: number;
  /**
   * When the adapter already integrates over an interval (e.g. PDH), it may set
   * this directly; otherwise omit and use two cumulative samples.
   */
  cpuPercent?: number;
  /** Working set size in bytes (`GetProcessMemoryInfo` / equivalent). */
  workingSetBytes?: number;
  /** Private commit in bytes (private bytes). */
  privateBytes?: number;
  /** Cumulative I/O read bytes (or adapter-defined semantics). */
  ioReadBytes?: number;
  /** Cumulative I/O write bytes. */
  ioWriteBytes?: number;
  /** Cumulative other I/O bytes when available. */
  ioOtherBytes?: number;
}

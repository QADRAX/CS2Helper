/**
 * Status snapshot of the Steam client process on the host machine.
 */
export interface SteamProcessStatus {
  running: boolean;
  pid?: number;
}

/**
 * Application-layer abstraction for querying the Steam client process state.
 * Implementations decide how to inspect the OS (e.g. `tasklist` on Windows).
 *
 * Intentionally read-only: launching/stopping Steam is out of scope for this
 * port. Pair it with `SteamInstallLocatorPort` when callers also need to know
 * whether Steam is installed.
 */
export interface SteamProcessPort {
  /** Whether the steam.exe process is currently running. */
  isRunning: () => Promise<boolean>;

  /** Returns process status with extra metadata (pid). */
  getStatus: () => Promise<SteamProcessStatus>;
}

/**
 * Status snapshot of the CS2 game process on the host machine.
 */
export interface Cs2ProcessStatus {
  running: boolean;
  pid?: number;
}

/**
 * Application-layer abstraction for querying the CS2 process state.
 * Implementations decide how to inspect the OS (e.g. `tasklist` on Windows).
 *
 * Intentionally read-only: starting/stopping the game is the responsibility
 * of `Cs2LauncherPort`.
 */
export interface Cs2ProcessPort {
  /** Whether the cs2.exe process is currently running. */
  isRunning: () => Promise<boolean>;

  /** Returns process status with extra metadata (pid). */
  getStatus: () => Promise<Cs2ProcessStatus>;
}

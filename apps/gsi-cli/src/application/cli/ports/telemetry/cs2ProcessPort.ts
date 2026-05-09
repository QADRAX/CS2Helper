import type { Cs2ProcessStatus } from "../../../../domain/telemetry/cs2Process";

export type { Cs2ProcessStatus } from "../../../../domain/telemetry/cs2Process";

/**
 * Application port: observe whether `cs2.exe` is running and resolve its PID.
 * Starting/stopping the game is out of scope (see `Cs2LauncherPort`).
 */
export interface Cs2ProcessPort {
  /** Whether the cs2.exe process is currently running. */
  isRunning: () => Promise<boolean>;

  /** Returns process status with extra metadata (pid). */
  getStatus: () => Promise<Cs2ProcessStatus>;
}

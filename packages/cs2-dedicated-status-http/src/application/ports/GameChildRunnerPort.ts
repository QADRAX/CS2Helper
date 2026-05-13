/**
 * Spawns the game child (dedicated binary script). Exit while not in “update stop”
 * is surfaced via onUnexpectedExit (orchestrator may exit the process).
 */
export interface GameChildRunnerPort {
  spawn(
    scriptPath: string,
    onUnexpectedExit: (code: number | null, signal: NodeJS.Signals | null) => void
  ): Promise<void>;

  isAlive(): boolean;
  getPid(): number | null;

  /** SIGTERM then optional SIGKILL after delay, like stopChildForUpdate. */
  stopForUpdate(killAfterMs: number): Promise<void>;

  /** Best-effort SIGTERM when the status server process shuts down (SIGTERM/SIGINT). */
  signalShutdownKill(): void;
}

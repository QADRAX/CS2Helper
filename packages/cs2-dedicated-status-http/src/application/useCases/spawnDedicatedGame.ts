import type { AsyncUseCase } from "@cs2helper/shared";
import type { ChildExitLogPort } from "../ports/ChildExitLogPort";
import type { DedicatedStatusStatePort } from "../ports/DedicatedStatusStatePort";
import type { GameChildRunnerPort } from "../ports/GameChildRunnerPort";
import type { ProcessLifecyclePort } from "../ports/ProcessLifecyclePort";

/**
 * Spawns the dedicated child script; unexpected exit updates phase and exits the process.
 *
 * Ports tuple order: `[game, state, lifecycle, log]`.
 */
export const spawnDedicatedGame: AsyncUseCase<
  [GameChildRunnerPort, DedicatedStatusStatePort, ProcessLifecyclePort, ChildExitLogPort],
  [childScript: string],
  void
> = async ([game, state, lifecycle, log], childScript) => {
  await game.spawn(childScript, (code, signal) => {
    state.setPhase("stopped");
    log.logDedicatedExited(code, signal);
    lifecycle.exitProcess(code ?? 1);
  });
};

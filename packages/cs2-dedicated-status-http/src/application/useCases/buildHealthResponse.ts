import type { UseCase } from "@cs2helper/shared";
import { snapshotSteamProgress } from "../../domain/steamProgress";
import type { DedicatedStatusStatePort } from "../ports/DedicatedStatusStatePort";
import type { GameChildRunnerPort } from "../ports/GameChildRunnerPort";

/**
 * GET /health JSON body.
 *
 * Ports tuple order: `[state, game]`.
 */
export const buildHealthResponse: UseCase<
  [DedicatedStatusStatePort, GameChildRunnerPort],
  [],
  Record<string, unknown>
> = ([state, game]) => {
  const s = state.snapshot();
  return {
    ok: true,
    phase: s.phase,
    updating: s.phase === "updating",
    operationInProgress: s.opsLocked,
    childPid: game.getPid(),
    processUp: game.isAlive(),
    updateProgress: snapshotSteamProgress(s.updateProgress),
  };
};

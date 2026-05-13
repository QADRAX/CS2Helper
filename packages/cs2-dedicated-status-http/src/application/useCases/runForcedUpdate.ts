import type { AsyncUseCase } from "@cs2helper/shared";
import type { ForcedUpdateInput } from "../../domain/forcedUpdateInput";
import type { BashScriptRunnerPort } from "../ports/BashScriptRunnerPort";
import type { ChildExitLogPort } from "../ports/ChildExitLogPort";
import type { DedicatedStatusStatePort } from "../ports/DedicatedStatusStatePort";
import type { GameChildRunnerPort } from "../ports/GameChildRunnerPort";
import type { InstallRunnerPort } from "../ports/InstallRunnerPort";
import type { ProcessLifecyclePort } from "../ports/ProcessLifecyclePort";
import { runBashScript } from "./runBashScript";
import { runSteamInstallWithProgress } from "./runSteamInstallWithProgress";
import { spawnDedicatedGame } from "./spawnDedicatedGame";

/**
 * Stops the game for update, reinstalls, rewrites launch script, respawns.
 *
 * Ports tuple order: `[install, bash, game, state, lifecycle, log]`.
 */
export const runForcedUpdate: AsyncUseCase<
  [
    InstallRunnerPort,
    BashScriptRunnerPort,
    GameChildRunnerPort,
    DedicatedStatusStatePort,
    ProcessLifecyclePort,
    ChildExitLogPort,
  ],
  [input: ForcedUpdateInput],
  void
> = async ([install, bash, game, state, lifecycle, log], input) => {
  const { installScript, writeScript, childScript, onFirstDownloadPercentLog } = input;
  state.setLastUpdateError(null);
  state.setPhase("updating");
  await game.stopForUpdate(45_000);
  await runSteamInstallWithProgress([install, state], {
    installScript,
    onFirstDownloadPercentLog,
  });
  state.setUpdateProgress(null);
  state.setPhase("starting");
  await runBashScript([bash], writeScript);
  await spawnDedicatedGame([game, state, lifecycle, log], childScript);
  state.setPhase("running");
};

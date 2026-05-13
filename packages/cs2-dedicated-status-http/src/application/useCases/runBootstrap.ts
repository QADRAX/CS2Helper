import type { AsyncUseCase } from "@cs2helper/shared";
import type { DedicatedStatusPaths } from "../../domain/dedicatedStatusPaths";
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
 * Initial install + write launch script + spawn game.
 *
 * Ports tuple order: `[install, bash, game, state, lifecycle, log]`.
 */
export const runBootstrap: AsyncUseCase<
  [
    InstallRunnerPort,
    BashScriptRunnerPort,
    GameChildRunnerPort,
    DedicatedStatusStatePort,
    ProcessLifecyclePort,
    ChildExitLogPort,
  ],
  [paths: DedicatedStatusPaths],
  void
> = async ([install, bash, game, state, lifecycle, log], paths) => {
  state.setLastUpdateError(null);
  state.setPhase("updating");
  await runSteamInstallWithProgress([install, state], { installScript: paths.installScript });
  state.setUpdateProgress(null);
  state.setPhase("starting");
  await runBashScript([bash], paths.writeScript);
  await spawnDedicatedGame([game, state, lifecycle, log], paths.childScript);
  state.setPhase("running");
};

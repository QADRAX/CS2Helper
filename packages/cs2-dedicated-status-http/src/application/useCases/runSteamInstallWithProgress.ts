import type { AsyncUseCase } from "@cs2helper/shared";
import {
  mergeSteamProgress,
  parseSteamcmdLine,
} from "../../domain/steamProgress";
import type { DedicatedStatusStatePort } from "../ports/DedicatedStatusStatePort";
import type { InstallRunnerPort } from "../ports/InstallRunnerPort";

/**
 * Runs steamcmd install script and updates {@link DedicatedStatusStatePort} progress from stdout/stderr.
 *
 * Ports tuple order: `[install, state]`.
 */
export const runSteamInstallWithProgress: AsyncUseCase<
  [InstallRunnerPort, DedicatedStatusStatePort],
  [installScript: string],
  void
> = async ([install, state], installScript) => {
  state.setUpdateProgress({
    percent: 0,
    stage: "starting_steamcmd",
    updatedAt: Date.now(),
  });

  let buf = "";

  const consumeChunk = (chunk: Buffer): void => {
    buf += chunk.toString("utf8");
    let nl: number;
    while ((nl = buf.indexOf("\n")) >= 0) {
      const line = buf.slice(0, nl);
      buf = buf.slice(nl + 1);
      const parsed = parseSteamcmdLine(line);
      if (parsed) {
        const prev = state.snapshot().updateProgress;
        state.setUpdateProgress(mergeSteamProgress(prev, parsed));
      }
    }
  };

  try {
    await install.run(installScript, consumeChunk);

    if (buf.length > 0) {
      const parsed = parseSteamcmdLine(buf);
      if (parsed) {
        const prev = state.snapshot().updateProgress;
        state.setUpdateProgress(mergeSteamProgress(prev, parsed));
      }
    }

    const cur = state.snapshot().updateProgress;
    state.setUpdateProgress(
      mergeSteamProgress(cur, {
        percent: cur?.percent != null ? Math.min(100, cur.percent) : 100,
        stage: "steamcmd_finished",
        lastLine: undefined,
      })
    );
  } catch (e) {
    state.setUpdateProgress(null);
    throw e;
  }
};

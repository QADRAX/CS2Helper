import type { AsyncUseCase } from "@cs2helper/shared";
import type { RunSteamInstallInput } from "../../domain/steamInstallHooks";
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
  [input: RunSteamInstallInput],
  void
> = async ([install, state], input) => {
  const { installScript, onFirstDownloadPercentLog } = input;
  let firstPercentNotified = false;

  const maybeNotifyFirstPercent = (parsed: ReturnType<typeof parseSteamcmdLine>): void => {
    if (
      firstPercentNotified ||
      !onFirstDownloadPercentLog ||
      !parsed ||
      parsed.percent == null
    ) {
      return;
    }
    firstPercentNotified = true;
    try {
      onFirstDownloadPercentLog();
    } catch {
      /* HTTP / caller must not break steamcmd */
    }
  };

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
        maybeNotifyFirstPercent(parsed);
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
        maybeNotifyFirstPercent(parsed);
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

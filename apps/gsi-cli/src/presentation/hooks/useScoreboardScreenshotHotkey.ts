import { useEffect, useRef } from "react";
import { useStore } from "react-redux";
import type { CliApp } from "../../application/CliApp";
import { DEFAULT_SCOREBOARD_HOTKEY_VK } from "../../domain/cli/config";
import { GsiCliMatchSignalAdapter } from "../../infrastructure/adapters/GsiCliMatchSignalAdapter";
import {
  ClockNowMsAdapter,
  FsScoreboardSnapshotSinkAdapter,
  getScoreboardSnapshotsDir,
  ScoreboardScreenshotService,
  WindowsCs2ForegroundAdapter,
  WindowsCs2WindowCaptureAdapter,
} from "@cs2helper/cs2-scoreboard-screenshot";
import { enqueueNotification, selectCliConfig, selectUiStatus } from "../store";
import type { RootState } from "../store/rootState";
import { msgKeys } from "../i18n/msgKeys";
import { translate } from "../i18n/translate";
import { useAppDispatch, useAppSelector } from "./redux";

function notificationKindForOutcome(
  outcome: "captured" | "skipped" | "capture_failed"
): "success" | "info" | "warning" | "error" {
  if (outcome === "captured") return "success";
  if (outcome === "capture_failed") return "error";
  return "warning";
}

/**
 * When the gateway is listening on Windows and scoreboard snapshots are enabled in config,
 * registers the auxiliary global hotkey and saves PNGs under the gsi-cli app-data folder.
 */
export function useScoreboardScreenshotHotkey(cliApp: CliApp): void {
  const dispatch = useAppDispatch();
  const store = useStore<RootState>();
  const uiStatus = useAppSelector(selectUiStatus);
  const config = useAppSelector(selectCliConfig);

  const serviceRef = useRef<ScoreboardScreenshotService | null>(null);

  useEffect(() => {
    const teardown = async () => {
      if (serviceRef.current) {
        await serviceRef.current.stop().catch(() => undefined);
        serviceRef.current = null;
      }
    };

    if (process.platform !== "win32") {
      void teardown();
      return () => {
        void teardown();
      };
    }

    if (uiStatus !== "LISTENING" || !config.scoreboardSnapshotEnabled) {
      void teardown();
      return () => {
        void teardown();
      };
    }

    const matchSignal = new GsiCliMatchSignalAdapter(cliApp);
    const foreground = new WindowsCs2ForegroundAdapter();
    const capture = new WindowsCs2WindowCaptureAdapter();
    const sink = new FsScoreboardSnapshotSinkAdapter(getScoreboardSnapshotsDir("gsi-cli"));
    const clock = new ClockNowMsAdapter();

    const svc = new ScoreboardScreenshotService({
      policy: {
        matchPhaseGate: config.scoreboardRequireLivePhase ? "requireLivePhase" : "currentMatchOnly",
      },
      ports: [matchSignal, foreground, capture, sink, clock],
      triggerVirtualKey: config.scoreboardHotkeyVirtualKey ?? DEFAULT_SCOREBOARD_HOTKEY_VK,
      onHotkeyResult: (result) => {
        const locale = store.getState().i18n.locale;
        if (result.outcome === "captured") {
          dispatch(
            enqueueNotification({
              message: translate(locale, msgKeys.cli.scoreboard.captured, { path: result.absolutePath }),
              kind: notificationKindForOutcome("captured"),
            })
          );
          return;
        }
        if (result.outcome === "capture_failed") {
          dispatch(
            enqueueNotification({
              message: translate(locale, msgKeys.cli.scoreboard.failed, { detail: result.error }),
              kind: notificationKindForOutcome("capture_failed"),
            })
          );
          return;
        }
        const key =
          result.reason === "cs2_not_foreground"
            ? msgKeys.cli.scoreboard.skippedNotForeground
            : result.reason === "map_phase_not_live"
              ? msgKeys.cli.scoreboard.skippedNotLive
              : msgKeys.cli.scoreboard.skippedNoMatch;
        dispatch(
          enqueueNotification({
            message: translate(locale, key),
            kind: notificationKindForOutcome("skipped"),
          })
        );
      },
    });

    serviceRef.current = svc;
    void svc.start().catch(() => {
      dispatch(
        enqueueNotification({
          message: translate(store.getState().i18n.locale, msgKeys.cli.scoreboard.failed, {
            detail: "register_hotkey_failed",
          }),
          kind: "error",
        })
      );
    });

    return () => {
      void teardown();
    };
  }, [
    cliApp,
    config.scoreboardHotkeyVirtualKey,
    config.scoreboardRequireLivePhase,
    config.scoreboardSnapshotEnabled,
    dispatch,
    store,
    uiStatus,
  ]);
}

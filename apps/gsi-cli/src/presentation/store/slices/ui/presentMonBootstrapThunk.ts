import { createAsyncThunk } from "@reduxjs/toolkit";
import type { PresentMonBootstrapProgressEvent } from "@cs2helper/performance-processor";
import { msgKeys, type MessageKey } from "../../../i18n/msgKeys";
import { translate } from "../../../i18n/translate";
import { enqueueNotification } from "../notifications";
import type { UiAsyncThunkConfig } from "../../uiAsyncThunkConfig";
import { presentMonBootstrapStep } from "./uiSlice";

function progressEventToStepKey(event: PresentMonBootstrapProgressEvent): MessageKey | undefined {
  switch (event.kind) {
    case "started":
      return msgKeys.cli.presentMon.loader.started;
    case "checking_release":
      return msgKeys.cli.presentMon.loader.checkingRelease;
    case "downloading":
      return msgKeys.cli.presentMon.loader.downloading;
    case "verifying_binary":
      return msgKeys.cli.presentMon.loader.verifying;
    case "using_local_binary":
      return msgKeys.cli.presentMon.loader.usingLocal;
    case "skipped_non_windows":
      return msgKeys.cli.presentMon.loader.skippedOs;
    case "skipped_env_override":
      return msgKeys.cli.presentMon.loader.skippedEnv;
    default:
      return undefined;
  }
}

/**
 * Runs once at UI startup: managed PresentMon install/update with progress for the initial loader.
 * Failures are non-fatal (notification only); FPS telemetry may still fail later with {@link Cs2ProcessTrackingSnapshot.presentChainError}.
 */
export const bootstrapPresentMonAtStartup = createAsyncThunk<void, void, UiAsyncThunkConfig>(
  "ui/bootstrapPresentMonAtStartup",
  async (_, { dispatch, extra, getState }) => {
    dispatch(
      presentMonBootstrapStep({
        blocking: true,
        stepKey: msgKeys.cli.presentMon.loader.started,
      })
    );
    try {
      await extra.cliApp.ensurePresentMonBootstrap({
        forceRemoteCheck: true,
        onProgress: (ev) => {
          const stepKey = progressEventToStepKey(ev);
          dispatch(
            presentMonBootstrapStep({
              blocking: true,
              stepKey,
            })
          );
        },
      });
    } catch (err) {
      const detail = err instanceof Error ? err.message : String(err);
      const locale = getState().i18n.locale;
      dispatch(
        enqueueNotification({
          message: `${translate(locale, msgKeys.cli.presentMon.notification.bootstrapFailed, {})}: ${detail}`,
          kind: "warning",
          durationMs: 12_000,
        })
      );
    } finally {
      dispatch(presentMonBootstrapStep({ blocking: false, stepKey: undefined }));
    }
  }
);

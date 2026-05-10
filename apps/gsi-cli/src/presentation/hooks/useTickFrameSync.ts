import type { TickFrame } from "@cs2helper/cs2-client-listener";
import type { Cs2ProcessTrackingSnapshot } from "@cs2helper/performance-processor";
import { useEffect } from "react";
import type { CliApp } from "../../application/CliApp";
import { clientListenerTickFrameUpdated, cs2TrackingUpdated, selectUiStatus } from "../store";
import { useAppDispatch, useAppSelector } from "./redux";

function trackingFromTickFrame(frame: TickFrame): Cs2ProcessTrackingSnapshot | null {
  const p = frame.sources["performance"];
  if (p === null || typeof p !== "object") {
    return null;
  }
  if ("error" in p) {
    return null;
  }
  const snap = p as Cs2ProcessTrackingSnapshot;
  return typeof snap.running === "boolean" ? snap : null;
}

/** Mirrors CS2 client listener ticks into Redux while status is LISTENING. */
export function useTickFrameSync(cliApp: CliApp): void {
  const dispatch = useAppDispatch();
  const status = useAppSelector(selectUiStatus);

  useEffect(() => {
    if (status !== "LISTENING") {
      dispatch(clientListenerTickFrameUpdated(null));
      return;
    }

    const unsubscribe = cliApp.subscribeTickFrames((frame) => {
      dispatch(clientListenerTickFrameUpdated(frame));
      const tracking = trackingFromTickFrame(frame);
      if (tracking) {
        dispatch(cs2TrackingUpdated(tracking));
      }
    });

    return unsubscribe;
  }, [cliApp, dispatch, status]);
}

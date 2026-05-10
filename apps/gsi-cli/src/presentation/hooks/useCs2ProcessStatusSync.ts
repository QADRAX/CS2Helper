import { useEffect } from "react";
import type { CliApp } from "../../application/CliApp";
import { cs2ProcessProbeUpdated, selectUiStatus } from "../store";
import { useAppDispatch, useAppSelector } from "./redux";

/**
 * Polls CS2 process presence via the client listener (tasklist) while the gateway is listening
 * and mirrors it into Redux. UI running/pid selectors read this slice, not stale GSI/tick hints.
 */
export function useCs2ProcessStatusSync(cliApp: CliApp): void {
  const dispatch = useAppDispatch();
  const status = useAppSelector(selectUiStatus);

  useEffect(() => {
    if (status !== "LISTENING") {
      return;
    }
    const unsubscribe = cliApp.subscribeCs2ProcessStatus((s) => {
      dispatch(cs2ProcessProbeUpdated(s));
    });
    return unsubscribe;
  }, [cliApp, dispatch, status]);
}

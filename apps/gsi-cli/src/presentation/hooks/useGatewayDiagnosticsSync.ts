import { useEffect } from "react";
import type { CliApp } from "../../application/CliApp";
import { gatewayDiagnosticsUpdated, selectUiStatus } from "../store";
import { useAppDispatch, useAppSelector } from "./redux";

export function useGatewayDiagnosticsSync(cliApp: CliApp): void {
  const dispatch = useAppDispatch();
  const status = useAppSelector(selectUiStatus);

  useEffect(() => {
    if (status !== "LISTENING") {
      dispatch(gatewayDiagnosticsUpdated({ receivedRequests: 0, rejectedRequests: 0 }));
      return;
    }

    // One-shot before the first tick; afterwards `useTickFrameSync` keeps counters aligned with each frame.
    dispatch(gatewayDiagnosticsUpdated(cliApp.getGatewayDiagnostics()));
    return undefined;
  }, [cliApp, dispatch, status]);
}

import { useEffect } from "react";
import type { CliApp } from "../../infrastructure/cli/CliAppService";
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

    dispatch(gatewayDiagnosticsUpdated(cliApp.getGatewayDiagnostics()));
    const interval = setInterval(() => {
      dispatch(gatewayDiagnosticsUpdated(cliApp.getGatewayDiagnostics()));
    }, 400);

    return () => clearInterval(interval);
  }, [cliApp, dispatch, status]);
}

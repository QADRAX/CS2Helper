import { useEffect } from "react";
import type { CliApp } from "../../infrastructure/cli/CliAppService";
import { gsiStateUpdated, selectUiStatus } from "../store";
import { useAppDispatch, useAppSelector } from "./redux";

/** Mirrors gateway processor state into Redux while status is LISTENING. */
export function useGatewayStateSync(cliApp: CliApp): void {
  const dispatch = useAppDispatch();
  const status = useAppSelector(selectUiStatus);

  useEffect(() => {
    if (status !== "LISTENING") {
      dispatch(gsiStateUpdated(null));
      return;
    }

    dispatch(gsiStateUpdated(cliApp.getGatewayState()));

    const unsubscribe = cliApp.subscribeGatewayState((next) => {
      dispatch(gsiStateUpdated(next));
    });

    return unsubscribe;
  }, [cliApp, dispatch, status]);
}

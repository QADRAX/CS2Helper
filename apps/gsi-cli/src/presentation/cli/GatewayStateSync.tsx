import React, { useEffect } from "react";
import type { CliApp } from "../../infrastructure/cli/CliAppService";
import { useAppDispatch, useAppSelector } from "../hooks/redux";
import { gsiStateUpdated, selectUiStatus } from "../store";

/**
 * Bridges gateway processor state into Redux whenever the CLI is listening.
 */
export function GatewayStateSync({ cliApp }: { cliApp: CliApp }) {
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

  return null;
}

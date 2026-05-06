import React, { useEffect } from "react";
import type { CliApp } from "../../infrastructure/cli/CliAppService";
import { gsiStateUpdated } from "../store/cliSlice";
import { useAppDispatch, useAppSelector } from "../store/hooks";

/**
 * Bridges gateway processor state into Redux whenever the CLI is listening.
 */
export function GatewayStateSync({ cliApp }: { cliApp: CliApp }) {
  const dispatch = useAppDispatch();
  const status = useAppSelector((s) => s.cli.status);

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

import React, { useEffect, useMemo } from "react";
import { Provider } from "react-redux";
import type { CliApp } from "../../infrastructure/cli/CliAppService";
import { createAppStore } from "../store/appStore";
import { loadConfig } from "../store/cliSlice";
import { useAppDispatch } from "../store/hooks";
import { App } from "./App";
import { GatewayStateSync } from "./GatewayStateSync";

function ConfigBootstrap() {
  const dispatch = useAppDispatch();
  useEffect(() => {
    void dispatch(loadConfig());
  }, [dispatch]);
  return null;
}

export interface RootAppProps {
  cliApp: CliApp;
}

/**
 * Redux Provider + one-time config load + GSI subscription wiring.
 * `CliApp` stays outside the store; thunks receive it via `extraArgument`.
 */
export function RootApp({ cliApp }: RootAppProps) {
  const store = useMemo(() => createAppStore(cliApp), [cliApp]);

  return (
    <Provider store={store}>
      <ConfigBootstrap />
      <GatewayStateSync cliApp={cliApp} />
      <App />
    </Provider>
  );
}

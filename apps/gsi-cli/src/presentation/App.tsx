import { useMemo } from "react";
import { Provider } from "react-redux";
import type { CliApp } from "../infrastructure/cli/CliAppService";
import { CliShell } from "./components/organisms/CliShell";
import { useConfigBootstrap } from "./hooks/useConfigBootstrap";
import { useGatewayStateSync } from "./hooks/useGatewayStateSync";
import { useSystemStatusSync } from "./hooks/useSystemStatusSync";
import { createAppStore } from "./store";

export interface AppProps {
  cliApp: CliApp;
}

function AppEffects({ cliApp }: { cliApp: CliApp }) {
  useConfigBootstrap();
  useGatewayStateSync(cliApp);
  useSystemStatusSync(cliApp);
  return null;
}

/**
 * Root presentation entry: Redux store, side-effect wiring, and shell layout.
 */
export function App({ cliApp }: AppProps) {
  const store = useMemo(() => createAppStore(cliApp), [cliApp]);

  return (
    <Provider store={store}>
      <AppEffects cliApp={cliApp} />
      <CliShell />
    </Provider>
  );
}

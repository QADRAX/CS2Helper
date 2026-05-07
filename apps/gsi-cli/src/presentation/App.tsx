import { useMemo } from "react";
import { Provider } from "react-redux";
import type { CliApp } from "../infrastructure/cli/CliAppService";
import { InteractiveCli } from "./components/organisms/InteractiveCli";
import { useConfigBootstrap } from "./hooks/useConfigBootstrap";
import { useGatewayDiagnosticsSync } from "./hooks/useGatewayDiagnosticsSync";
import { useGatewayStateSync } from "./hooks/useGatewayStateSync";
import { useSystemStatusSync } from "./hooks/useSystemStatusSync";
import { createAppStore } from "./store";

export interface AppProps {
  cliApp: CliApp;
}

/** Redux bootstrap and sync hooks; must render under Provider (uses store context). */
function RootReduxEffects({ cliApp }: { cliApp: CliApp }) {
  useConfigBootstrap();
  useGatewayStateSync(cliApp);
  useGatewayDiagnosticsSync(cliApp);
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
      <RootReduxEffects cliApp={cliApp} />
      <InteractiveCli />
    </Provider>
  );
}

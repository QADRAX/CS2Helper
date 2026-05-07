import { useMemo } from "react";
import { Provider } from "react-redux";
import type { CliApp } from "../infrastructure/cli/CliAppService";
import { createAppStore } from "./store";
import { AppEffects } from "./components/organisms/AppEffects";
import { CliShell } from "./components/organisms/CliShell";

export interface AppProps {
  cliApp: CliApp;
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

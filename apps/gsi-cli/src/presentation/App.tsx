import { useMemo } from "react";
import { Provider } from "react-redux";
import type { CliApp } from "../application/CliApp";
import { AppShell } from "./components/organisms/AppShell";
import { useConfigBootstrap } from "./hooks/useConfigBootstrap";
import { usePresentMonBootstrap } from "./hooks/usePresentMonBootstrap";
import { useGatewayDiagnosticsSync } from "./hooks/useGatewayDiagnosticsSync";
import { useCs2ProcessStatusSync } from "./hooks/useCs2ProcessStatusSync";
import { useScoreboardScreenshotHotkey } from "./hooks/useScoreboardScreenshotHotkey";
import { useTickFrameSync } from "./hooks/useTickFrameSync";
import { useSteamWebApiBootstrap } from "./hooks/useSteamWebApiBootstrap";
import { useSystemStatusSync } from "./hooks/useSystemStatusSync";
import { createAppStore } from "./store";

export interface AppProps {
  cliApp: CliApp;
}

/** Redux bootstrap and sync hooks; must render under Provider (uses store context). */
function RootReduxEffects({ cliApp }: { cliApp: CliApp }) {
  useConfigBootstrap();
  usePresentMonBootstrap();
  useSteamWebApiBootstrap();
  useTickFrameSync(cliApp);
  useCs2ProcessStatusSync(cliApp);
  useGatewayDiagnosticsSync(cliApp);
  useSystemStatusSync(cliApp);
  useScoreboardScreenshotHotkey(cliApp);
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
      <AppShell />
    </Provider>
  );
}

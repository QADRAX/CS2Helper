import type { CliApp } from "../../../infrastructure/cli/CliAppService";
import { useConfigBootstrap } from "../../hooks/useConfigBootstrap";
import { useGatewayDiagnosticsSync } from "../../hooks/useGatewayDiagnosticsSync";
import { useGatewayStateSync } from "../../hooks/useGatewayStateSync";
import { useSystemStatusSync } from "../../hooks/useSystemStatusSync";

interface AppEffectsProps {
  cliApp: CliApp;
}

export function AppEffects({ cliApp }: AppEffectsProps) {
  useConfigBootstrap();
  useGatewayStateSync(cliApp);
  useGatewayDiagnosticsSync(cliApp);
  useSystemStatusSync(cliApp);
  return null;
}

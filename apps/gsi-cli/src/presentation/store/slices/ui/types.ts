import type { GsiProcessorState } from "@cs2helper/gsi-processor";
import type { Cs2ProcessStatus } from "../../../../application/cli/ports/Cs2ProcessPort";
import type { GatewayDiagnostics } from "../../../../application/cli/ports/GatewayPort";
import type { SteamStatus } from "../../../../application/cli/useCases/getSteamStatus";
import type { CliStatus } from "../../../../domain/cli";
import type { CliConfig } from "../../../../domain/cli/config";

export interface UiState {
  status: CliStatus;
  errorMessage?: string;
  gatewayWarning?: string;
  gsiState: Readonly<GsiProcessorState> | null;
  gatewayDiagnostics: GatewayDiagnostics;
  port?: number;
  recordingPath?: string;
  config: CliConfig;
  cs2Status: Cs2ProcessStatus;
  steamStatus: SteamStatus;
}

const cs2StatusInitial: Cs2ProcessStatus = { running: false };
const steamStatusInitial: SteamStatus = {
  installed: false,
  running: false,
  location: null,
};

export const uiInitialState: UiState = {
  status: "IDLE",
  gsiState: null,
  gatewayDiagnostics: { receivedRequests: 0, rejectedRequests: 0 },
  config: {},
  cs2Status: cs2StatusInitial,
  steamStatus: steamStatusInitial,
};

import type { GsiProcessorState } from "@cs2helper/gsi-processor";
import type { Cs2ProcessTrackingSnapshot } from "../../../../domain/telemetry/cs2Process";
import type { GatewayDiagnostics } from "../../../../application/cli/ports/GatewayPort";
import type { SteamStatus } from "../../../../application/cli/useCases/getSteamStatus";
import type { CliStatus } from "../../../../domain/cli";
import type { CliConfig } from "../../../../domain/cli/config";
import { msgKeys } from "../../../i18n/msgKeys";

export type UiErrorMessageKey =
  | typeof msgKeys.cli.error.gatewayStart
  | typeof msgKeys.cli.error.configSave
  | typeof msgKeys.cli.error.launchCs2
  | typeof msgKeys.cli.error.openDataFolder
  | typeof msgKeys.cli.error.recording;

export interface UiErrorDescriptor {
  key: UiErrorMessageKey;
  detail?: string;
}

/** Probe de Steam Web API por variable `CS2HELPER_STEAM_WEB_API_KEY`. */
export type SteamWebApiUiSlice =
  | { enabled: false }
  | { enabled: true; probe: "checking" | "ok" | "fail"; detail?: string };

export const steamWebApiUiInitial: SteamWebApiUiSlice = { enabled: false };

export interface UiState {
  status: CliStatus;
  error?: UiErrorDescriptor;
  gatewayWarning?: string;
  gsiState: Readonly<GsiProcessorState> | null;
  gatewayDiagnostics: GatewayDiagnostics;
  port?: number;
  recordingPath?: string;
  config: CliConfig;
  cs2Tracking: Cs2ProcessTrackingSnapshot;
  steamStatus: SteamStatus;
  steamWebApi: SteamWebApiUiSlice;
}

const cs2TrackingInitial: Cs2ProcessTrackingSnapshot = { running: false };
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
  cs2Tracking: cs2TrackingInitial,
  steamStatus: steamStatusInitial,
  steamWebApi: steamWebApiUiInitial,
};

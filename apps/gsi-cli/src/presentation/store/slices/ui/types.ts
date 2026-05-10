import type { Cs2ProcessTrackingSnapshot } from "@cs2helper/performance-processor";
import type { TickFrame } from "@cs2helper/cs2-client-listener";
import type { GatewayDiagnostics } from "../../../../application/ports/GatewayPort";
import type { SteamStatus } from "../../../../application/useCases/getSteamStatus";
import type { CliStatus } from "../../../../domain/cli";
import type { CliConfig } from "../../../../domain/cli/config";
import { msgKeys, type MessageKey } from "../../../i18n/msgKeys";

export interface PresentMonBootstrapUiState {
  blocking: boolean;
  stepKey?: MessageKey;
}

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
  lastClientTickFrame: TickFrame | null;
  gatewayDiagnostics: GatewayDiagnostics;
  port?: number;
  recordingPath?: string;
  config: CliConfig;
  cs2Tracking: Cs2ProcessTrackingSnapshot;
  steamStatus: SteamStatus;
  steamWebApi: SteamWebApiUiSlice;
  presentMonBootstrap: PresentMonBootstrapUiState;
}

const cs2TrackingInitial: Cs2ProcessTrackingSnapshot = { running: false };
const steamStatusInitial: SteamStatus = {
  installed: false,
  running: false,
  location: null,
};

export const uiInitialState: UiState = {
  status: "IDLE",
  lastClientTickFrame: null,
  gatewayDiagnostics: { receivedRequests: 0, rejectedRequests: 0 },
  config: {},
  cs2Tracking: cs2TrackingInitial,
  steamStatus: steamStatusInitial,
  steamWebApi: steamWebApiUiInitial,
  presentMonBootstrap: { blocking: true, stepKey: msgKeys.cli.presentMon.loader.started },
};

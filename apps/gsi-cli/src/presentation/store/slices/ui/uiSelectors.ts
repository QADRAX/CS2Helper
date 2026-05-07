import type { GsiProcessorState } from "@cs2helper/gsi-processor";
import type { Cs2ProcessStatus } from "../../../../application/cli/ports/Cs2ProcessPort";
import type { SteamStatus } from "../../../../application/cli/useCases/getSteamStatus";
import type { CliConfig } from "../../../../domain/cli/config";
import type { CliStatus } from "../../../../domain/cli";
import type { GatewayDiagnostics } from "../../../../application/cli/ports/GatewayPort";
import type { PromptUiState, UiState } from "./types";
import type { RootState } from "../../rootState";

export function selectUiState(state: RootState): UiState {
  return state.ui;
}

export function selectUiStatus(state: RootState): CliStatus {
  return state.ui.status;
}

export function selectUiPort(state: RootState): number | undefined {
  return state.ui.port;
}

export function selectUiError(state: RootState): string | undefined {
  return state.ui.errorMessage;
}

export function selectGatewayWarning(state: RootState): string | undefined {
  return state.ui.gatewayWarning;
}

export function selectRecordingPath(state: RootState): string | undefined {
  return state.ui.recordingPath;
}

export function selectCliConfig(state: RootState): CliConfig {
  return state.ui.config;
}

export function selectGsiState(state: RootState): Readonly<GsiProcessorState> | null {
  return state.ui.gsiState;
}

export function selectGatewayDiagnostics(state: RootState): GatewayDiagnostics {
  return state.ui.gatewayDiagnostics;
}

export function selectPromptState(state: RootState): PromptUiState {
  return state.ui.prompt;
}

export function selectCs2Status(state: RootState): Cs2ProcessStatus {
  return state.ui.cs2Status;
}

export function selectSteamStatus(state: RootState): SteamStatus {
  return state.ui.steamStatus;
}

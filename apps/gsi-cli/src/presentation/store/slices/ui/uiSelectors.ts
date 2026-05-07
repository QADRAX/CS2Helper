import { createSelector } from "@reduxjs/toolkit";
import type { GsiProcessorState } from "@cs2helper/gsi-processor";
import type { Cs2ProcessStatus } from "../../../../application/cli/ports/Cs2ProcessPort";
import type { SteamStatus } from "../../../../application/cli/useCases/getSteamStatus";
import type { CliConfig } from "../../../../domain/cli/config";
import type { CliStatus } from "../../../../domain/cli";
import type { GatewayDiagnostics } from "../../../../application/cli/ports/GatewayPort";
import { translate } from "../../../i18n/translate";
import type { UiState } from "./types";
import type { RootState } from "../../rootState";
import { selectI18nLocale } from "../i18n";

export function selectUiState(state: RootState): UiState {
  return state.ui;
}

export function selectUiStatus(state: RootState): CliStatus {
  return state.ui.status;
}

export function selectUiPort(state: RootState): number | undefined {
  return state.ui.port;
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

function selectUiErrorDescriptor(state: RootState) {
  return state.ui.error;
}

export const selectUiErrorDisplay = createSelector(
  selectI18nLocale,
  selectUiErrorDescriptor,
  (locale, descriptor) => {
    if (!descriptor) return undefined;
    const msg = translate(locale, descriptor.key, {});
    return descriptor.detail ? `${msg}: ${descriptor.detail}` : msg;
  }
);

export function selectGsiState(state: RootState): Readonly<GsiProcessorState> | null {
  return state.ui.gsiState;
}

export function selectGatewayDiagnostics(state: RootState): GatewayDiagnostics {
  return state.ui.gatewayDiagnostics;
}

export function selectCs2Status(state: RootState): Cs2ProcessStatus {
  return state.ui.cs2Status;
}

export function selectSteamStatus(state: RootState): SteamStatus {
  return state.ui.steamStatus;
}

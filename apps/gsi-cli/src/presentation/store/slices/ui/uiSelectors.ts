import { createSelector } from "@reduxjs/toolkit";
import type { GsiProcessorState } from "@cs2helper/gsi-processor";
import type { Cs2ProcessStatus, Cs2ProcessTrackingSnapshot } from "../../../../domain/telemetry/cs2Process";
import type { SteamStatus } from "../../../../application/cli/useCases/getSteamStatus";
import type { SteamWebApiUiSlice } from "./types";
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

export function selectCs2Tracking(state: RootState): Cs2ProcessTrackingSnapshot {
  return state.ui.cs2Tracking;
}

const selectCs2Running = (state: RootState): boolean => state.ui.cs2Tracking.running;
const selectCs2Pid = (state: RootState): number | undefined => state.ui.cs2Tracking.pid;

/** Stable object reference when `running` and `pid` are unchanged (avoids extra rerenders). */
export const selectCs2Status = createSelector(
  [selectCs2Running, selectCs2Pid],
  (running, pid): Cs2ProcessStatus => ({ running, pid })
);

export function selectCs2PresentChainError(state: RootState): string | undefined {
  return state.ui.cs2Tracking.presentChainError;
}

export function selectPresentMonBootstrapBlocking(state: RootState): boolean {
  return state.ui.presentMonBootstrap.blocking;
}

export function selectPresentMonBootstrapStepKey(state: RootState) {
  return state.ui.presentMonBootstrap.stepKey;
}

export function selectSteamStatus(state: RootState): SteamStatus {
  return state.ui.steamStatus;
}

export function selectSteamWebApiUi(state: RootState): SteamWebApiUiSlice {
  return state.ui.steamWebApi;
}

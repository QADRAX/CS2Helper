import { createSelector } from "@reduxjs/toolkit";
import type { GsiProcessorState } from "@cs2helper/gsi-processor";
import type { Cs2ProcessStatus, Cs2ProcessTrackingSnapshot } from "@cs2helper/performance-processor";
import type { SteamStatus } from "../../../../application/useCases/getSteamStatus";
import type { SteamWebApiUiSlice } from "./types";
import type { CliConfig } from "../../../../domain/cli/config";
import type { CliStatus } from "../../../../domain/cli";
import type { GatewayDiagnostics } from "../../../../application/ports/GatewayPort";
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

/** Single shared ref for the common idle shape (`useSelector` / strict mode use `Object.is`). */
const CS2_PROCESS_STATUS_STOPPED: Cs2ProcessStatus = { running: false, pid: undefined };

const cs2ProcessStatusByKey = new Map<string, Cs2ProcessStatus>();

function internCs2ProcessStatus(running: boolean, pid: number | undefined): Cs2ProcessStatus {
  if (!running && pid === undefined) {
    return CS2_PROCESS_STATUS_STOPPED;
  }
  const key = `${running}:${pid ?? ""}`;
  let status = cs2ProcessStatusByKey.get(key);
  if (!status) {
    status = pid === undefined ? { running } : { running, pid };
    cs2ProcessStatusByKey.set(key, status);
  }
  return status;
}

export function selectCs2Running(state: RootState): boolean {
  return state.ui.cs2Tracking.running;
}

/** Normalizes absent / nullish `pid` so intern keys match runtime snapshots. */
export function selectCs2Pid(state: RootState): number | undefined {
  return state.ui.cs2Tracking.pid ?? undefined;
}

/**
 * Project CS2 visibility for UI. Plain function + interning keeps one object ref per `(running, pid)`
 * even when `cs2Tracking` is replaced (metrics updates); avoids `createSelector` + `weakMapMemoize`
 * edge cases in dev checks and nested selectors.
 */
export function selectCs2Status(state: RootState): Cs2ProcessStatus {
  return internCs2ProcessStatus(selectCs2Running(state), selectCs2Pid(state));
}

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

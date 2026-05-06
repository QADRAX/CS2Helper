import type { GsiProcessorState } from "@cs2helper/gsi-processor";
import type { CliConfig } from "../../../../domain/cli/config";
import type { CliStatus } from "../../../../domain/cli";
import type { UiState } from "./types";
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

export function selectRecordingPath(state: RootState): string | undefined {
  return state.ui.recordingPath;
}

export function selectCliConfig(state: RootState): CliConfig {
  return state.ui.config;
}

export function selectGsiState(state: RootState): Readonly<GsiProcessorState> | null {
  return state.ui.gsiState;
}

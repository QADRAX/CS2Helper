import type { GsiProcessorState } from "@cs2helper/gsi-processor";
import type { CliStatus } from "../../../../domain/cli";
import type { CliConfig } from "../../../../domain/cli/config";

export interface UiState {
  status: CliStatus;
  errorMessage?: string;
  gsiState: Readonly<GsiProcessorState> | null;
  port?: number;
  recordingPath?: string;
  config: CliConfig;
}

export const uiInitialState: UiState = {
  status: "IDLE",
  gsiState: null,
  config: {},
};

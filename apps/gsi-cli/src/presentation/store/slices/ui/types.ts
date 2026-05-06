import type { GsiProcessorState } from "@cs2helper/gsi-processor";
import type { CliStatus } from "../../../../domain/cli";
import type { CliConfig } from "../../../../domain/cli/config";

export interface PromptUiState {
  query: string;
  suggestionIndex: number;
  lastBaseQuery: string;
  inputKey: number;
}

export const promptInitialState: PromptUiState = {
  query: "",
  suggestionIndex: -1,
  lastBaseQuery: "",
  inputKey: 0,
};

export interface UiState {
  status: CliStatus;
  errorMessage?: string;
  gsiState: Readonly<GsiProcessorState> | null;
  port?: number;
  recordingPath?: string;
  config: CliConfig;
  prompt: PromptUiState;
}

export const uiInitialState: UiState = {
  status: "IDLE",
  gsiState: null,
  config: {},
  prompt: { ...promptInitialState },
};

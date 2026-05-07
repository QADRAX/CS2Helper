import type { GsiProcessorState } from "@cs2helper/gsi-processor";
import type { Cs2ProcessStatus } from "../../../../application/cli/ports/Cs2ProcessPort";
import type { SteamStatus } from "../../../../application/cli/useCases/getSteamStatus";
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
  config: {},
  prompt: { ...promptInitialState },
  cs2Status: cs2StatusInitial,
  steamStatus: steamStatusInitial,
};

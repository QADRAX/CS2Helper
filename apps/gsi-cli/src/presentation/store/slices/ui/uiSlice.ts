import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { GsiProcessorState } from "@cs2helper/gsi-processor";
import type { Cs2ProcessStatus } from "../../../../application/cli/ports/Cs2ProcessPort";
import type { GatewayDiagnostics } from "../../../../application/cli/ports/GatewayPort";
import type { SteamStatus } from "../../../../application/cli/useCases/getSteamStatus";
import { promptInitialState, uiInitialState, type PromptUiState } from "./types";
import {
  loadConfig,
  launchCs2,
  saveCliConfig,
  startGateway,
  startRecording,
  stopGateway,
  stopRecording,
} from "./uiThunks";

const uiSlice = createSlice({
  name: "ui",
  initialState: uiInitialState,
  reducers: {
    gsiStateUpdated: (state, action: PayloadAction<Readonly<GsiProcessorState> | null>) => {
      state.gsiState = action.payload;
    },
    gatewayDiagnosticsUpdated: (state, action: PayloadAction<GatewayDiagnostics>) => {
      state.gatewayDiagnostics = action.payload;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.errorMessage = action.payload;
    },
    clearError: (state) => {
      state.errorMessage = undefined;
    },
    promptPatched: (state, action: PayloadAction<Partial<PromptUiState>>) => {
      Object.assign(state.prompt, action.payload);
    },
    promptReset: (state) => {
      state.prompt = { ...promptInitialState };
    },
    promptInputKeyBumped: (state) => {
      state.prompt.inputKey += 1;
    },
    cs2StatusUpdated: (state, action: PayloadAction<Cs2ProcessStatus>) => {
      state.cs2Status = action.payload;
    },
    steamStatusUpdated: (state, action: PayloadAction<SteamStatus>) => {
      state.steamStatus = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadConfig.fulfilled, (state, action) => {
        state.config = action.payload;
      })
      .addCase(startGateway.pending, (state) => {
        state.errorMessage = undefined;
        state.gatewayWarning = undefined;
      })
      .addCase(startGateway.fulfilled, (state, action) => {
        state.status = "LISTENING";
        state.port = action.payload.port;
        state.errorMessage = undefined;
        state.gatewayWarning = action.payload.gsiWarning;
      })
      .addCase(startGateway.rejected, (state, action) => {
        state.status = "ERROR";
        state.errorMessage = action.error.message ?? "Failed to start gateway";
      })
      .addCase(stopGateway.fulfilled, (state) => {
        state.status = "IDLE";
        state.port = undefined;
        state.gatewayWarning = undefined;
        state.gatewayDiagnostics = { receivedRequests: 0, rejectedRequests: 0 };
      })
      .addCase(saveCliConfig.fulfilled, (state, action) => {
        state.config = action.payload;
        state.errorMessage = undefined;
      })
      .addCase(saveCliConfig.rejected, (state, action) => {
        state.errorMessage = action.error.message ?? "Config save failed";
      })
      .addCase(launchCs2.pending, (state) => {
        state.errorMessage = undefined;
      })
      .addCase(launchCs2.rejected, (state, action) => {
        state.errorMessage = action.error.message ?? "Failed to launch CS2";
      })
      .addCase(startRecording.fulfilled, (state, action) => {
        state.recordingPath = action.meta.arg;
        state.errorMessage = undefined;
      })
      .addCase(startRecording.rejected, (state, action) => {
        state.errorMessage = action.error.message ?? "Recording failed";
      })
      .addCase(stopRecording.fulfilled, (state) => {
        state.recordingPath = undefined;
      });
  },
});

export const {
  gsiStateUpdated,
  gatewayDiagnosticsUpdated,
  setError,
  clearError,
  promptPatched,
  promptReset,
  promptInputKeyBumped,
  cs2StatusUpdated,
  steamStatusUpdated,
} = uiSlice.actions;
export const uiReducer = uiSlice.reducer;

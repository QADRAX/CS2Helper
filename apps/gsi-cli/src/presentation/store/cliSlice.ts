import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { GsiProcessorState } from "@cs2helper/gsi-processor";
import type { CliStatus } from "../../domain/cli";
import type { CliConfig } from "../../domain/cli/config";
import type { CliApp } from "../../infrastructure/cli/CliAppService";
import type { CliThunkExtra } from "./thunkExtra";

export interface CliUiState {
  status: CliStatus;
  errorMessage?: string;
  gsiState: Readonly<GsiProcessorState> | null;
  port?: number;
  recordingPath?: string;
  config: CliConfig;
}

const initialState: CliUiState = {
  status: "IDLE",
  gsiState: null,
  config: {},
};

export const loadConfig = createAsyncThunk<
  CliConfig,
  void,
  { extra: CliThunkExtra }
>("cli/loadConfig", async (_, { extra }) => extra.cliApp.getConfig());

export const startGateway = createAsyncThunk<
  Awaited<ReturnType<CliApp["startGateway"]>>,
  void,
  { extra: CliThunkExtra }
>("cli/startGateway", async (_, { extra }) => extra.cliApp.startGateway());

export const stopGateway = createAsyncThunk<void, void, { extra: CliThunkExtra }>(
  "cli/stopGateway",
  async (_, { extra }) => {
    await extra.cliApp.stopGateway();
  }
);

export const saveCliConfig = createAsyncThunk<
  Awaited<ReturnType<CliApp["saveConfig"]>>,
  Partial<CliConfig>,
  { extra: CliThunkExtra }
>("cli/saveConfig", async (partial, { extra }) => extra.cliApp.saveConfig(partial));

export const startRecording = createAsyncThunk<void, string, { extra: CliThunkExtra }>(
  "cli/startRecording",
  async (filename, { extra }) => {
    await extra.cliApp.startRecording(filename);
  }
);

export const stopRecording = createAsyncThunk<void, void, { extra: CliThunkExtra }>(
  "cli/stopRecording",
  async (_, { extra }) => {
    await extra.cliApp.stopRecording();
  }
);

export const exitCli = createAsyncThunk<void, void, { extra: CliThunkExtra }>(
  "cli/exit",
  async (_, { extra }) => {
    await extra.cliApp.stopRecording();
    await extra.cliApp.stopGateway();
    process.exit(0);
  }
);

const cliSlice = createSlice({
  name: "cli",
  initialState,
  reducers: {
    gsiStateUpdated: (state, action: PayloadAction<Readonly<GsiProcessorState> | null>) => {
      state.gsiState = action.payload;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.errorMessage = action.payload;
    },
    clearError: (state) => {
      state.errorMessage = undefined;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadConfig.fulfilled, (state, action) => {
        state.config = action.payload;
      })
      .addCase(startGateway.pending, (state) => {
        state.errorMessage = undefined;
      })
      .addCase(startGateway.fulfilled, (state, action) => {
        state.status = "LISTENING";
        state.port = action.payload.port;
        state.errorMessage = undefined;
      })
      .addCase(startGateway.rejected, (state, action) => {
        state.status = "ERROR";
        state.errorMessage = action.error.message ?? "Failed to start gateway";
      })
      .addCase(stopGateway.fulfilled, (state) => {
        state.status = "IDLE";
        state.port = undefined;
      })
      .addCase(saveCliConfig.fulfilled, (state, action) => {
        state.config = action.payload;
        state.errorMessage = undefined;
      })
      .addCase(saveCliConfig.rejected, (state, action) => {
        state.errorMessage = action.error.message ?? "Config save failed";
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

export const { gsiStateUpdated, setError, clearError } = cliSlice.actions;
export const cliReducer = cliSlice.reducer;

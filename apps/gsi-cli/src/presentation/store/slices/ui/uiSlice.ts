import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { GsiProcessorState } from "@cs2helper/gsi-processor";
import type { Cs2ProcessTrackingSnapshot } from "../../../../domain/telemetry/cs2Process";
import type { GatewayDiagnostics } from "../../../../application/cli/ports/GatewayPort";
import type { SteamStatus } from "../../../../application/cli/useCases/getSteamStatus";
import { msgKeys } from "../../../i18n/msgKeys";
import { uiInitialState } from "./types";
import type { MessageKey } from "../../../i18n/msgKeys";
import type { UiErrorDescriptor } from "./types";
import {
  loadConfig,
  openDataFolder,
  launchCs2,
  saveCliConfig,
  startGateway,
  startRecording,
  stopGateway,
  stopRecording,
  verifySteamWebApi,
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
    setUiError: (state, action: PayloadAction<UiErrorDescriptor | undefined>) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = undefined;
    },
    cs2TrackingUpdated: (state, action: PayloadAction<Cs2ProcessTrackingSnapshot>) => {
      state.cs2Tracking = action.payload;
    },
    steamStatusUpdated: (state, action: PayloadAction<SteamStatus>) => {
      state.steamStatus = action.payload;
    },
    steamWebApiDisabled: (state) => {
      state.steamWebApi = { enabled: false };
    },
    presentMonBootstrapStep: (
      state,
      action: PayloadAction<{ blocking: boolean; stepKey?: MessageKey }>
    ) => {
      state.presentMonBootstrap = {
        blocking: action.payload.blocking,
        stepKey: action.payload.stepKey,
      };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadConfig.fulfilled, (state, action) => {
        state.config = action.payload;
      })
      .addCase(startGateway.pending, (state) => {
        state.error = undefined;
        state.gatewayWarning = undefined;
      })
      .addCase(startGateway.fulfilled, (state, action) => {
        state.status = "LISTENING";
        state.port = action.payload.port;
        state.error = undefined;
        state.gatewayWarning = action.payload.gsiWarning;
      })
      .addCase(startGateway.rejected, (state, action) => {
        state.status = "ERROR";
        state.error = {
          key: msgKeys.cli.error.gatewayStart,
          detail: action.error.message,
        };
      })
      .addCase(stopGateway.fulfilled, (state) => {
        state.status = "IDLE";
        state.port = undefined;
        state.gatewayWarning = undefined;
        state.gatewayDiagnostics = { receivedRequests: 0, rejectedRequests: 0 };
      })
      .addCase(saveCliConfig.fulfilled, (state, action) => {
        state.config = action.payload;
        state.error = undefined;
      })
      .addCase(saveCliConfig.rejected, (state, action) => {
        state.error = {
          key: msgKeys.cli.error.configSave,
          detail: action.error.message,
        };
      })
      .addCase(launchCs2.pending, (state) => {
        state.error = undefined;
      })
      .addCase(launchCs2.rejected, (state, action) => {
        state.error = {
          key: msgKeys.cli.error.launchCs2,
          detail: action.error.message,
        };
      })
      .addCase(openDataFolder.pending, (state) => {
        state.error = undefined;
      })
      .addCase(openDataFolder.rejected, (state, action) => {
        state.error = {
          key: msgKeys.cli.error.openDataFolder,
          detail: action.error.message,
        };
      })
      .addCase(startRecording.fulfilled, (state, action) => {
        state.recordingPath = action.meta.arg;
        state.error = undefined;
      })
      .addCase(startRecording.rejected, (state, action) => {
        state.error = {
          key: msgKeys.cli.error.recording,
          detail: action.error.message,
        };
      })
      .addCase(stopRecording.fulfilled, (state) => {
        state.recordingPath = undefined;
      })
      .addCase(verifySteamWebApi.pending, (state) => {
        state.steamWebApi = { enabled: true, probe: "checking" };
      })
      .addCase(verifySteamWebApi.fulfilled, (state, action) => {
        state.steamWebApi = action.payload.ok
          ? { enabled: true, probe: "ok" }
          : { enabled: true, probe: "fail", detail: action.payload.detail };
      })
      .addCase(verifySteamWebApi.rejected, (state, action) => {
        state.steamWebApi = {
          enabled: true,
          probe: "fail",
          detail: action.error.message,
        };
      });
  },
});

export const {
  gsiStateUpdated,
  gatewayDiagnosticsUpdated,
  setUiError,
  clearError,
  cs2TrackingUpdated,
  steamStatusUpdated,
  steamWebApiDisabled,
  presentMonBootstrapStep,
} = uiSlice.actions;
export const uiReducer = uiSlice.reducer;

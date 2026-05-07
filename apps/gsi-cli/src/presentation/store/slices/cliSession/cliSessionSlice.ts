import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { CliConfig } from "../../../../domain/cli/config";
import type { ScreenMode } from "../../../components/types";
import {
  cliConfigToDraft,
  cliSessionInitialState,
  CONFIG_FORM_ROW_COUNT,
  type CliConfigDraft,
} from "./types";

const cliSessionSlice = createSlice({
  name: "cliSession",
  initialState: cliSessionInitialState,
  reducers: {
    interactiveModeSet: (state, action: PayloadAction<ScreenMode>) => {
      state.mode = action.payload;
    },
    interactiveGoMenu: (state) => {
      state.mode = "menu";
      state.menuIndex = 0;
    },
    interactiveMenuIndexSet: (state, action: PayloadAction<number>) => {
      state.menuIndex = action.payload;
    },
    interactiveMenuIndexMoved: (
      state,
      action: PayloadAction<{ optionCount: number; direction: "prev" | "next" }>
    ) => {
      const { optionCount, direction } = action.payload;
      if (optionCount <= 0) return;
      if (direction === "prev") {
        state.menuIndex = state.menuIndex <= 0 ? optionCount - 1 : state.menuIndex - 1;
      } else {
        state.menuIndex = (state.menuIndex + 1) % optionCount;
      }
    },
    interactiveConfigCursorMoved: (
      state,
      action: PayloadAction<{ direction: "prev" | "next" }>
    ) => {
      const { direction } = action.payload;
      const last = CONFIG_FORM_ROW_COUNT - 1;
      if (direction === "prev") {
        state.configCursor = state.configCursor <= 0 ? last : state.configCursor - 1;
      } else {
        state.configCursor = (state.configCursor + 1) % CONFIG_FORM_ROW_COUNT;
      }
    },
    configDraftPatched: (state, action: PayloadAction<Partial<CliConfigDraft>>) => {
      Object.assign(state.configDraft, action.payload);
    },
    configDraftAutoRecordToggled: (state) => {
      state.configDraft.autoRecordRawGsiOnStart = !state.configDraft.autoRecordRawGsiOnStart;
    },
    configDraftResetFromCliConfig: (state, action: PayloadAction<CliConfig>) => {
      state.configDraft = cliConfigToDraft(action.payload);
      state.configCursor = 0;
    },
  },
});

export const {
  interactiveModeSet,
  interactiveGoMenu,
  interactiveMenuIndexSet,
  interactiveMenuIndexMoved,
  interactiveConfigCursorMoved,
  configDraftPatched,
  configDraftAutoRecordToggled,
  configDraftResetFromCliConfig,
} = cliSessionSlice.actions;

export const cliSessionReducer = cliSessionSlice.reducer;

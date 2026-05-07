import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { AppLocale } from "../../../../domain/cli/locale";
import { parseAppLocale } from "../../../../domain/cli/locale";
import { loadConfig, saveCliConfig } from "../ui/uiThunks";

export interface I18nState {
  locale: AppLocale;
}

export const i18nInitialState: I18nState = {
  locale: "en",
};

const i18nSlice = createSlice({
  name: "i18n",
  initialState: i18nInitialState,
  reducers: {
    localeSet: (state, action: PayloadAction<AppLocale>) => {
      state.locale = parseAppLocale(action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadConfig.fulfilled, (state, action) => {
        state.locale = parseAppLocale(action.payload.locale);
      })
      .addCase(saveCliConfig.fulfilled, (state, action) => {
        state.locale = parseAppLocale(action.payload.locale);
      });
  },
});

export const { localeSet } = i18nSlice.actions;
export const i18nReducer = i18nSlice.reducer;

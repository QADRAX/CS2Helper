import { configureStore } from "@reduxjs/toolkit";
import type { CliApp } from "../../infrastructure/cli/CliAppService";
import { cliReducer, type CliUiState } from "./cliSlice";
import type { CliThunkExtra } from "./thunkExtra";

/** Explicit root state keeps selectors and tooling aligned with the `cli` slice. */
export interface RootState {
  cli: CliUiState;
}

export function createAppStore(cliApp: CliApp) {
  const extra: CliThunkExtra = { cliApp };
  return configureStore({
    reducer: { cli: cliReducer },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        thunk: { extraArgument: extra },
      }),
  });
}

export type AppStore = ReturnType<typeof createAppStore>;
export type AppDispatch = AppStore["dispatch"];

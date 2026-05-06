import { configureStore } from "@reduxjs/toolkit";
import type { CliApp } from "../../infrastructure/cli/CliAppService";
import { uiReducer } from "./slices/ui/uiSlice";
import type { CliThunkExtra } from "./thunkExtra";

export function createAppStore(cliApp: CliApp) {
  const extra: CliThunkExtra = { cliApp };
  return configureStore({
    reducer: { ui: uiReducer },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        thunk: { extraArgument: extra },
      }),
  });
}

export type AppStore = ReturnType<typeof createAppStore>;
export type AppDispatch = AppStore["dispatch"];

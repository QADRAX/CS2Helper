import { configureStore } from "@reduxjs/toolkit";
import type { CliApp } from "../../infrastructure/cli/CliAppService";
import { notificationsReducer } from "./slices/notifications";
import { uiReducer } from "./slices/ui/uiSlice";
import type { CliThunkExtra } from "./thunkExtra";

export function createAppStore(cliApp: CliApp) {
  const extra: CliThunkExtra = { cliApp };
  return configureStore({
    reducer: { ui: uiReducer, notifications: notificationsReducer },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        thunk: { extraArgument: extra },
      }),
  });
}

export type AppStore = ReturnType<typeof createAppStore>;
export type AppDispatch = AppStore["dispatch"];

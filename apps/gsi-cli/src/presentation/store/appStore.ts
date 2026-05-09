import { configureStore } from "@reduxjs/toolkit";
import type { CliApp } from "../../application/CliApp";
import { cliSessionReducer } from "./slices/cliSession";
import { i18nReducer } from "./slices/i18n";
import { notificationsReducer } from "./slices/notifications";
import { uiReducer } from "./slices/ui/uiSlice";
import type { CliThunkExtra } from "./thunkExtra";

export function createAppStore(cliApp: CliApp) {
  const extra: CliThunkExtra = { cliApp };
  return configureStore({
    reducer: {
      ui: uiReducer,
      notifications: notificationsReducer,
      cliSession: cliSessionReducer,
      i18n: i18nReducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        thunk: { extraArgument: extra },
      }),
  });
}

export type AppStore = ReturnType<typeof createAppStore>;
export type AppDispatch = AppStore["dispatch"];

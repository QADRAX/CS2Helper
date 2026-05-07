import { createAsyncThunk } from "@reduxjs/toolkit";
import type { CliConfig } from "../../../../domain/cli/config";
import type { CliApp } from "../../../../infrastructure/cli/CliAppService";
import type { CliThunkExtra } from "../../thunkExtra";
import type { RootState } from "../../rootState";
import { translate } from "../../../i18n/translate";
import { msgKeys } from "../../../i18n/msgKeys";
import { enqueueNotification } from "../notifications";

type ThunkApi = { extra: CliThunkExtra; state: RootState };

export const loadConfig = createAsyncThunk<CliConfig, void, ThunkApi>("ui/loadConfig", async (_, { extra }) =>
  extra.cliApp.getConfig()
);

export const startGateway = createAsyncThunk<
  Awaited<ReturnType<CliApp["startGateway"]>>,
  void,
  ThunkApi
>("ui/startGateway", async (_, { extra }) => extra.cliApp.startGateway());

export const stopGateway = createAsyncThunk<void, void, ThunkApi>("ui/stopGateway", async (_, { extra }) => {
  await extra.cliApp.stopGateway();
});

export const saveCliConfig = createAsyncThunk<Awaited<ReturnType<CliApp["saveConfig"]>>, Partial<CliConfig>, ThunkApi>(
  "ui/saveConfig",
  async (partial, { extra }) => extra.cliApp.saveConfig(partial)
);

export const createOrUpdateGsiCfg = createAsyncThunk<
  Awaited<ReturnType<CliApp["createOrUpdateGsiConfig"]>>,
  void,
  ThunkApi
>("ui/createOrUpdateGsiCfg", async (_, { dispatch, extra, getState }) => {
  const result = await extra.cliApp.createOrUpdateGsiConfig();
  const locale = getState().i18n.locale;
  dispatch(
    enqueueNotification({
      message: translate(locale, msgKeys.cli.notification.cfgUpdated, { path: result.filePath }),
      kind: "success",
      durationMs: 7000,
    })
  );
  return result;
});

export const launchCs2 = createAsyncThunk<void, void, ThunkApi>(
  "ui/launchCs2",
  async (_, { dispatch, extra, getState }) => {
    await extra.cliApp.launchCs2();
    dispatch(
      enqueueNotification({
        message: translate(getState().i18n.locale, msgKeys.cli.notification.launchCs2),
        kind: "info",
        durationMs: 5000,
      })
    );
  }
);

export const openDataFolder = createAsyncThunk<void, void, ThunkApi>(
  "ui/openDataFolder",
  async (_, { dispatch, extra, getState }) => {
    await extra.cliApp.openDataFolder();
    dispatch(
      enqueueNotification({
        message: translate(getState().i18n.locale, msgKeys.cli.notification.dataFolder),
        kind: "info",
        durationMs: 4000,
      })
    );
  }
);

export const startRecording = createAsyncThunk<void, string, ThunkApi>(
  "ui/startRecording",
  async (filename, { extra }) => {
    await extra.cliApp.startRecording(filename);
  }
);

export const stopRecording = createAsyncThunk<void, void, ThunkApi>("ui/stopRecording", async (_, { extra }) => {
  await extra.cliApp.stopRecording();
});

export const exitCli = createAsyncThunk<void, void, ThunkApi>("ui/exit", async (_, { extra }) => {
  await extra.cliApp.stopRecording();
  await extra.cliApp.stopGateway();
  process.exit(0);
});

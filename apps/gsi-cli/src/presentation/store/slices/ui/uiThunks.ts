import { createAsyncThunk } from "@reduxjs/toolkit";
import type { CliConfig } from "../../../../domain/cli/config";
import type { CliApp } from "../../../../infrastructure/cli/CliAppService";
import type { CliThunkExtra } from "../../thunkExtra";
import { enqueueNotification } from "../notifications";

export const loadConfig = createAsyncThunk<
  CliConfig,
  void,
  { extra: CliThunkExtra }
>("ui/loadConfig", async (_, { extra }) => extra.cliApp.getConfig());

export const startGateway = createAsyncThunk<
  Awaited<ReturnType<CliApp["startGateway"]>>,
  void,
  { extra: CliThunkExtra }
>("ui/startGateway", async (_, { extra }) => extra.cliApp.startGateway());

export const stopGateway = createAsyncThunk<void, void, { extra: CliThunkExtra }>(
  "ui/stopGateway",
  async (_, { extra }) => {
    await extra.cliApp.stopGateway();
  }
);

export const saveCliConfig = createAsyncThunk<
  Awaited<ReturnType<CliApp["saveConfig"]>>,
  Partial<CliConfig>,
  { extra: CliThunkExtra }
>("ui/saveConfig", async (partial, { extra }) => extra.cliApp.saveConfig(partial));

export const createOrUpdateGsiCfg = createAsyncThunk<
  Awaited<ReturnType<CliApp["createOrUpdateGsiConfig"]>>,
  void,
  { extra: CliThunkExtra }
>("ui/createOrUpdateGsiCfg", async (_, { dispatch, extra }) => {
  const result = await extra.cliApp.createOrUpdateGsiConfig();
  dispatch(
    enqueueNotification({
      message: `CS2 cfg updated at ${result.filePath}`,
      kind: "success",
      durationMs: 7000,
    })
  );
  return result;
});

export const launchCs2 = createAsyncThunk<void, void, { extra: CliThunkExtra }>(
  "ui/launchCs2",
  async (_, { dispatch, extra }) => {
    await extra.cliApp.launchCs2();
    dispatch(
      enqueueNotification({
        message: "Launch command sent to Steam for CS2.",
        kind: "info",
        durationMs: 5000,
      })
    );
  }
);

export const openDataFolder = createAsyncThunk<void, void, { extra: CliThunkExtra }>(
  "ui/openDataFolder",
  async (_, { dispatch, extra }) => {
    await extra.cliApp.openDataFolder();
    dispatch(
      enqueueNotification({
        message: "Opened app data folder.",
        kind: "info",
        durationMs: 4000,
      })
    );
  }
);

export const startRecording = createAsyncThunk<void, string, { extra: CliThunkExtra }>(
  "ui/startRecording",
  async (filename, { extra }) => {
    await extra.cliApp.startRecording(filename);
  }
);

export const stopRecording = createAsyncThunk<void, void, { extra: CliThunkExtra }>(
  "ui/stopRecording",
  async (_, { extra }) => {
    await extra.cliApp.stopRecording();
  }
);

export const exitCli = createAsyncThunk<void, void, { extra: CliThunkExtra }>(
  "ui/exit",
  async (_, { extra }) => {
    await extra.cliApp.stopRecording();
    await extra.cliApp.stopGateway();
    process.exit(0);
  }
);

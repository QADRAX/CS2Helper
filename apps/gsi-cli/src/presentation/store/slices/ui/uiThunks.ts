import { createAsyncThunk } from "@reduxjs/toolkit";
import type { CliConfig } from "../../../../domain/cli/config";
import type { CliApp } from "../../../../infrastructure/cli/CliAppService";
import type { CliThunkExtra } from "../../thunkExtra";

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

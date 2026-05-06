import { createAsyncThunk } from "@reduxjs/toolkit";
import type { AppDispatch } from "../../appStore";
import type { RootState } from "../../rootState";
import type { CliThunkExtra } from "../../thunkExtra";
import { setError } from "./uiSlice";
import {
  exitCli,
  saveCliConfig,
  startGateway,
  startRecording,
  stopGateway,
  stopRecording,
} from "./uiThunks";

export const executeCliCommand = createAsyncThunk<
  void,
  string,
  { extra: CliThunkExtra; dispatch: AppDispatch; state: RootState }
>("ui/executeCommand", async (rawCmd, { dispatch }) => {
  const cmd = rawCmd.trim();
  const parts = cmd.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return;

  const head = parts[0]?.toLowerCase();

  switch (head) {
    case "start":
      await dispatch(startGateway());
      return;
    case "pause":
    case "stop":
      await dispatch(stopGateway());
      return;
    case "config": {
      const subCmd = parts[1]?.toLowerCase();
      if (subCmd === "set") {
        const key = parts[2];
        const val = parts[3];
        if (!key || !val) {
          dispatch(setError("Usage: config set <port> <value>"));
          return;
        }
        if (key === "port") {
          await dispatch(saveCliConfig({ port: parseInt(val, 10) }));
        } else {
          dispatch(setError(`Unknown config key: ${key}`));
        }
      }
      return;
    }
    case "record": {
      const subCmd = parts[1]?.toLowerCase();
      if (subCmd === "start") {
        const filename = parts[2];
        if (!filename) {
          dispatch(setError("Usage: record start <filename>"));
          return;
        }
        await dispatch(startRecording(filename));
      } else if (subCmd === "stop") {
        await dispatch(stopRecording());
      }
      return;
    }
    case "exit":
    case "quit":
      await dispatch(exitCli());
      return;
    default:
      if (cmd) {
        dispatch(setError(`Unknown command: ${cmd}`));
      }
  }
});

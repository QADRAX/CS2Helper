import { Box, Text } from "ink";
import { Dashboard } from "./Dashboard";
import { Prompt } from "./Prompt";
import {
  exitCli,
  saveCliConfig,
  setError,
  startGateway,
  startRecording,
  stopGateway,
  stopRecording,
} from "../store/cliSlice";
import { useAppDispatch, useAppSelector } from "../store/hooks";

export function App() {
  const dispatch = useAppDispatch();
  const { status, port, errorMessage, recordingPath, config, gsiState } = useAppSelector(
    (s) => s.cli
  );

  const handleCommand = async (cmd: string) => {
    const parts = cmd.trim().split(" ").filter(Boolean);
    if (parts.length === 0) return;

    const action = parts[0]?.toLowerCase();

    switch (action) {
      case "start":
        await dispatch(startGateway());
        break;
      case "pause":
      case "stop":
        await dispatch(stopGateway());
        break;
      case "config": {
        const subCmd = parts[1]?.toLowerCase();
        if (subCmd === "set") {
          const key = parts[2];
          const val = parts[3];
          if (!key || !val) {
            dispatch(setError("Usage: config set <port> <value>"));
            break;
          }
          if (key === "port") {
            await dispatch(saveCliConfig({ port: parseInt(val, 10) }));
          } else {
            dispatch(setError(`Unknown config key: ${key}`));
          }
        }
        break;
      }
      case "record": {
        const subCmd = parts[1]?.toLowerCase();
        if (subCmd === "start") {
          const filename = parts[2];
          if (!filename) {
            dispatch(setError("Usage: record start <filename>"));
            break;
          }
          await dispatch(startRecording(filename));
        } else if (subCmd === "stop") {
          await dispatch(stopRecording());
        }
        break;
      }
      case "exit":
      case "quit":
        await dispatch(exitCli());
        break;
      default:
        if (cmd) {
          dispatch(setError(`Unknown command: ${cmd}`));
        }
        break;
    }
  };

  return (
    <Box flexDirection="column" width="100%">
      <Box borderStyle="single" padding={1} flexDirection="column">
        <Box justifyContent="space-between">
          <Text bold color="green">
            CS2 GSI Gateway CLI
          </Text>
          {recordingPath && (
            <Text color="red" bold>
              {" "}
              ● RECORDING: {recordingPath}
            </Text>
          )}
        </Box>
        <Text>
          Status: {status} {port ? `(Port: ${port})` : ""}
        </Text>
        <Text color="gray">Config: Port={config.port ?? "unset"}</Text>
        {errorMessage && <Text color="red">Error: {errorMessage}</Text>}
      </Box>
      <Box paddingY={1}>
        <Dashboard gsiState={gsiState} />
      </Box>
      <Prompt onCommand={handleCommand} />
    </Box>
  );
}

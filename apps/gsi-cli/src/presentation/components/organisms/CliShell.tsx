import { Box } from "ink";
import { selectUiState } from "../../store";
import { useAppSelector } from "../../hooks/redux";
import { CliShellHeader } from "./CliShellHeader";
import { GsiDashboardPanel } from "./GsiDashboardPanel";
import { InteractiveCommandPrompt } from "./InteractiveCommandPrompt";

export function CliShell() {
  const { status, port, errorMessage, recordingPath, config, gsiState } = useAppSelector(selectUiState);

  return (
    <Box flexDirection="column" width="100%">
      <CliShellHeader
        status={status}
        port={port}
        errorMessage={errorMessage}
        recordingPath={recordingPath}
        configPort={config.port}
      />
      <Box paddingY={1}>
        <GsiDashboardPanel gsiState={gsiState} />
      </Box>
      <InteractiveCommandPrompt />
    </Box>
  );
}

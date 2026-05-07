import { Box } from "ink";
import { selectUiState } from "../../store";
import { useAppSelector } from "../../hooks/redux";
import { useTerminalColumns } from "../../hooks/useTerminalColumns";
import { CliShellHeader } from "./CliShellHeader";
import { GsiDashboardPanel } from "./GsiDashboardPanel";
import { InteractiveCommandPrompt } from "./InteractiveCommandPrompt";

export function CliShell() {
  const terminalWidth = useTerminalColumns();
  const {
    status,
    port,
    errorMessage,
    recordingPath,
    config,
    gsiState,
    cs2Status,
    steamStatus,
  } = useAppSelector(selectUiState);

  return (
    <Box flexDirection="column" width={terminalWidth}>
      <CliShellHeader
        terminalWidth={terminalWidth}
        status={status}
        port={port}
        errorMessage={errorMessage}
        recordingPath={recordingPath}
        configPort={config.port}
        cs2Status={cs2Status}
        steamStatus={steamStatus}
      />
      <Box paddingY={1} width={terminalWidth}>
        <GsiDashboardPanel gsiState={gsiState} contentWidth={terminalWidth} />
      </Box>
      <Box width={terminalWidth}>
        <InteractiveCommandPrompt contentWidth={terminalWidth} />
      </Box>
    </Box>
  );
}

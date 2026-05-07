import { Box } from "ink";
import type { Cs2ProcessStatus } from "../../../application/cli/ports/Cs2ProcessPort";
import type { SteamStatus } from "../../../application/cli/useCases/getSteamStatus";
import type { CliStatus } from "../../../domain/cli";
import { ConfigPortLine } from "../atoms/ConfigPortLine";
import { ErrorLine } from "../atoms/ErrorLine";
import { HeaderTitleRow } from "../molecules/HeaderTitleRow";
import { StatusLine } from "../atoms/StatusLine";
import { SystemStatusRow } from "../molecules/SystemStatusRow";

/** Horizontal space consumed by `borderStyle="single"` + `padding={1}`. */
const HEADER_FRAME_INSET = 4;

export interface CliShellHeaderProps {
  terminalWidth: number;
  status: CliStatus;
  port: number | undefined;
  errorMessage: string | undefined;
  recordingPath: string | undefined;
  configPort: number | undefined;
  cs2Status: Cs2ProcessStatus;
  steamStatus: SteamStatus;
}

export function CliShellHeader({
  terminalWidth,
  status,
  port,
  errorMessage,
  recordingPath,
  configPort,
  cs2Status,
  steamStatus,
}: CliShellHeaderProps) {
  const innerWidth = Math.max(20, terminalWidth - HEADER_FRAME_INSET);
  const stackSystemStatus = terminalWidth < 80;

  return (
    <Box borderStyle="single" padding={1} flexDirection="column" width={terminalWidth}>
      <HeaderTitleRow recordingPath={recordingPath} maxWidth={innerWidth} />
      <SystemStatusRow
        cs2Status={cs2Status}
        steamStatus={steamStatus}
        stacked={stackSystemStatus}
        maxWidth={innerWidth}
      />
      <Box width={innerWidth}>
        <StatusLine status={status} port={port} />
      </Box>
      <Box width={innerWidth}>
        <ConfigPortLine port={configPort} />
      </Box>
      {errorMessage ? (
        <Box width={innerWidth}>
          <ErrorLine message={errorMessage} />
        </Box>
      ) : null}
    </Box>
  );
}

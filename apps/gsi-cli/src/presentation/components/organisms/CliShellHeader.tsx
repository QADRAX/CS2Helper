import { Box } from "ink";
import type { Cs2ProcessStatus } from "../../../application/cli/ports/Cs2ProcessPort";
import type { SteamStatus } from "../../../application/cli/useCases/getSteamStatus";
import type { CliStatus } from "../../../domain/cli";
import { ConfigPortLine } from "../atoms/ConfigPortLine";
import { ErrorLine } from "../atoms/ErrorLine";
import { HeaderTitleRow } from "../molecules/HeaderTitleRow";
import { StatusLine } from "../atoms/StatusLine";
import { SystemStatusRow } from "../molecules/SystemStatusRow";

export interface CliShellHeaderProps {
  status: CliStatus;
  port: number | undefined;
  errorMessage: string | undefined;
  recordingPath: string | undefined;
  configPort: number | undefined;
  cs2Status: Cs2ProcessStatus;
  steamStatus: SteamStatus;
}

export function CliShellHeader({
  status,
  port,
  errorMessage,
  recordingPath,
  configPort,
  cs2Status,
  steamStatus,
}: CliShellHeaderProps) {
  return (
    <Box borderStyle="single" padding={1} flexDirection="column">
      <HeaderTitleRow recordingPath={recordingPath} />
      <SystemStatusRow cs2Status={cs2Status} steamStatus={steamStatus} />
      <StatusLine status={status} port={port} />
      <ConfigPortLine port={configPort} />
      {errorMessage ? <ErrorLine message={errorMessage} /> : null}
    </Box>
  );
}

import { Box } from "ink";
import type { CliStatus } from "../../../domain/cli";
import { ConfigPortLine } from "../atoms/ConfigPortLine";
import { ErrorLine } from "../atoms/ErrorLine";
import { HeaderTitleRow } from "../molecules/HeaderTitleRow";
import { StatusLine } from "../atoms/StatusLine";

export interface CliShellHeaderProps {
  status: CliStatus;
  port: number | undefined;
  errorMessage: string | undefined;
  recordingPath: string | undefined;
  configPort: number | undefined;
}

export function CliShellHeader({
  status,
  port,
  errorMessage,
  recordingPath,
  configPort,
}: CliShellHeaderProps) {
  return (
    <Box borderStyle="single" padding={1} flexDirection="column">
      <HeaderTitleRow recordingPath={recordingPath} />
      <StatusLine status={status} port={port} />
      <ConfigPortLine port={configPort} />
      {errorMessage ? <ErrorLine message={errorMessage} /> : null}
    </Box>
  );
}

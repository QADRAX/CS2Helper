import { Box, Text } from "ink";
import type { Cs2ProcessStatus } from "../../../application/cli/ports/Cs2ProcessPort";
import type { SteamStatus } from "../../../application/cli/useCases/getSteamStatus";
import type { CliStatus } from "../../../domain/cli";
import { HeaderStatusLine } from "../atoms/HeaderStatusLine";

interface CliHeaderPanelProps {
  steamStatus: SteamStatus;
  cs2Status: Cs2ProcessStatus;
  gatewayStatus: CliStatus;
}

export function CliHeaderPanel({ steamStatus, cs2Status, gatewayStatus }: CliHeaderPanelProps) {
  return (
    <Box borderStyle="single" paddingX={1} flexDirection="column" width="100%">
      <Text bold color="cyan">
        CS2Helper CLI
      </Text>
      <HeaderStatusLine
        steamRunning={steamStatus.running}
        cs2Running={cs2Status.running}
        gatewayStatus={gatewayStatus}
      />
    </Box>
  );
}

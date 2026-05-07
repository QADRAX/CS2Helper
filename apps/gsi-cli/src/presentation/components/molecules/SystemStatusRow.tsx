import { Box } from "ink";
import type { Cs2ProcessStatus } from "../../../application/cli/ports/Cs2ProcessPort";
import type { SteamStatus } from "../../../application/cli/useCases/getSteamStatus";
import { Cs2StatusLine } from "../atoms/Cs2StatusLine";
import { SteamStatusLine } from "../atoms/SteamStatusLine";

interface SystemStatusRowProps {
  cs2Status: Cs2ProcessStatus;
  steamStatus: SteamStatus;
}

export function SystemStatusRow({ cs2Status, steamStatus }: SystemStatusRowProps) {
  return (
    <Box gap={2}>
      <SteamStatusLine status={steamStatus} />
      <Cs2StatusLine status={cs2Status} />
    </Box>
  );
}

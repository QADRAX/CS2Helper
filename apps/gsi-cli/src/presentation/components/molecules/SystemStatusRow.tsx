import { Box } from "ink";
import type { Cs2ProcessStatus } from "../../../application/cli/ports/Cs2ProcessPort";
import type { SteamStatus } from "../../../application/cli/useCases/getSteamStatus";
import { Cs2StatusLine } from "../atoms/Cs2StatusLine";
import { SteamStatusLine } from "../atoms/SteamStatusLine";

interface SystemStatusRowProps {
  cs2Status: Cs2ProcessStatus;
  steamStatus: SteamStatus;
  /** When true, Steam and CS2 lines stack vertically for narrow terminals. */
  stacked: boolean;
  maxWidth: number;
}

export function SystemStatusRow({
  cs2Status,
  steamStatus,
  stacked,
  maxWidth,
}: SystemStatusRowProps) {
  if (stacked) {
    return (
      <Box flexDirection="column" gap={1} width={maxWidth}>
        <Box width={maxWidth}>
          <SteamStatusLine status={steamStatus} />
        </Box>
        <Box width={maxWidth}>
          <Cs2StatusLine status={cs2Status} />
        </Box>
      </Box>
    );
  }

  return (
    <Box flexDirection="row" gap={2} width={maxWidth} flexWrap="wrap">
      <SteamStatusLine status={steamStatus} />
      <Cs2StatusLine status={cs2Status} />
    </Box>
  );
}

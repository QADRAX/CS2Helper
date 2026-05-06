import { Box } from "ink";
import type { GsiProcessorState } from "@cs2helper/gsi-processor";
import { StreamStateBadge } from "../atoms/StreamStateBadge";
import { MutedText } from "../atoms/MutedText";

interface StreamMetricsFooterProps {
  gsiState: Readonly<GsiProcessorState>;
}

export function StreamMetricsFooter({ gsiState }: StreamMetricsFooterProps) {
  const { totalTicks, streamState } = gsiState;
  const streamOk = streamState === "healthy";

  return (
    <Box flexDirection="column">
      <Box gap={1}>
        <MutedText>
          Ticks: {totalTicks}
        </MutedText>
        <MutedText>(GSI POSTs received)</MutedText>
      </Box>
      <StreamStateBadge state={streamState} />
      {!streamOk ? (
        <MutedText>
          Round stats (K/D/damage/flashes) only update when stream is healthy — partial or incomplete
          snapshots skip critical reducers.
        </MutedText>
      ) : null}
    </Box>
  );
}

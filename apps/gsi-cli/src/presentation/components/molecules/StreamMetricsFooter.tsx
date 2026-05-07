import { Box } from "ink";
import type { GsiProcessorState } from "@cs2helper/gsi-processor";
import { MutedText } from "../atoms/MutedText";
import { StreamStateBadge } from "../atoms/StreamStateBadge";

interface StreamMetricsFooterProps {
  gsiState: Readonly<GsiProcessorState>;
  contentWidth: number;
}

export function StreamMetricsFooter({ gsiState, contentWidth }: StreamMetricsFooterProps) {
  const { totalTicks, streamState } = gsiState;
  const streamOk = streamState === "healthy";

  return (
    <Box flexDirection="column" width={contentWidth} gap={1}>
      <Box flexDirection="row" flexWrap="wrap" width={contentWidth} gap={1}>
        <MutedText wrap="wrap">
          Ticks: {totalTicks}
        </MutedText>
        <MutedText wrap="wrap">(GSI POSTs received)</MutedText>
      </Box>
      <StreamStateBadge state={streamState} />
      {!streamOk ? (
        <Box width={contentWidth}>
          <MutedText wrap="wrap">
            Round stats (K/D/damage/flashes) only update when stream is healthy — partial or incomplete
            snapshots skip critical reducers.
          </MutedText>
        </Box>
      ) : null}
    </Box>
  );
}

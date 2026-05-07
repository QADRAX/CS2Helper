import { Box, Text } from "ink";
import type { MatchData } from "@cs2helper/gsi-processor";

interface MatchHeadlineProps {
  match: MatchData;
  contentWidth: number;
}

export function MatchHeadline({ match, contentWidth }: MatchHeadlineProps) {
  return (
    <Box flexDirection="column" width={contentWidth}>
      <Box flexDirection="row" flexWrap="wrap" width={contentWidth}>
        <Text bold color="yellow" wrap="wrap">
          📍 {match.mapName}
        </Text>
        <Text color="gray"> • </Text>
        <Text color="white" wrap="wrap">
          {match.mode}
        </Text>
        <Text color="gray"> • </Text>
        <Text color="cyan" wrap="wrap">
          {match.rounds.length} rounds
        </Text>
      </Box>
    </Box>
  );
}

import { Box, Text } from "ink";
import type { MatchData } from "@cs2helper/gsi-processor";

interface MatchHeadlineProps {
  match: MatchData;
}

export function MatchHeadline({ match }: MatchHeadlineProps) {
  return (
    <Box flexDirection="column">
      <Box>
        <Text bold color="yellow">
          📍 {match.mapName}
        </Text>
        <Text color="gray"> • </Text>
        <Text color="white">{match.mode}</Text>
        <Text color="gray"> • </Text>
        <Text color="cyan">{match.rounds.length} rounds</Text>
      </Box>
    </Box>
  );
}

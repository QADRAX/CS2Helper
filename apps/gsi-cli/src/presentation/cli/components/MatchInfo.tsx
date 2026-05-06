import React from 'react';
import { Box, Text } from 'ink';
import type { MatchData } from '@cs2helper/gsi-processor';

interface MatchInfoProps {
  match: MatchData;
}

export function MatchInfo({ match }: MatchInfoProps) {

  return (
    <Box flexDirection="column">
      <Box>
        <Text bold color="yellow">📍 {match.mapName}</Text>
        <Text color="gray"> • </Text>
        <Text color="white">{match.mode}</Text>
        <Text color="gray"> • </Text>
        <Text color="cyan">{match.rounds.length} rounds</Text>
      </Box>
    </Box>
  );
}

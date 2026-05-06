import React from 'react';
import { Box, Text } from 'ink';

interface MatchInfoProps {
  map?: {
    name: string;
    mode: string;
    phase: string;
    round: number;
    team_ct: { score: number };
    team_t: { score: number };
  };
}

export function MatchInfo({ map }: MatchInfoProps) {
  if (!map?.name) return null;

  return (
    <Box flexDirection="column" marginBottom={1}>
      <Box>
        <Text bold color="yellow">📍 {map.name}</Text>
        <Text color="gray"> • </Text>
        <Text color="white">{map.mode}</Text>
        <Text color="gray"> • </Text>
        <Text color="magenta">{map.phase}</Text>
      </Box>
      <Box>
        <Text color="blue" bold>CT {map.team_ct?.score || 0}</Text>
        <Text color="white"> - </Text>
        <Text color="red" bold>{map.team_t?.score || 0} T</Text>
        <Text color="gray"> (Round {map.round})</Text>
      </Box>
    </Box>
  );
}

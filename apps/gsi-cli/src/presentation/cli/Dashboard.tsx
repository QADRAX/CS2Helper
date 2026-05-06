import React from 'react';
import { Box, Text } from 'ink';
import type { GsiProcessorState } from '@cs2helper/gsi-processor';
import { MatchInfo } from './components/MatchInfo';
import { RoundInfo } from './components/RoundInfo';
import { PlayerInfo } from './components/PlayerInfo';

interface DashboardProps {
  gsiState?: Readonly<GsiProcessorState> | null;
}

export function Dashboard({ gsiState }: DashboardProps) {
  if (!gsiState) {
    return (
      <Box paddingY={1}>
        <Text color="gray" italic>Waiting for GSI State...</Text>
      </Box>
    );
  }

  const { currentMatch, playersBySteamId, totalTicks } = gsiState;

  if (!currentMatch) {
    return (
      <Box flexDirection="column">
        <Text color="gray" italic>Connected — waiting for match...</Text>
        <Text color="gray" dimColor>Ticks: {totalTicks}</Text>
      </Box>
    );
  }

  const lastRound = currentMatch.rounds[currentMatch.rounds.length - 1];

  return (
    <Box flexDirection="column" gap={1}>
      <MatchInfo match={currentMatch} />
      <RoundInfo round={lastRound} />
      <PlayerInfo players={playersBySteamId} />
      <Text color="gray" dimColor>Ticks: {totalTicks}</Text>
    </Box>
  );
}

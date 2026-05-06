import React from 'react';
import { Box, Text } from 'ink';
import type { GsiProcessorState } from '@cs2helper/gsi-processor';
import { GameInfo } from './components/GameInfo';
import { MatchInfo } from './components/MatchInfo';
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

  const payload = gsiState.lastGameState as any;

  return (
    <Box flexDirection="column" gap={0}>
      <GameInfo provider={payload?.provider} />
      <MatchInfo map={payload?.map} />
      <PlayerInfo player={payload?.player} />
    </Box>
  );
}

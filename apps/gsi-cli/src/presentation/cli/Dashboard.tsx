import React from 'react';
import { Box, Text } from 'ink';
import type { GsiProcessorState, StreamState } from '@cs2helper/gsi-processor';
import { MatchInfo } from './components/MatchInfo';
import { RoundInfo } from './components/RoundInfo';
import { PlayerInfo } from './components/PlayerInfo';

interface DashboardProps {
  gsiState?: Readonly<GsiProcessorState> | null;
}

function streamStateColor(state: StreamState): string {
  switch (state) {
    case 'healthy':
      return 'green';
    case 'recovering':
    case 'gap':
      return 'yellow';
    case 'degraded':
      return 'red';
    case 'cold_start':
    default:
      return 'gray';
  }
}

function StreamFooter({ gsiState }: { gsiState: Readonly<GsiProcessorState> }) {
  const { totalTicks, streamState } = gsiState;
  const streamOk = streamState === 'healthy';
  return (
    <Box flexDirection="column">
      <Box gap={1}>
        <Text color="gray" dimColor>
          Ticks: {totalTicks}
        </Text>
        <Text color="gray" dimColor>
          (GSI POSTs received)
        </Text>
      </Box>
      <Text>
        <Text color="gray" dimColor>Stream: </Text>
        <Text color={streamStateColor(streamState)} bold>{streamState}</Text>
      </Text>
      {!streamOk && (
        <Text color="yellow" dimColor>
          Round stats (K/D/damage/flashes) only update when stream is healthy — partial or incomplete
          snapshots skip critical reducers.
        </Text>
      )}
    </Box>
  );
}

export function Dashboard({ gsiState }: DashboardProps) {
  if (!gsiState) {
    return (
      <Box paddingY={1}>
        <Text color="gray" italic>Waiting for GSI State...</Text>
      </Box>
    );
  }

  const { currentMatch, playersBySteamId } = gsiState;

  if (!currentMatch) {
    return (
      <Box flexDirection="column" gap={1}>
        <Text color="gray" italic>Connected — waiting for match...</Text>
        <StreamFooter gsiState={gsiState} />
      </Box>
    );
  }

  const lastRound = currentMatch.rounds[currentMatch.rounds.length - 1];

  return (
    <Box flexDirection="column" gap={1}>
      <MatchInfo match={currentMatch} />
      <RoundInfo round={lastRound} />
      <PlayerInfo players={playersBySteamId} />
      <StreamFooter gsiState={gsiState} />
    </Box>
  );
}

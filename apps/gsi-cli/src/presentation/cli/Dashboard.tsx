import React from 'react';
import { Box, Text } from 'ink';
import type { GsiProcessorState } from '@cs2helper/gsi-processor';

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
  const provider = payload?.provider;
  const map = payload?.map;
  const player = payload?.player;

  return (
    <Box flexDirection="column" gap={0}>
      {/* Game Engine Info */}
      {provider && (
        <Box marginBottom={1}>
          <Text bold color="cyan">🎮 {provider.name}</Text>
          <Text color="gray"> (v{provider.version})</Text>
        </Box>
      )}

      {/* Match Info - Only if in a map */}
      {map?.name && (
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
      )}

      {/* Player Info - Only if data exists */}
      {player?.name && (
        <Box flexDirection="column">
          <Box>
            <Text bold color="green">👤 {player.name}</Text>
            {player.team && (
              <Text color={player.team === 'CT' ? 'blue' : 'red'}> [{player.team}]</Text>
            )}
            <Text color="gray"> • {player.activity}</Text>
          </Box>
          
          {player.match_stats && (
            <Text>
              <Text color="green">{player.match_stats.kills}K</Text>
              <Text color="gray"> / </Text>
              <Text color="yellow">{player.match_stats.assists}A</Text>
              <Text color="gray"> / </Text>
              <Text color="red">{player.match_stats.deaths}D</Text>
              <Text color="gray"> | MVP: </Text>
              <Text color="magenta">{player.match_stats.mvps}</Text>
            </Text>
          )}

          {player.state && player.activity === 'playing' && (
            <Box>
              <Text color="green">❤️ {player.state.health}</Text>
              <Text color="gray"> | </Text>
              <Text color="blue">🛡️ {player.state.armor}</Text>
              <Text color="gray"> | </Text>
              <Text color="yellow">💰 ${player.state.money}</Text>
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
}

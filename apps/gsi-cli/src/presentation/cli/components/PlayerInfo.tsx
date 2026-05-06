import React from 'react';
import { Box, Text } from 'ink';
import type { PlayerAggregate } from '@cs2helper/gsi-processor';

interface PlayerInfoProps {
  players: Record<string, PlayerAggregate>;
}

export function PlayerInfo({ players }: PlayerInfoProps) {
  const entries = Object.values(players);
  if (entries.length === 0) return null;

  return (
    <Box flexDirection="column">
      <Text bold color="cyan">Players</Text>
      {entries.map((p) => (
        <Box key={p.steamid}>
          <Text color={p.team === 'CT' ? 'blue' : 'red'} bold>{p.team} </Text>
          <Text color="white">{p.name}</Text>
          <Text color="gray"> • </Text>
          <Text color="green">{p.kills}K</Text>
          <Text color="gray">/</Text>
          <Text color="red">{p.deaths}D</Text>
          <Text color="gray"> • </Text>
          <Text color={p.health > 0 ? 'green' : 'red'}>❤️ {p.health}</Text>
          <Text color="gray"> • </Text>
          <Text color="yellow">💰 ${p.money}</Text>
        </Box>
      ))}
    </Box>
  );
}

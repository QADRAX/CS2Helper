import React from 'react';
import { Box, Text } from 'ink';

interface PlayerInfoProps {
  player?: {
    name: string;
    team?: string;
    activity: string;
    match_stats?: {
      kills: number;
      assists: number;
      deaths: number;
      mvps: number;
    };
    state?: {
      health: number;
      armor: number;
      money: number;
    };
  };
}

export function PlayerInfo({ player }: PlayerInfoProps) {
  if (!player?.name) return null;

  return (
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

      {player.state && (
        <Box>
          <Text color="green">❤️ {player.state.health}</Text>
          <Text color="gray"> | </Text>
          <Text color="blue">🛡️ {player.state.armor}</Text>
          <Text color="gray"> | </Text>
          <Text color="yellow">💰 ${player.state.money}</Text>
        </Box>
      )}
    </Box>
  );
}

import React from 'react';
import { Box, Text } from 'ink';

interface GameInfoProps {
  provider?: {
    name: string;
    version: number;
  };
}

export function GameInfo({ provider }: GameInfoProps) {
  if (!provider) return null;

  return (
    <Box marginBottom={1}>
      <Text bold color="cyan">🎮 {provider.name}</Text>
      <Text color="gray"> (v{provider.version})</Text>
    </Box>
  );
}

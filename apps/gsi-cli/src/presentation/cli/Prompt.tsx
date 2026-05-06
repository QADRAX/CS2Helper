import React, { useState } from 'react';
import { Box, Text } from 'ink';
import TextInput from 'ink-text-input';

interface PromptProps {
  onCommand: (cmd: string) => void;
}

export function Prompt({ onCommand }: PromptProps) {
  const [query, setQuery] = useState('');

  const handleSubmit = (val: string) => {
    onCommand(val);
    setQuery('');
  };

  return (
    <Box>
      <Box marginRight={1}>
        <Text color="yellow">{'>'}</Text>
      </Box>
      <TextInput 
        value={query} 
        onChange={setQuery} 
        onSubmit={handleSubmit} 
      />
    </Box>
  );
}

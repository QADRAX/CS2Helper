import React, { useState, useMemo } from 'react';
import { Box, Text, useInput } from 'ink';
import TextInput from 'ink-text-input';

interface PromptProps {
  onCommand: (cmd: string) => void;
}

const COMMAND_TREE: Record<string, string[]> = {
  '': ['start', 'stop', 'record', 'config', 'exit'],
  'record': ['start', 'stop'],
  'config': ['set'],
  'config set': ['port']
};

export function Prompt({ onCommand }: PromptProps) {
  const [query, setQuery] = useState('');
  const [suggestionIndex, setSuggestionIndex] = useState(-1);
  const [lastBaseQuery, setLastBaseQuery] = useState('');
  const [inputKey, setInputKey] = useState(0);

  // Determine the context and the part being filtered
  const { context, filter, parts } = useMemo(() => {
    const p = query.split(' ');
    const lastPart = p[p.length - 1] || '';
    const isAfterSpace = query.endsWith(' ') && query.length > 0;
    
    if (isAfterSpace) {
      return { 
        context: query.trim(), 
        filter: '', 
        parts: p.filter(x => x !== '') 
      };
    } else {
      return { 
        context: p.slice(0, -1).join(' ').trim(), 
        filter: lastPart, 
        parts: p.slice(0, -1).filter(x => x !== '') 
      };
    }
  }, [query]);

  const availableOptions = useMemo(() => {
    const opts = COMMAND_TREE[context] || [];
    // If we are cycling, we want to see ALL options that match the original filter
    // but the filter changes as we cycle... so we need to store the base filter.
    return opts.filter(opt => opt.startsWith(suggestionIndex === -1 ? filter : lastBaseQuery));
  }, [context, filter, suggestionIndex, lastBaseQuery]);

  useInput((_input, key) => {
    if (key.upArrow || key.downArrow) {
      if (availableOptions.length === 0) return;

      let newIndex = suggestionIndex;
      if (key.upArrow) {
        newIndex = suggestionIndex === -1 ? 0 : (suggestionIndex + 1) % availableOptions.length;
      } else {
        newIndex = suggestionIndex <= 0 ? availableOptions.length - 1 : suggestionIndex - 1;
      }

      // If starting to cycle, remember what the user typed so we can keep filtering correctly
      if (suggestionIndex === -1) {
        setLastBaseQuery(filter);
      }

      setSuggestionIndex(newIndex);
      
      // Update query with the selected suggestion
      const selected = availableOptions[newIndex];
      if (selected) {
        const prefix = context ? context + ' ' : '';
        setQuery(prefix + selected);
        // Force TextInput remount so cursor moves to end of text
        setInputKey(k => k + 1);
      }
    }

    if (key.return) {
      // Clear cycling state
      setSuggestionIndex(-1);
      setLastBaseQuery('');
    }
  });

  const handleSubmit = (val: string) => {
    onCommand(val.trim());
    setQuery('');
    setSuggestionIndex(-1);
    setLastBaseQuery('');
  };

  const handleQueryChange = (val: string) => {
    setQuery(val);
    // If user types anything, stop cycling
    setSuggestionIndex(-1);
    setLastBaseQuery('');
  };

  return (
    <Box flexDirection="column">
      {availableOptions.length > 0 && (
        <Box marginLeft={2} height={1}>
          {availableOptions.map((opt, i) => (
            <Text key={opt} color={i === suggestionIndex ? "cyan" : "gray"} bold={i === suggestionIndex}>
              {opt}{"  "}
            </Text>
          ))}
        </Box>
      )}
      <Box>
        <Box marginRight={1}>
          <Text color="yellow">{'>'}</Text>
        </Box>
        <TextInput 
          key={inputKey}
          value={query} 
          onChange={handleQueryChange} 
          onSubmit={handleSubmit} 
        />
      </Box>
    </Box>
  );
}

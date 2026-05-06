import { Box, Text } from "ink";

interface PromptSuggestionRowProps {
  options: string[];
  activeIndex: number;
}

export function PromptSuggestionRow({ options, activeIndex }: PromptSuggestionRowProps) {
  if (options.length === 0) return null;

  return (
    <Box marginLeft={2} height={1}>
      {options.map((opt, i) => (
        <Text key={opt} color={i === activeIndex ? "cyan" : "gray"} bold={i === activeIndex}>
          {opt}{"  "}
        </Text>
      ))}
    </Box>
  );
}

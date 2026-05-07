import { Box, Text } from "ink";

interface PromptSuggestionRowProps {
  options: string[];
  activeIndex: number;
  contentWidth: number;
}

export function PromptSuggestionRow({ options, activeIndex, contentWidth }: PromptSuggestionRowProps) {
  if (options.length === 0) return null;

  return (
    <Box marginLeft={2} flexDirection="row" flexWrap="wrap" width={contentWidth}>
      {options.map((opt, i) => (
        <Text key={opt} color={i === activeIndex ? "cyan" : "gray"} bold={i === activeIndex} wrap="wrap">
          {opt}
          {"  "}
        </Text>
      ))}
    </Box>
  );
}

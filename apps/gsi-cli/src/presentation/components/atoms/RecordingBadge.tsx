import { Box, Text } from "ink";

interface RecordingBadgeProps {
  path: string;
  maxWidth: number;
}

export function RecordingBadge({ path, maxWidth }: RecordingBadgeProps) {
  return (
    <Box width={maxWidth}>
      <Text color="red" bold wrap="truncate-end">
        ● RECORDING: {path}
      </Text>
    </Box>
  );
}

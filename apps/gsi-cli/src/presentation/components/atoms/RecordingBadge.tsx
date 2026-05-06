import { Text } from "ink";

interface RecordingBadgeProps {
  path: string;
}

export function RecordingBadge({ path }: RecordingBadgeProps) {
  return (
    <Text color="red" bold>
      {" "}
      ● RECORDING: {path}
    </Text>
  );
}

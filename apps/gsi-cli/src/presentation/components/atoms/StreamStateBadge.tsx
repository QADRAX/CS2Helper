import { Text } from "ink";
import type { StreamState } from "@cs2helper/gsi-processor";
import { streamStateColor } from "../../lib/streamStateColor";

interface StreamStateBadgeProps {
  state: StreamState;
}

export function StreamStateBadge({ state }: StreamStateBadgeProps) {
  return (
    <Text>
      <Text color="gray" dimColor>
        Stream:{" "}
      </Text>
      <Text color={streamStateColor(state)} bold>
        {state}
      </Text>
    </Text>
  );
}

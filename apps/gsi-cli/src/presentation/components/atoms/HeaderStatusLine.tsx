import { Box, Text } from "ink";
import type { CliStatus } from "../../../domain/cli";
import { StatusIndicator } from "./StatusIndicator";

interface HeaderStatusLineProps {
  steamRunning: boolean;
  cs2Running: boolean;
  gatewayStatus: CliStatus;
}

export function HeaderStatusLine({ steamRunning, cs2Running, gatewayStatus }: HeaderStatusLineProps) {
  const gatewayOnline = gatewayStatus === "LISTENING";

  return (
    <Box gap={3} flexWrap="wrap">
      <Text>
        Steam: <StatusIndicator value={steamRunning} />
      </Text>
      <Text>
        CS2: <StatusIndicator value={cs2Running} />
      </Text>
      <Text>
        Gateway: <Text color={gatewayOnline ? "green" : "red"}>{gatewayStatus}</Text>
      </Text>
    </Box>
  );
}

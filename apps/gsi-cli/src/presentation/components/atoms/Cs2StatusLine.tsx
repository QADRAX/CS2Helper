import { Text } from "ink";
import type { Cs2ProcessStatus } from "../../../application/cli/ports/Cs2ProcessPort";

interface Cs2StatusLineProps {
  status: Cs2ProcessStatus;
}

export function Cs2StatusLine({ status }: Cs2StatusLineProps) {
  const color = status.running ? "green" : "gray";
  const label = status.running ? "RUNNING" : "OFF";
  const detail = status.running && status.pid ? ` (pid ${status.pid})` : "";

  return (
    <Text wrap="wrap">
      <Text color="gray" dimColor>
        CS2:{" "}
      </Text>
      <Text color={color} bold>
        {label}
      </Text>
      {detail ? (
        <Text color="gray" dimColor>
          {detail}
        </Text>
      ) : null}
    </Text>
  );
}

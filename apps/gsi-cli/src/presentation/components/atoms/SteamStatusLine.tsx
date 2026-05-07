import { Text } from "ink";
import type { SteamStatus } from "../../../application/cli/useCases/getSteamStatus";

interface SteamStatusLineProps {
  status: SteamStatus;
}

export function SteamStatusLine({ status }: SteamStatusLineProps) {
  const { color, label } = resolveLabel(status);
  const detail = status.running && status.pid ? ` (pid ${status.pid})` : "";

  return (
    <Text>
      <Text color="gray" dimColor>
        Steam:{" "}
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

const resolveLabel = (status: SteamStatus): { color: string; label: string } => {
  if (!status.installed) {
    return { color: "red", label: "NOT INSTALLED" };
  }
  if (status.running) {
    return { color: "green", label: "RUNNING" };
  }
  return { color: "yellow", label: "INSTALLED · OFF" };
};

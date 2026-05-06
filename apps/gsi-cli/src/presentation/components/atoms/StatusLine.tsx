import { Text } from "ink";
import type { CliStatus } from "../../../domain/cli";

interface StatusLineProps {
  status: CliStatus;
  port?: number;
}

export function StatusLine({ status, port }: StatusLineProps) {
  return (
    <Text>
      Status: {status} {port ? `(Port: ${port})` : ""}
    </Text>
  );
}

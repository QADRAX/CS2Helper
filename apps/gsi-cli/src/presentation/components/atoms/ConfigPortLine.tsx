import { Text } from "ink";

interface ConfigPortLineProps {
  port: number | undefined;
}

export function ConfigPortLine({ port }: ConfigPortLineProps) {
  return (
    <Text color="gray" wrap="wrap">
      Config: Port={port ?? "unset"}
    </Text>
  );
}

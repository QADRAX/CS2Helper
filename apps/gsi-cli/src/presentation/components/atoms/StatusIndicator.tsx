import { Text } from "ink";

interface StatusIndicatorProps {
  value: boolean;
  onLabel?: string;
  offLabel?: string;
}

export function StatusIndicator({ value, onLabel = "ON", offLabel = "OFF" }: StatusIndicatorProps) {
  return <Text color={value ? "green" : "red"}>{value ? onLabel : offLabel}</Text>;
}

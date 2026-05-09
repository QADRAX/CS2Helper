import { Text } from "ink";

export interface AlertPrefixLineProps {
  prefix: string;
  message: string;
  /** Ink text color name; defaults to `yellow` for warnings. */
  color?: string;
}

/** One-line alert: `prefix` + `message` in a single tone color. */
export function AlertPrefixLine({ prefix, message, color = "yellow" }: AlertPrefixLineProps) {
  return (
    <Text color={color}>
      {prefix} {message}
    </Text>
  );
}

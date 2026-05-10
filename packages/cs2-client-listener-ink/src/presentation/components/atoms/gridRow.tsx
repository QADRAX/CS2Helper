import { Box, Text } from "ink";

export interface GridRowProps {
  label: string;
  value: string;
}

/** Single label/value row aligned for status dashboards. */
export function GridRow({ label, value }: GridRowProps) {
  return (
    <Box flexDirection="row" justifyContent="space-between" width="100%">
      <Text dimColor>{label}</Text>
      <Text>{value}</Text>
    </Box>
  );
}

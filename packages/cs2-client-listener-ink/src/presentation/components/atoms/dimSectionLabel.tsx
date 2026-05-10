import type { ReactNode } from "react";
import { Box, Text } from "ink";

export interface DimSectionLabelProps {
  marginTop?: number;
  children: ReactNode;
}

/** Muted subsection title inside a panel (e.g. grouping related rows). */
export function DimSectionLabel({ marginTop = 1, children }: DimSectionLabelProps) {
  return (
    <Box marginTop={marginTop}>
      <Text dimColor>{children}</Text>
    </Box>
  );
}

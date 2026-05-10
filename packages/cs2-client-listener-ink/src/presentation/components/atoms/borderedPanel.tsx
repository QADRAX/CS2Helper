import type { ReactNode } from "react";
import { Box } from "ink";
import { InkHeading } from "./inkHeading";

export interface BorderedPanelProps {
  /** Optional section title rendered with the `panel` heading style. */
  title?: string;
  marginTop?: number;
  children: ReactNode;
}

/** Framed column panel (single border, gray) for CLI status blocks. */
export function BorderedPanel({ title, marginTop = 1, children }: BorderedPanelProps) {
  return (
    <Box
      marginTop={marginTop}
      borderStyle="single"
      borderColor="gray"
      paddingX={1}
      paddingY={1}
      flexDirection="column"
    >
      {title ? <InkHeading variant="panel">{title}</InkHeading> : null}
      {children}
    </Box>
  );
}

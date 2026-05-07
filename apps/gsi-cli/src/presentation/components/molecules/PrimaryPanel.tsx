import type { ReactNode } from "react";
import { Box } from "ink";
import { ErrorMessageLine } from "../atoms/ErrorMessageLine";

interface PrimaryPanelProps {
  children: ReactNode;
  errorMessage?: string;
}

export function PrimaryPanel({ children, errorMessage }: PrimaryPanelProps) {
  return (
    <Box flexDirection="column" width="100%">
      {children}
      {errorMessage ? (
        <Box paddingX={1}>
          <ErrorMessageLine message={errorMessage} />
        </Box>
      ) : null}
    </Box>
  );
}

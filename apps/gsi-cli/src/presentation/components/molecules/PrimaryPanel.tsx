import type { ReactNode } from "react";
import { Box } from "ink";
import { ErrorMessageLine } from "../atoms/ErrorMessageLine";

interface PrimaryPanelProps {
  children: ReactNode;
  errorMessage?: string;
}

export function PrimaryPanel({ children, errorMessage }: PrimaryPanelProps) {
  return (
    <Box marginTop={1} borderStyle="single" paddingX={1} flexDirection="column" width="100%">
      {children}
      {errorMessage ? <ErrorMessageLine message={errorMessage} /> : null}
    </Box>
  );
}

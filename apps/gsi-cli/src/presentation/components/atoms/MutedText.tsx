import { Text } from "ink";
import type { ReactNode } from "react";

interface MutedTextProps {
  children: ReactNode;
  italic?: boolean;
}

export function MutedText({ children, italic }: MutedTextProps) {
  return (
    <Text color="gray" dimColor italic={italic}>
      {children}
    </Text>
  );
}

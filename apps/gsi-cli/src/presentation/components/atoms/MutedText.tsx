import { Text } from "ink";
import type { ReactNode } from "react";

type TextWrap = NonNullable<React.ComponentProps<typeof Text>["wrap"]>;

interface MutedTextProps {
  children: ReactNode;
  italic?: boolean;
  wrap?: TextWrap;
}

export function MutedText({ children, italic, wrap }: MutedTextProps) {
  return (
    <Text color="gray" dimColor italic={italic} wrap={wrap}>
      {children}
    </Text>
  );
}

import type { ReactNode } from "react";
import { Text } from "ink";

export type InkHeadingVariant = "page" | "panel";

export interface InkHeadingProps {
  variant: InkHeadingVariant;
  children: ReactNode;
}

/** Bold heading for full-width status pages (`page`) or framed panels (`panel`). */
export function InkHeading({ variant, children }: InkHeadingProps) {
  if (variant === "page") {
    return (
      <Text bold color="cyan">
        {children}
      </Text>
    );
  }
  return (
    <Text bold color="gray">
      {children}
    </Text>
  );
}

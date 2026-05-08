import { Text } from "ink";
import { useEffect, useState } from "react";

const DEFAULT_FRAMES = ["|", "/", "-", "\\"] as const;

/** Props for an Ink spinner that renders only while active. */
export interface WaitingSpinnerProps {
  active: boolean;
  format: (frame: string) => string;
  color?: string;
  intervalMs?: number;
  frames?: readonly string[];
}

/** Renders a small animated waiting line for terminal UIs. */
export function WaitingSpinner({
  active,
  format,
  color = "yellow",
  intervalMs = 120,
  frames = DEFAULT_FRAMES,
}: WaitingSpinnerProps) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!active) return;
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % frames.length);
    }, intervalMs);
    return () => clearInterval(timer);
  }, [active, intervalMs, frames]);

  if (!active) return null;

  const frame = frames[index] ?? frames[0] ?? "|";
  return <Text color={color}>{format(frame)}</Text>;
}

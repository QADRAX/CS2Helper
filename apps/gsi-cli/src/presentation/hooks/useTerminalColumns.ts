import { useEffect, useState } from "react";

const MIN_COLUMNS = 40;
const FALLBACK_COLUMNS = 80;

const readColumns = (): number => {
  const c = process.stdout.columns;
  if (typeof c === "number" && Number.isFinite(c) && c >= MIN_COLUMNS) {
    return c;
  }
  return FALLBACK_COLUMNS;
};

/**
 * Tracks the host TTY width so Ink layouts can match the real terminal and
 * avoid border / wrap glitches from `width="100%"` resolving incorrectly.
 */
export function useTerminalColumns(): number {
  const [columns, setColumns] = useState(readColumns);

  useEffect(() => {
    const onResize = (): void => {
      setColumns(readColumns());
    };
    process.stdout.on("resize", onResize);
    return () => {
      process.stdout.off("resize", onResize);
    };
  }, []);

  return columns;
}

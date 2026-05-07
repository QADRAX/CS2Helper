import { Text } from "ink";

/** Línea horizontal entre los bordes verticales de la caja del shell (sin incluir los `│`). */
export function CliSectionDivider() {
  const cols =
    typeof process.stdout !== "undefined" && process.stdout.columns && process.stdout.columns > 4
      ? process.stdout.columns
      : 78;
  const betweenBorders = Math.max(8, cols - 2);
  return <Text dimColor>{"\u2500".repeat(betweenBorders)}</Text>;
}

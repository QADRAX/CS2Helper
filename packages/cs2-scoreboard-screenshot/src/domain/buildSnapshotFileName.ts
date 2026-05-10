/**
 * Stable PNG filename from epoch milliseconds (ISO-like, filesystem-safe).
 */
export function buildSnapshotFileName(nowMs: number): string {
  const iso = new Date(nowMs).toISOString().replace(/[:.]/g, "-");
  return `scoreboard-${iso}.png`;
}

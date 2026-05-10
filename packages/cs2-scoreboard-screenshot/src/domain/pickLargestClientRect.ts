export interface ClientRectEntry {
  hwnd: bigint;
  width: number;
  height: number;
}

/** Picks the CS2 window candidate with the largest client-area (pixels). */
export function pickLargestClientRectByArea(
  entries: readonly ClientRectEntry[]
): ClientRectEntry | null {
  let best: ClientRectEntry | null = null;
  let bestArea = 0;

  for (const e of entries) {
    const area = e.width * e.height;
    if (area > bestArea && e.width > 0 && e.height > 0) {
      bestArea = area;
      best = e;
    }
  }

  return best;
}

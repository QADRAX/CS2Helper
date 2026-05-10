import type { TickSourcePort } from "../application/ports/TickSourcePort";
import type { TickSourcesPort } from "../application/ports/TickSourcesPort";

/** Accepts a fixed list or a dynamic registry. */
export function toTickSourcesPort(sources: readonly TickSourcePort[] | TickSourcesPort): TickSourcesPort {
  if (typeof (sources as TickSourcesPort).getSources === "function") {
    return sources as TickSourcesPort;
  }
  const list = sources as readonly TickSourcePort[];
  return { getSources: () => list };
}

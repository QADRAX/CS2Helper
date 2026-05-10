import type { TickSourcePort } from "./TickSourcePort";

/** Registry of sources merged into each {@link TickFrame.sources}. */
export interface TickSourcesPort {
  getSources(): readonly TickSourcePort[];
}

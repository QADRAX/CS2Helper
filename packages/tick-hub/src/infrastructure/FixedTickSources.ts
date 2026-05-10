import type { TickSourcePort } from "../application/ports/TickSourcePort";
import type { TickSourcesPort } from "../application/ports/TickSourcesPort";

/** Wraps a fixed list of sources as a {@link TickSourcesPort}. */
export class FixedTickSources implements TickSourcesPort {
  constructor(private readonly sources: readonly TickSourcePort[]) {}

  getSources(): readonly TickSourcePort[] {
    return this.sources;
  }
}

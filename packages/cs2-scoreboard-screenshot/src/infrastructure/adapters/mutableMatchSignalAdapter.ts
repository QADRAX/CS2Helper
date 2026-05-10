import type { MatchSignal } from "../../domain/matchSignal";
import type { MatchSignalPort } from "../../application/ports/matchSignalPort";

/**
 * Host or tests can update the backing signal as GSI state changes.
 */
export class MutableMatchSignalAdapter implements MatchSignalPort {
  constructor(private current: MatchSignal) {}

  getMatchSignal(): MatchSignal {
    return this.current;
  }

  setMatchSignal(next: MatchSignal): void {
    this.current = next;
  }
}

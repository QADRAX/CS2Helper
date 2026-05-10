import type { MatchSignal } from "../../domain/matchSignal";

export interface MatchSignalPort {
  getMatchSignal(): MatchSignal;
}

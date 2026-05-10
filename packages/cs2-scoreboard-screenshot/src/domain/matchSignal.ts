/**
 * Minimal match snapshot supplied by the host (typically from GSI processor state).
 */
export interface MatchSignal {
  /** Mirrors `GsiProcessorState.currentMatch != null`. */
  hasActiveMatch: boolean;
  /** Optional `NormalizedSnapshot.map.phase` string when available. */
  mapPhase?: string;
}

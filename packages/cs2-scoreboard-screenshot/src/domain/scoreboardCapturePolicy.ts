/**
 * How strictly {@link canCaptureScoreboardSnapshot} treats GSI map phase.
 *
 * - `currentMatchOnly`: allow whenever the host reports an active match aggregate
 *   (`currentMatch != null` in GSI processor terms).
 * - `requireLivePhase`: additionally require `mapPhase === "live"` on the signal.
 */
export type MatchPhaseGate = "currentMatchOnly" | "requireLivePhase";

export interface ScoreboardCapturePolicy {
  matchPhaseGate: MatchPhaseGate;
}

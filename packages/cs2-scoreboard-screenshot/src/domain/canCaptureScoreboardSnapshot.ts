import type { ScoreboardCapturePolicy } from "./scoreboardCapturePolicy";
import type { MatchSignal } from "./matchSignal";

export type CaptureGateFailureReason =
  | "no_active_match"
  | "map_phase_not_live"
  | "cs2_not_foreground";

export interface CaptureAllowed {
  ok: true;
}

export interface CaptureDenied {
  ok: false;
  reason: CaptureGateFailureReason;
}

export type CaptureGateResult = CaptureAllowed | CaptureDenied;

/**
 * Pure gate: host-reported GSI match signal plus foreground check.
 */
export function canCaptureScoreboardSnapshot(
  policy: ScoreboardCapturePolicy,
  match: MatchSignal,
  isCs2Foreground: boolean
): CaptureGateResult {
  if (!isCs2Foreground) {
    return { ok: false, reason: "cs2_not_foreground" };
  }

  if (!match.hasActiveMatch) {
    return { ok: false, reason: "no_active_match" };
  }

  if (policy.matchPhaseGate === "requireLivePhase" && match.mapPhase !== "live") {
    return { ok: false, reason: "map_phase_not_live" };
  }

  return { ok: true };
}

import { describe, expect, it } from "vitest";

import { canCaptureScoreboardSnapshot } from "../canCaptureScoreboardSnapshot";

describe("canCaptureScoreboardSnapshot", () => {
  it("allows capture only when foreground and active match (currentMatchOnly)", () => {
    expect(
      canCaptureScoreboardSnapshot(
        { matchPhaseGate: "currentMatchOnly" },
        { hasActiveMatch: true, mapPhase: "warmup" },
        true
      ).ok
    ).toBe(true);

    expect(
      canCaptureScoreboardSnapshot(
        { matchPhaseGate: "currentMatchOnly" },
        { hasActiveMatch: false },
        true
      )
    ).toEqual({ ok: false, reason: "no_active_match" });

    expect(
      canCaptureScoreboardSnapshot(
        { matchPhaseGate: "currentMatchOnly" },
        { hasActiveMatch: true },
        false
      )
    ).toEqual({ ok: false, reason: "cs2_not_foreground" });
  });

  it("requireLivePhase rejects non-live map phases", () => {
    expect(
      canCaptureScoreboardSnapshot(
        { matchPhaseGate: "requireLivePhase" },
        { hasActiveMatch: true, mapPhase: "warmup" },
        true
      )
    ).toEqual({ ok: false, reason: "map_phase_not_live" });

    expect(
      canCaptureScoreboardSnapshot(
        { matchPhaseGate: "requireLivePhase" },
        { hasActiveMatch: true, mapPhase: "live" },
        true
      ).ok
    ).toBe(true);
  });
});

import { describe, expect, it } from "vitest";
import type { NormalizedSnapshot } from "../csgo";
import { minimalNormalizedSnapshot } from "../../__test__/fixtures/normalizedSnapshot";
import { evaluateSnapshotQuality } from "../stream/snapshotQuality";

function baseSnapshot(overrides: Partial<NormalizedSnapshot> = {}): NormalizedSnapshot {
  return minimalNormalizedSnapshot(
    { mapPhase: "live", roundPhase: "live", round: 1 },
    overrides
  );
}

describe("evaluateSnapshotQuality", () => {
  it("returns partial when map is missing", () => {
    const snap = baseSnapshot({ map: null });
    expect(evaluateSnapshotQuality(snap, null)).toBe("partial");
  });

  it("returns partial when round is missing", () => {
    const snap = baseSnapshot({ round: null });
    expect(evaluateSnapshotQuality(snap, null)).toBe("partial");
  });

  it("returns partial when there are no players", () => {
    const snap = baseSnapshot({ players: [] });
    expect(evaluateSnapshotQuality(snap, null)).toBe("partial");
  });

  it("returns complete when map, round and at least one player exist", () => {
    expect(evaluateSnapshotQuality(baseSnapshot(), 0)).toBe("complete");
  });
});

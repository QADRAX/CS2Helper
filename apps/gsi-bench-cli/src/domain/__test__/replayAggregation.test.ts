import { describe, expect, it } from "vitest";
import type { ReplayStateSummary, ReplayStep } from "../replayTypes";
import { buildReplayTimelineMetadata, REPLAY_TICK_TIMESTAMP_MS } from "../replayAggregation";

const stubSummary = (): ReplayStateSummary => ({
  totalTicks: 0,
  streamState: "cold_start",
  watcherMode: null,
  mapRound: null,
  roundPhase: null,
  playersCount: 0,
});

describe("buildReplayTimelineMetadata", () => {
  it("uses elapsed time from the first tick (wall-clock safe)", () => {
    const epochBase = 1_746_000_000_000;
    const steps: ReplayStep[] = [
      {
        tickIndex: 0,
        lineNumber: 1,
        timestamp: epochBase,
        before: stubSummary(),
        after: stubSummary(),
        events: [],
      },
      {
        tickIndex: 1,
        lineNumber: 2,
        timestamp: epochBase + REPLAY_TICK_TIMESTAMP_MS,
        before: stubSummary(),
        after: stubSummary(),
        events: [],
      },
    ];

    const meta = buildReplayTimelineMetadata(steps);
    expect(meta.durationSeconds).toBe(1);
    expect(meta.tickIndexBySecond).toEqual([0, 1]);
  });
});

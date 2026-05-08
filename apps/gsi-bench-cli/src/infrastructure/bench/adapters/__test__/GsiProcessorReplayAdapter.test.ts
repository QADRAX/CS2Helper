import { describe, expect, it } from "vitest";
import type { GsiRecordFile, ReadRecordFramesResult } from "../../../../domain/bench";
import { GsiProcessorReplayAdapter } from "../GsiProcessorReplayAdapter";

describe("GsiProcessorReplayAdapter", () => {
  it("replays frames and records before/after state per tick", async () => {
    const adapter = new GsiProcessorReplayAdapter();
    const result = await adapter.replay(createRecord(), createFramesResult());

    expect(result.processedTicks).toBe(2);
    expect(result.finalState.totalTicks).toBe(2);
    expect(result.steps).toHaveLength(2);
    expect(result.steps[0]?.before.totalTicks).toBe(0);
    expect(result.steps[0]?.after.totalTicks).toBe(1);
    expect(result.steps[1]?.before.totalTicks).toBe(1);
    expect(result.steps[1]?.after.totalTicks).toBe(2);
    expect(result.stateByTick).toHaveLength(2);
    expect(result.timeline.durationSeconds).toBe(1);
    expect(result.timeline.tickIndexBySecond).toEqual([0, 1]);
    expect(result.coldStartStateBySecond[0]?.totalTicks).toBe(1);
  });
});

function createRecord(): GsiRecordFile {
  return {
    id: "record.ndjson",
    name: "record.ndjson",
    path: "record.ndjson",
    sizeBytes: 0,
    modifiedAt: 0,
  };
}

function createFramesResult(): ReadRecordFramesResult {
  return {
    frames: [
      { lineNumber: 1, raw: "null", tick: null },
      { lineNumber: 2, raw: "null", tick: null },
    ],
    errors: [],
  };
}

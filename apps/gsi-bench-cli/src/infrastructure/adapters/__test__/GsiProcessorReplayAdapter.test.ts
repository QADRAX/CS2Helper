import { describe, expect, it } from "vitest";
import type { GsiProcessorState } from "@cs2helper/gsi-processor";
import { TICK_HUB_SCHEMA_VERSION, type TickFrame } from "@cs2helper/tick-hub";
import type { GsiRecordFile, GsiRecordFrame, ReadRecordFramesResult } from "../../../domain";
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
    expect(result.tickFrames).toHaveLength(2);
  });
});

function createRecord(): GsiRecordFile {
  return {
    id: "record.jsonl",
    name: "record.jsonl",
    path: "record.jsonl",
    sizeBytes: 0,
    modifiedAt: 0,
  };
}

function makeFrame(line: number, seq: number, receivedAtMs: number): GsiRecordFrame {
  const state = {
    totalTicks: 0,
    streamState: "cold_start",
    watcherMode: null,
    lastSnapshot: null,
    playersBySteamId: {},
    lastProcessedAt: null,
  } as GsiProcessorState;
  const tick: TickFrame = {
    schemaVersion: TICK_HUB_SCHEMA_VERSION,
    sequence: seq,
    receivedAtMs,
    master: { state, raw: "null" },
    sources: {},
  };
  return { lineNumber: line, raw: JSON.stringify(tick), tick };
}

function createFramesResult(): ReadRecordFramesResult {
  return {
    frames: [makeFrame(1, 1, 0), makeFrame(2, 2, 1_000)],
    errors: [],
  };
}

import { describe, expect, it } from "vitest";
import {
  advancePlayback,
  createPlaybackSession,
  seekPlaybackToSecond,
  setPlaybackSpeed,
  togglePlayback,
  toggleSeekMode,
} from "../playbackSession";
import type { ReplayResult } from "../../../../domain/bench";

describe("playbackSession", () => {
  it("advances with speed and pauses at end", () => {
    const replay = createReplayResult();
    let session = createPlaybackSession({}, replay);
    session = togglePlayback({}, session);
    session = setPlaybackSpeed({}, session, 2);
    session = advancePlayback({}, session, 2_000);

    expect(session.currentSecond).toBe(4);
    expect(session.currentTickIndex).toBe(4);
    expect(session.isPlaying).toBe(false);
  });

  it("supports seek with rebuild and coldStart modes", () => {
    const replay = createReplayResult();
    let session = createPlaybackSession({}, replay);
    session = seekPlaybackToSecond({}, session, 2, "rebuild");
    expect(session.currentTickIndex).toBe(2);
    expect(session.state.totalTicks).toBe(3);

    session = seekPlaybackToSecond({}, session, 3, "coldStart");
    expect(session.seekMode).toBe("coldStart");
    expect(session.state.totalTicks).toBe(1);
  });

  it("toggles seek mode", () => {
    const replay = createReplayResult();
    const toggled = toggleSeekMode({}, createPlaybackSession({}, replay));
    expect(toggled.seekMode).toBe("coldStart");
  });
});

function createReplayResult(): ReplayResult {
  const stateByTick = Array.from({ length: 5 }).map((_, idx) => ({
    totalTicks: idx + 1,
    streamState: "active",
    watcherMode: null,
    lastSnapshot: null,
    playersBySteamId: {},
    lastProcessedAt: idx * 1_000,
  }));

  return {
    record: {
      id: "id",
      name: "record.ndjson",
      path: "record.ndjson",
      sizeBytes: 1,
      modifiedAt: 0,
    },
    processedTicks: 5,
    parseErrors: [],
    steps: stateByTick.map((state, idx) => ({
      tickIndex: idx,
      lineNumber: idx + 1,
      timestamp: idx * 1_000,
      before: {
        totalTicks: idx,
        streamState: "active",
        watcherMode: null,
        mapRound: null,
        roundPhase: null,
        playersCount: 0,
      },
      after: {
        totalTicks: state.totalTicks,
        streamState: "active",
        watcherMode: null,
        mapRound: null,
        roundPhase: null,
        playersCount: 0,
      },
      events: [],
    })),
    events: [],
    initialState: {
      totalTicks: 0,
      streamState: "inactive",
      watcherMode: null,
      lastSnapshot: null,
      playersBySteamId: {},
      lastProcessedAt: null,
    },
    stateByTick,
    coldStartStateBySecond: {
      0: stateByTick[0]!,
      1: stateByTick[0]!,
      2: stateByTick[0]!,
      3: stateByTick[0]!,
      4: stateByTick[0]!,
    },
    timeline: {
      durationSeconds: 4,
      tickIndexBySecond: [0, 1, 2, 3, 4],
    },
    finalState: stateByTick[4]!,
  } as ReplayResult;
}

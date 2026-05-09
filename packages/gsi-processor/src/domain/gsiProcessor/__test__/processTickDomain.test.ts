import { afterEach, describe, expect, it, vi } from "vitest";
import {
  createInitialGsiProcessorMemory,
  createInitialGsiProcessorState,
} from "../initialState";
import { processTickDomain } from "../processTick";
import * as snapshotQuality from "../stream/snapshotQuality";
import { minimalClientTick } from "../../../__test__/fixtures/minimalWatcherTick";

describe("processTickDomain", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("on null payload while healthy, enters gap and emits gap_started", () => {
    const state = createInitialGsiProcessorState();
    state.streamState = "healthy";
    state.localClientSteamId = "x";
    state.focusedPlayerSteamId = "y";
    state.isSpectatingOtherPlayer = true;
    const memory = createInitialGsiProcessorMemory();
    const result = processTickDomain(state, memory, null, 5000);
    expect(result.state.streamState).toBe("gap");
    expect(result.state.streamWatermarks.requiresResync).toBe(true);
    expect(result.events.some((e) => e.type === "gap_started")).toBe(true);
    expect(result.state.localClientSteamId).toBeNull();
    expect(result.state.focusedPlayerSteamId).toBeNull();
    expect(result.state.isSpectatingOtherPlayer).toBe(false);
  });

  it("on null payload while cold_start, does not emit gap_started", () => {
    const state = createInitialGsiProcessorState();
    const memory = createInitialGsiProcessorMemory();
    const result = processTickDomain(state, memory, null, 1000);
    expect(result.events.some((e) => e.type === "gap_started")).toBe(false);
  });

  it("first complete tick leaves cold_start, recovers stream and can start match on warmup", () => {
    const state = createInitialGsiProcessorState();
    const memory = createInitialGsiProcessorMemory();
    const tick = minimalClientTick();
    const result = processTickDomain(state, memory, tick, 2000);
    expect(result.state.streamState).toBe("healthy");
    expect(result.events.some((e) => e.type === "stream_cold_started")).toBe(true);
    expect(result.events.some((e) => e.type === "stream_recovered")).toBe(true);
    expect(result.events.some((e) => e.type === "match_started")).toBe(true);
    expect(result.state.currentMatch).not.toBeNull();
    expect(result.state.streamWatermarks.lastReliableTimestamp).toBe(2000);
    expect(result.state.localClientSteamId).toBe("self-steamid");
    expect(result.state.focusedPlayerSteamId).toBe("self-steamid");
    expect(result.state.isSpectatingOtherPlayer).toBe(false);
  });

  it("partial snapshot does not advance reliable watermarks", () => {
    const state = createInitialGsiProcessorState();
    state.streamState = "healthy";
    state.streamWatermarks.lastReliableTimestamp = 999;
    const memory = createInitialGsiProcessorMemory();
    const tick = minimalClientTick({ map: undefined, round: undefined });
    const result = processTickDomain(state, memory, tick, 3000);
    expect(result.state.streamWatermarks.lastReliableTimestamp).toBe(999);
  });

  it("emits snapshot_rejected when quality evaluates to invalid", () => {
    vi.spyOn(snapshotQuality, "evaluateSnapshotQuality").mockReturnValue("invalid");
    const state = createInitialGsiProcessorState();
    state.streamState = "healthy";
    const memory = createInitialGsiProcessorMemory();
    const result = processTickDomain(state, memory, minimalClientTick(), 6000);
    expect(result.events.some((e) => e.type === "snapshot_rejected")).toBe(true);
    expect(result.state.streamMetrics.rejectedSnapshots).toBe(1);
  });

  it("updates rolling memory map and round fields after a complete tick", () => {
    const state = createInitialGsiProcessorState();
    const memory = createInitialGsiProcessorMemory();
    const tick = minimalClientTick({
      map: { ...minimalClientTick().map!, phase: "live", round: 3 },
      round: { phase: "live", win_team: "CT" },
    });
    const result = processTickDomain(state, memory, tick, 4000);
    expect(result.memory.lastMapPhase).toBe("live");
    expect(result.memory.lastGameRound).toBe(3);
    expect(result.memory.lastRoundPhase).toBe("live");
    expect(result.memory.lastRoundWinningTeam).toBe("CT");
  });
});

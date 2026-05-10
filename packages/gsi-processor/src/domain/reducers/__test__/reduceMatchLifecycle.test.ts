import { describe, expect, it } from "vitest";
import type { NormalizedSnapshot } from "../../csgo";
import { minimalClientTick } from "../../../__test__/fixtures/minimalWatcherTick";
import { createInitialGsiProcessorMemory, createInitialGsiProcessorState } from "../../initialState";
import { normalizeWatcherPayload } from "../../normalizeWatcherPayload";
import { reduceMatchLifecycle } from "../reduceMatchLifecycle";
import type { ReducerContext } from "../reducerTypes";

function ctxWithSnapshot(snapshot: NormalizedSnapshot): ReducerContext {
  return {
    state: createInitialGsiProcessorState(),
    memory: createInitialGsiProcessorMemory(),
    snapshot,
    timestamp: 1000,
    events: [],
    criticalReducersEnabled: true,
  };
}

function snapshotFromTick(tick: ReturnType<typeof minimalClientTick>): NormalizedSnapshot {
  return normalizeWatcherPayload(tick);
}

describe("reduceMatchLifecycle", () => {
  it("returns early when map is missing", () => {
    const tick = minimalClientTick({ map: undefined, round: undefined });
    const ctx = ctxWithSnapshot(normalizeWatcherPayload(tick));
    reduceMatchLifecycle(ctx);
    expect(ctx.state.currentMatch).toBeNull();
    expect(ctx.events.length).toBe(0);
  });

  it("emits match_started on warmup edge when no current match", () => {
    const tick = minimalClientTick();
    const ctx = ctxWithSnapshot(snapshotFromTick(tick));
    ctx.memory.lastMapPhase = undefined;
    reduceMatchLifecycle(ctx);
    expect(ctx.state.currentMatch).not.toBeNull();
    expect(ctx.events.some((e) => e.type === "match_started")).toBe(true);
  });

  it("opens currentMatch on first live tick to support mid-match attach", () => {
    const tick = minimalClientTick({
      map: { ...minimalClientTick().map!, phase: "live", round: 11 },
      round: { phase: "live" },
    });
    const ctx = ctxWithSnapshot(snapshotFromTick(tick));

    reduceMatchLifecycle(ctx);

    expect(ctx.state.currentMatch).not.toBeNull();
    expect(ctx.state.currentMatch?.mapName).toBe("de_inferno");
    expect(ctx.events.some((e) => e.type === "match_started")).toBe(true);
  });

  it("emits match_ended and clears match on gameover transition", () => {
    const tick = minimalClientTick({
      map: { ...minimalClientTick().map!, phase: "gameover" },
    });
    const ctx = ctxWithSnapshot(snapshotFromTick(tick));
    ctx.state.currentMatch = {
      mapName: "de_inferno",
      mode: "competitive",
      timestamp: 1,
      rounds: [],
    };
    ctx.memory.lastMapPhase = "live";
    reduceMatchLifecycle(ctx);
    expect(ctx.state.currentMatch).toBeNull();
    expect(ctx.events.some((e) => e.type === "match_ended")).toBe(true);
  });
});

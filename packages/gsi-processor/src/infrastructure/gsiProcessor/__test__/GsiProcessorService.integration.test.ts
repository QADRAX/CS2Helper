import { describe, expect, it } from "vitest";
import type { WatcherMode } from "../../../domain/csgo";
import type { GsiProcessorEvent } from "../../../domain/gsiProcessor";
import {
  bumpPrimaryPlayerKills,
  midMatchAttachTick,
} from "../../../__test__/fixtures/midMatchTicks";
import { GsiProcessorService } from "../GsiProcessorService";
import {
  createBaseTick,
  withDisconnectGap,
  withPlayerDelta,
  withRoundPhase,
} from "./factories/gsiPollingFactory";
import { replayPollingFrames } from "./factories/pollingReplayDriver";

describe("GsiProcessorService integration", () => {
  it("isolates state per engine instance", () => {
    const engineA = new GsiProcessorService({ getTimestamp: () => 1000 });
    const engineB = new GsiProcessorService({ getTimestamp: () => 1000 });
    engineA.processTick(createBaseTick(), 1000);
    expect(engineA.getState().currentMatch).not.toBeNull();
    expect(engineB.getState().currentMatch).toBeNull();
  });

  it("tracks aggregation and state updates", () => {
    const engine = new GsiProcessorService({ getTimestamp: () => 1000 });
    const events: GsiProcessorEvent[] = [];
    let stateUpdates = 0;
    engine.subscribeEvents((event) => events.push(event));
    engine.subscribeState(() => {
      stateUpdates += 1;
    });

    const tick1 = withRoundPhase(createBaseTick(), {
      mapPhase: "warmup",
      roundPhase: "freezetime",
      round: 1,
    });
    const tick2 = withPlayerDelta(
      withRoundPhase(createBaseTick(), {
        mapPhase: "live",
        roundPhase: "live",
        round: 1,
      }),
      { kills: 1 }
    );
    const tick3 = withPlayerDelta(
      withRoundPhase(createBaseTick(), {
        mapPhase: "live",
        roundPhase: "over",
        round: 1,
        winnerTeam: "CT",
      }),
      { health: 70 }
    );

    replayPollingFrames(engine, [
      { tick: tick1, timestamp: 1100 },
      { tick: tick2, timestamp: 1200 },
      { tick: tick3, timestamp: 1300 },
    ]);

    const state = engine.getState();
    expect(state.currentMatch).not.toBeNull();
    expect(state.currentMatch?.rounds.length).toBeGreaterThanOrEqual(1);
    expect(state.totalTicks).toBe(3);
    expect(stateUpdates).toBeGreaterThanOrEqual(3);
    expect(events.some((event) => event.type === "match_started")).toBe(true);
    expect(events.some((event) => event.type === "round_started")).toBe(true);
  });

  it("cold start mid-match does not emit retroactive critical events", () => {
    const engine = new GsiProcessorService({ getTimestamp: () => 3000 });
    const events: GsiProcessorEvent[] = [];
    engine.subscribeEvents((event) => events.push(event));

    const tick = withPlayerDelta(
      withRoundPhase(createBaseTick(), {
        mapPhase: "live",
        roundPhase: "live",
        round: 12,
      }),
      { kills: 5, deaths: 4 }
    );
    engine.processTick(tick, 3000);

    expect(engine.getState().totalTicks).toBe(1);
    expect(events.some((event) => event.type === "kill" || event.type === "death")).toBe(
      false
    );
  });

  it("transitions healthy -> gap -> recovering -> healthy", () => {
    const engine = new GsiProcessorService({ getTimestamp: () => 2000 });
    const events: GsiProcessorEvent[] = [];
    engine.subscribeEvents((event) => events.push(event));

    const base = withRoundPhase(createBaseTick(), {
      mapPhase: "live",
      roundPhase: "live",
      round: 1,
    });
    const recovery1 = withRoundPhase(createBaseTick(), {
      mapPhase: "live",
      roundPhase: "live",
      round: 1,
    });
    const recovery2 = withRoundPhase(createBaseTick(), {
      mapPhase: "live",
      roundPhase: "live",
      round: 1,
    });

    replayPollingFrames(engine, [
      { tick: base, timestamp: 2000 },
      { tick: withDisconnectGap(), timestamp: 2100 },
      { tick: recovery1, timestamp: 2200 },
      { tick: recovery2, timestamp: 2300 },
    ]);

    const state = engine.getState();
    expect(state.streamState).toBe("healthy");
    expect(events.some((event) => event.type === "gap_started")).toBe(true);
    expect(events.some((event) => event.type === "stream_recovered")).toBe(true);
  });

  it("starts gap and requires resync on null tick", () => {
    const engine = new GsiProcessorService({ getTimestamp: () => 2500 });
    engine.processTick(
      withRoundPhase(createBaseTick(), {
        mapPhase: "live",
        roundPhase: "live",
        round: 3,
      }),
      2500
    );
    engine.processTick(withDisconnectGap(), 2600);
    const state = engine.getState();
    expect(state.streamState).toBe("gap");
    expect(state.streamWatermarks.requiresResync).toBe(true);
  });

  const watcherModes: WatcherMode[] = ["client_local", "spectator_hltv", "dedicated_server"];

  it.each(watcherModes)(
    "mid-match attach (%s): sets watcherMode, goes healthy, aggregates players, no retro kill/death",
    (mode) => {
      const engine = new GsiProcessorService({ getTimestamp: () => 8000 });
      const events: GsiProcessorEvent[] = [];
      engine.subscribeEvents((event) => events.push(event));

      engine.processTick(midMatchAttachTick(mode), 8000);

      const state = engine.getState();
      expect(state.watcherMode).toBe(mode);
      expect(state.streamState).toBe("healthy");
      expect(state.totalTicks).toBe(1);
      expect(events.some((e) => e.type === "kill" || e.type === "death")).toBe(false);

      const rosterSize = mode === "client_local" ? 1 : 2;
      expect(Object.keys(state.playersBySteamId)).toHaveLength(rosterSize);
    }
  );

  it.each(watcherModes)(
    "mid-match attach (%s): kill delta emits kill after first live attach creates currentMatch",
    (mode) => {
      const engine = new GsiProcessorService({ getTimestamp: () => 9000 });
      const events: GsiProcessorEvent[] = [];
      engine.subscribeEvents((event) => events.push(event));

      const attach = midMatchAttachTick(mode);
      engine.processTick(attach, 9000);
      engine.processTick(bumpPrimaryPlayerKills(attach, 1), 9100);

      expect(engine.getState().streamState).toBe("healthy");
      expect(engine.getState().currentMatch).not.toBeNull();
      expect(events.filter((e) => e.type === "kill").length).toBeGreaterThanOrEqual(1);
    }
  );

  it("gates critical reducers while stream is not healthy", () => {
    const engine = new GsiProcessorService({ getTimestamp: () => 3000 });
    const events: GsiProcessorEvent[] = [];
    engine.subscribeEvents((event) => events.push(event));

    const partialTick = createBaseTick();
    delete partialTick.round;
    engine.processTick(partialTick, 3000);

    const withDelta = withPlayerDelta(
      withRoundPhase(createBaseTick(), {
        mapPhase: "live",
        roundPhase: "live",
        round: 1,
      }),
      { kills: 2 }
    );
    engine.processTick(withDelta, 3100);

    expect(events.some((event) => event.type === "kill")).toBe(false);
  });
});

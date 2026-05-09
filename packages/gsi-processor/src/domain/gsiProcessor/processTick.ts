import { normalizeWatcherPayload } from "./normalizeWatcherPayload";
import type {
  GsiProcessorEvent,
  GsiProcessorMemory,
  GsiProcessorState,
  TickProcessingResult,
} from "./gsiProcessorTypes";
import { cloneState } from "./reducers/helpers";
import { reduceGlobalEvents } from "./reducers/reduceGlobalEvents";
import { reduceMatchLifecycle } from "./reducers/reduceMatchLifecycle";
import { reducePlayerEvents } from "./reducers/reducePlayerEvents";
import { reducePlayersState } from "./reducers/reducePlayersState";
import { reduceRoundLifecycle } from "./reducers/reduceRoundLifecycle";
import type { ReducerContext } from "./reducers/reducerTypes";
import type { WatcherPayload } from "../csgo";
import { evaluateSnapshotQuality } from "./stream/snapshotQuality";
import { transitionStreamState } from "./stream/streamStateMachine";

/**
 * Processes one watcher tick with strict stream-consistency rules.
 *
 * Pipeline:
 * - normalize raw payload
 * - classify snapshot quality
 * - transition stream state machine
 * - gate critical reducers when stream is not healthy
 * - update state/memory/watermarks and emit domain + operational events
 */
export function processTickDomain(
  state: GsiProcessorState,
  memory: GsiProcessorMemory,
  payload: WatcherPayload | null,
  timestamp: number
): TickProcessingResult {
  const nextState = cloneState(state);
  const nextMemory: GsiProcessorMemory = { ...memory, players: { ...memory.players } };
  const events: GsiProcessorEvent[] = [];

  nextState.totalTicks += 1;
  nextState.lastProcessedAt = timestamp;

  if (!payload) {
    nextState.lastGameState = null;
    nextState.localClientSteamId = null;
    nextState.focusedPlayerSteamId = null;
    nextState.isSpectatingOtherPlayer = false;
    if (nextState.streamState === "healthy") {
      nextState.streamState = "gap";
      nextState.streamMetrics.gapCount += 1;
      nextState.streamWatermarks.requiresResync = true;
      events.push({ type: "gap_started", timestamp });
    }
    return { state: nextState, memory: nextMemory, events };
  }

  const snapshot = normalizeWatcherPayload(payload);
  nextState.lastSnapshot = snapshot;
  nextState.watcherMode = snapshot.watcherMode;
  nextState.lastGameState = snapshot.source;
  const quality = evaluateSnapshotQuality(
    snapshot,
    nextState.streamWatermarks.lastReliableTimestamp
  );

  nextState.streamMetrics.consecutiveValidSnapshots =
    quality === "complete" ? nextState.streamMetrics.consecutiveValidSnapshots + 1 : 0;
  nextState.streamMetrics.consecutivePartialSnapshots =
    quality === "partial" ? nextState.streamMetrics.consecutivePartialSnapshots + 1 : 0;

  if (nextState.streamState === "cold_start" && quality === "complete") {
    events.push({ type: "stream_cold_started", timestamp });
  }

  const transition = transitionStreamState({
    current: nextState.streamState,
    quality,
    recoveryWindow: 1,
    consecutiveValidSnapshots: nextState.streamMetrics.consecutiveValidSnapshots,
    consecutivePartialSnapshots: nextState.streamMetrics.consecutivePartialSnapshots,
  });
  nextState.streamState = transition.next;
  if (transition.startedGap) {
    nextState.streamMetrics.gapCount += 1;
    nextState.streamWatermarks.requiresResync = true;
    events.push({ type: "gap_started", timestamp });
  }
  if (transition.endedGap) {
    events.push({ type: "gap_ended", timestamp });
  }
  if (transition.recovered) {
    nextState.streamWatermarks.requiresResync = false;
    events.push({ type: "stream_recovered", timestamp });
  }
  if (transition.rejected) {
    nextState.streamMetrics.rejectedSnapshots += 1;
    events.push({ type: "snapshot_rejected", timestamp, quality });
  }

  const context: ReducerContext = {
    state: nextState,
    memory: nextMemory,
    snapshot,
    timestamp,
    events,
    criticalReducersEnabled: nextState.streamState === "healthy",
  };

  reduceMatchLifecycle(context);
  reduceRoundLifecycle(context);
  reducePlayersState(context);
  reducePlayerEvents(context);
  reduceGlobalEvents(context);

  if (snapshot.map) {
    nextMemory.lastMapPhase = snapshot.map.phase;
    nextMemory.lastGameRound = snapshot.map.round;
  }
  if (snapshot.round) {
    nextMemory.lastRoundPhase = snapshot.round.phase;
    nextMemory.lastRoundWinningTeam = snapshot.round.win_team;
  }
  if (nextState.streamState === "healthy") {
    nextState.streamWatermarks.lastReliableTimestamp = timestamp;
    nextState.streamWatermarks.lastReliableRound = snapshot.map?.round ?? null;
  }

  return { state: nextState, memory: nextMemory, events };
}

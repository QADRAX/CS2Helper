import type { GsiProcessorState } from "@cs2helper/gsi-processor";
import type { ReplayStateSummary, ReplayStep, ReplayTimelineMetadata } from "./replayTypes";

/** Synthetic timestamp step between replay ticks (ms), aligned with playback UI. */
export const REPLAY_TICK_TIMESTAMP_MS = 1_000;

export function summarizeReplayState(state: Readonly<GsiProcessorState>): ReplayStateSummary {
  return {
    totalTicks: state.totalTicks,
    streamState: state.streamState,
    watcherMode: state.watcherMode,
    mapRound: state.lastSnapshot?.map?.round ?? null,
    roundPhase: state.lastSnapshot?.round?.phase ?? null,
    playersCount: Object.keys(state.playersBySteamId).length,
  };
}

export function cloneGsiProcessorState(state: Readonly<GsiProcessorState>): GsiProcessorState {
  return JSON.parse(JSON.stringify(state)) as GsiProcessorState;
}

export function buildReplayTimelineMetadata(
  steps: readonly ReplayStep[],
  timestampStepMs: number = REPLAY_TICK_TIMESTAMP_MS
): ReplayTimelineMetadata {
  if (steps.length === 0) {
    return { durationSeconds: 0, tickIndexBySecond: [-1] };
  }

  /** Tick hub uses wall-clock `Date.now()`; timeline length must be relative to the session start. */
  const t0 = steps[0]!.timestamp;
  const tLast = steps.at(-1)?.timestamp ?? t0;
  const durationSeconds = Math.max(Math.floor((tLast - t0) / timestampStepMs), 0);
  const tickIndexBySecond: number[] = [];
  let cursor = -1;

  for (let second = 0; second <= durationSeconds; second += 1) {
    while (
      cursor + 1 < steps.length &&
      Math.floor((steps[cursor + 1]!.timestamp - t0) / timestampStepMs) <= second
    ) {
      cursor += 1;
    }
    tickIndexBySecond.push(cursor);
  }

  return { durationSeconds, tickIndexBySecond };
}

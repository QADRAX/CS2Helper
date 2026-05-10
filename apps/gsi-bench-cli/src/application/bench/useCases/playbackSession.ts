import type { UseCase } from "@cs2helper/shared";
import type {
  ReplayPlaybackSession,
  ReplayResult,
  ReplaySeekMode,
  ReplaySpeed,
} from "../../../domain/bench";

const TICK_MS = 1_000;

export const createPlaybackSession: UseCase<
  [],
  [replay: ReplayResult],
  ReplayPlaybackSession
> = (_ports, replay) => {
  const currentTickIndex = -1;
  return {
    replay,
    isPlaying: false,
    speed: 1,
    seekMode: "rebuild",
    currentSecond: 0,
    currentTickIndex,
    elapsedMs: 0,
    state: replay.initialState,
  };
};

export const setPlaybackSpeed: UseCase<
  [],
  [session: ReplayPlaybackSession, speed: ReplaySpeed],
  ReplayPlaybackSession
> = (_ports, session, speed) => ({ ...session, speed });

export const togglePlayback: UseCase<
  [],
  [session: ReplayPlaybackSession],
  ReplayPlaybackSession
> = (_ports, session) => ({ ...session, isPlaying: !session.isPlaying });

export const toggleSeekMode: UseCase<
  [],
  [session: ReplayPlaybackSession],
  ReplayPlaybackSession
> = (_ports, session) => ({
  ...session,
  seekMode: session.seekMode === "rebuild" ? "coldStart" : "rebuild",
});

export const seekPlaybackToSecond: UseCase<
  [],
  [session: ReplayPlaybackSession, second: number, mode?: ReplaySeekMode],
  ReplayPlaybackSession
> = (_ports, session, second, mode = session.seekMode) => {
  const boundedSecond = clamp(second, 0, session.replay.timeline.durationSeconds);
  const currentTickIndex = getTickIndexBySecond(session.replay, boundedSecond);
  const state = resolveState(session.replay, boundedSecond, currentTickIndex, mode);
  return {
    ...session,
    seekMode: mode,
    currentSecond: boundedSecond,
    currentTickIndex,
    state,
    elapsedMs: boundedSecond * TICK_MS,
  };
};

export const advancePlayback: UseCase<
  [],
  [session: ReplayPlaybackSession, deltaMs: number],
  ReplayPlaybackSession
> = (_ports, session, deltaMs) => {
  if (!session.isPlaying) return session;

  const durationMs = session.replay.timeline.durationSeconds * TICK_MS;
  const nextElapsed = clamp(
    session.elapsedMs + Math.max(0, deltaMs) * session.speed,
    0,
    durationMs
  );
  const nextSecond = Math.floor(nextElapsed / TICK_MS);
  const currentTickIndex = getTickIndexBySecond(session.replay, nextSecond);
  const state = resolveState(session.replay, nextSecond, currentTickIndex, session.seekMode);
  const reachedEnd = nextElapsed >= durationMs;

  return {
    ...session,
    elapsedMs: nextElapsed,
    currentSecond: nextSecond,
    currentTickIndex,
    state,
    isPlaying: reachedEnd ? false : session.isPlaying,
  };
};

function resolveState(
  replay: ReplayResult,
  second: number,
  tickIndex: number,
  mode: ReplaySeekMode
) {
  if (mode === "coldStart") {
    return replay.coldStartStateBySecond[second] ?? replay.initialState;
  }
  if (tickIndex < 0) return replay.initialState;
  return replay.stateByTick[tickIndex] ?? replay.finalState;
}

function getTickIndexBySecond(replay: ReplayResult, second: number): number {
  return replay.timeline.tickIndexBySecond[second] ?? replay.steps.length - 1;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

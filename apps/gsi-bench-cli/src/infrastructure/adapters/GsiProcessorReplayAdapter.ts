import {
  GsiProcessorService,
  type GsiProcessorEvent,
  type GsiProcessorState,
} from "@cs2helper/gsi-processor";
import type { ProcessorReplayPort } from "../../application";
import type {
  GsiRecordFile,
  ReadRecordFramesResult,
  ReplayResult,
  ReplayTimelineMetadata,
  ReplayStateSummary,
  ReplayStep,
} from "../../domain";

const TIMESTAMP_STEP_MS = 1_000;

/** Processor adapter that replays parsed frames through a fresh GSI engine. */
export class GsiProcessorReplayAdapter implements ProcessorReplayPort {
  async replay(
    record: GsiRecordFile,
    framesResult: ReadRecordFramesResult
  ): Promise<ReplayResult> {
    const processor = new GsiProcessorService();
    const steps: ReplayStep[] = [];
    const events: GsiProcessorEvent[] = [];
    const stateByTick: GsiProcessorState[] = [];
    let currentFrameEvents: GsiProcessorEvent[] = [];
    const initialState = cloneState(processor.getState());

    const unsubscribe = processor.subscribeEvents((event) => {
      events.push(event);
      currentFrameEvents.push(event);
    });

    try {
      framesResult.frames.forEach((frame, tickIndex) => {
        const timestamp = tickIndex * TIMESTAMP_STEP_MS;
        currentFrameEvents = [];

        const before = summarizeState(processor.getState());
        processor.processTick(frame.tick, timestamp);
        const after = summarizeState(processor.getState());

        steps.push({
          tickIndex,
          lineNumber: frame.lineNumber,
          timestamp,
          before,
          after,
          events: [...currentFrameEvents],
        });
        stateByTick.push(cloneState(processor.getState()));
      });
    } finally {
      unsubscribe();
    }

    const timeline = buildTimelineMetadata(steps);
    const coldStartStateBySecond = buildColdStartStatesBySecond(framesResult, timeline.durationSeconds);

    return {
      record,
      processedTicks: framesResult.frames.length,
      parseErrors: framesResult.errors,
      steps,
      events,
      initialState,
      stateByTick,
      coldStartStateBySecond,
      timeline,
      finalState: cloneState(processor.getState()),
    };
  }
}

function buildTimelineMetadata(steps: readonly ReplayStep[]): ReplayTimelineMetadata {
  if (steps.length === 0) {
    return { durationSeconds: 0, tickIndexBySecond: [ -1 ] };
  }

  const durationSeconds = Math.max(Math.floor((steps.at(-1)?.timestamp ?? 0) / TIMESTAMP_STEP_MS), 0);
  const tickIndexBySecond: number[] = [];
  let cursor = -1;

  for (let second = 0; second <= durationSeconds; second += 1) {
    while ((cursor + 1) < steps.length && Math.floor(steps[cursor + 1]!.timestamp / TIMESTAMP_STEP_MS) <= second) {
      cursor += 1;
    }
    tickIndexBySecond.push(cursor);
  }

  return { durationSeconds, tickIndexBySecond };
}

function buildColdStartStatesBySecond(
  framesResult: ReadRecordFramesResult,
  durationSeconds: number
): Record<number, GsiProcessorState> {
  const map: Record<number, GsiProcessorState> = {};
  const frames = framesResult.frames;

  for (let second = 0; second <= durationSeconds; second += 1) {
    const frame = frames[second];
    if (!frame) continue;
    const processor = new GsiProcessorService();
    processor.processTick(frame.tick, second * TIMESTAMP_STEP_MS);
    map[second] = cloneState(processor.getState());
  }

  return map;
}

function summarizeState(state: Readonly<GsiProcessorState>): ReplayStateSummary {
  return {
    totalTicks: state.totalTicks,
    streamState: state.streamState,
    watcherMode: state.watcherMode,
    mapRound: state.lastSnapshot?.map?.round ?? null,
    roundPhase: state.lastSnapshot?.round?.phase ?? null,
    playersCount: Object.keys(state.playersBySteamId).length,
  };
}

function cloneState(state: Readonly<GsiProcessorState>): GsiProcessorState {
  return JSON.parse(JSON.stringify(state)) as GsiProcessorState;
}

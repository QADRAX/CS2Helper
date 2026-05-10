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
  ReplayStep,
} from "../../domain";
import {
  REPLAY_TICK_TIMESTAMP_MS,
  buildReplayTimelineMetadata,
  cloneGsiProcessorState,
  summarizeReplayState,
} from "../../domain/replayAggregation";

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
    const initialState = cloneGsiProcessorState(processor.getState());

    const unsubscribe = processor.subscribeEvents((event) => {
      events.push(event);
      currentFrameEvents.push(event);
    });

    try {
      framesResult.frames.forEach((frame, tickIndex) => {
        const timestamp = tickIndex * REPLAY_TICK_TIMESTAMP_MS;
        currentFrameEvents = [];

        const before = summarizeReplayState(processor.getState());
        processor.processTick(frame.tick, timestamp);
        const after = summarizeReplayState(processor.getState());

        steps.push({
          tickIndex,
          lineNumber: frame.lineNumber,
          timestamp,
          before,
          after,
          events: [...currentFrameEvents],
        });
        stateByTick.push(cloneGsiProcessorState(processor.getState()));
      });
    } finally {
      unsubscribe();
    }

    const timeline = buildReplayTimelineMetadata(steps);
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
      finalState: cloneGsiProcessorState(processor.getState()),
    };
  }
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
    processor.processTick(frame.tick, second * REPLAY_TICK_TIMESTAMP_MS);
    map[second] = cloneGsiProcessorState(processor.getState());
  }

  return map;
}

import {
  GsiProcessorService,
  type GsiProcessorEvent,
  type GsiProcessorState,
} from "@cs2helper/gsi-processor";
import { isCs2TickMasterData } from "@cs2helper/cs2-client-listener";
import type { ProcessorReplayPort } from "../../application";
import type {
  GsiRecordFile,
  ReadRecordFramesResult,
  ReplayResult,
  ReplayStep,
} from "../../domain";
import {
  buildReplayTimelineMetadata,
  cloneGsiProcessorState,
  summarizeReplayState,
} from "../../domain/replayAggregation";

/** Processor adapter that replays {@link TickFrame} records through a fresh GSI engine. */
export class GsiProcessorReplayAdapter implements ProcessorReplayPort {
  async replay(
    record: GsiRecordFile,
    framesResult: ReadRecordFramesResult
  ): Promise<ReplayResult> {
    const processor = new GsiProcessorService();
    const steps: ReplayStep[] = [];
    const events: GsiProcessorEvent[] = [];
    const stateByTick: GsiProcessorState[] = [];
    const tickFrames = framesResult.frames.map((f) => f.tick);
    let currentFrameEvents: GsiProcessorEvent[] = [];
    const initialState = cloneGsiProcessorState(processor.getState());

    const unsubscribe = processor.subscribeEvents((event) => {
      events.push(event);
      currentFrameEvents.push(event);
    });

    try {
      for (let tickIndex = 0; tickIndex < framesResult.frames.length; tickIndex += 1) {
        const frame = framesResult.frames[tickIndex]!;
        const tickFrame = frame.tick;
        currentFrameEvents = [];

        if (!isCs2TickMasterData(tickFrame.master)) {
          continue;
        }

        let gameState: ReturnType<JSON["parse"]>;
        try {
          gameState = JSON.parse(tickFrame.master.raw);
        } catch {
          continue;
        }

        const timestamp = tickFrame.receivedAtMs;
        const before = summarizeReplayState(processor.getState());
        processor.processTick(gameState, timestamp);
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
      }
    } finally {
      unsubscribe();
    }

    const timeline = buildReplayTimelineMetadata(steps);
    const coldStartStateBySecond = buildColdStartStatesBySecond(framesResult, timeline.durationSeconds);

    return {
      record,
      processedTicks: steps.length,
      parseErrors: framesResult.errors,
      steps,
      events,
      initialState,
      stateByTick,
      tickFrames,
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
    const tickFrame = frame.tick;
    if (!isCs2TickMasterData(tickFrame.master)) continue;
    let gameState: ReturnType<JSON["parse"]>;
    try {
      gameState = JSON.parse(tickFrame.master.raw);
    } catch {
      continue;
    }
    const processor = new GsiProcessorService();
    processor.processTick(gameState, tickFrame.receivedAtMs);
    map[second] = cloneGsiProcessorState(processor.getState());
  }

  return map;
}

import {
  GsiProcessorService,
  type GsiProcessorEvent,
  type GsiProcessorState,
} from "@cs2helper/gsi-processor";
import type { ProcessorReplayPort } from "../../../application/bench";
import type {
  GsiRecordFile,
  ReadRecordFramesResult,
  ReplayResult,
  ReplayStateSummary,
  ReplayStep,
} from "../../../domain/bench";

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
    let currentFrameEvents: GsiProcessorEvent[] = [];

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
      });
    } finally {
      unsubscribe();
    }

    return {
      record,
      processedTicks: framesResult.frames.length,
      parseErrors: framesResult.errors,
      steps,
      events,
      finalState: cloneState(processor.getState()),
    };
  }
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

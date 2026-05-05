import type { MatchEngineAPI } from "../../../../domain/gsiProcessor";
import type { WatcherPayload } from "../../../../domain/csgo";

export interface ReplayFrame {
  tick: WatcherPayload | null;
  timestamp: number;
}

export function replayPollingFrames(engine: MatchEngineAPI, frames: ReplayFrame[]): void {
  for (const frame of frames) {
    engine.processTick(frame.tick, frame.timestamp);
  }
}

import type { TickFrame } from "../../domain";

export interface TickRecordingPort {
  appendFrame(frame: TickFrame): Promise<void>;
  flush?(): Promise<void>;
}

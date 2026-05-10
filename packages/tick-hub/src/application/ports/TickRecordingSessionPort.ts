import type { TickRecordingPort } from "./TickRecordingPort";

export interface TickRecordingSessionPort {
  setSink: (sink: TickRecordingPort | null) => void;
  getSink: () => TickRecordingPort | null;
}

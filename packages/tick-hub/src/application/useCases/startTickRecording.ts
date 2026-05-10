import type { UseCase } from "@cs2helper/shared";
import type { TickRecordingPort } from "../ports/TickRecordingPort";
import type { TickRecordingSessionPort } from "../ports/TickRecordingSessionPort";

/** Ports tuple order: `[recordingSession]`. */
export const startTickRecording: UseCase<
  [TickRecordingSessionPort],
  [sink: TickRecordingPort],
  void
> = ([session], sink) => {
  session.setSink(sink);
};

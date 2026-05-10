import type { AsyncUseCase } from "@cs2helper/shared";
import type { TickRecordingSessionPort } from "../ports/TickRecordingSessionPort";

/** Ports tuple order: `[recordingSession]`. */
export const stopTickRecording: AsyncUseCase<[TickRecordingSessionPort], [], void> = async ([session]) => {
  const sink = session.getSink();
  session.setSink(null);
  if (sink?.flush) {
    await sink.flush();
  }
};
